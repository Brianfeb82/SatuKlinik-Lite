import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { suggestICD } from '../lib/ai/suggester.js';
import { toFhirPatient, toFhirEncounter, toFhirCondition, toFhirMedicationRequest, toTransactionBundle } from '../lib/fhir/mappers.js';

export const r = Router();
const uuid = z.string().uuid();

// ---- PATIENTS ----
r.get('/patients', async (_req, res) => res.json(await prisma.patient.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })));
r.post('/patients', async (req, res) => {
  const s = z.object({ nik: z.string().length(16), name: z.string().min(2), birthDate: z.string(), gender: z.enum(['male','female','other','unknown']), phone: z.string().optional(), address: z.string().optional() }).parse(req.body);
  const row = await prisma.patient.create({ data: { ...s, birthDate: new Date(s.birthDate), syncStatus: 'pending' } });
  await prisma.syncQueue.create({ data: { entityType: 'patient', entityId: row.id, payload: toFhirPatient({ nik: row.nik, name: row.name, birthDate: row.birthDate.toISOString().slice(0,10), gender: row.gender, phone: row.phone }) } });
  res.status(201).json(row);
});

// ---- ENCOUNTERS ----
r.get('/encounters', async (req, res) => {
  const patientId = req.query.patientId as string | undefined;
  res.json(await prisma.encounter.findMany({ where: patientId ? { patientId } : undefined, orderBy: { createdAt: 'desc' }, take: 50, include: { diagnoses: true, prescriptions: true } }));
});
r.post('/encounters', async (req, res) => {
  const s = z.object({
    patientId: uuid, practitionerIhsId: z.string().min(3), locationId: z.string().min(2),
    subjective: z.string().optional(), objective: z.any().optional(),
  }).parse(req.body);
  const row = await prisma.encounter.create({ data: { patientId: s.patientId, practitionerIhsId: s.practitionerIhsId, locationId: s.locationId, subjective: s.subjective, objective: s.objective ?? {}, periodStart: new Date(), status: 'in_progress', syncStatus: 'pending' } });
  res.status(201).json(row);
});
r.post('/encounters/:id/finish', async (req, res) => {
  const row = await prisma.encounter.update({ where: { id: req.params.id }, data: { status: 'finished', periodEnd: new Date(), syncStatus: 'pending' }, include: { patient: true } });
  // queue Encounter FHIR (butuh satusehatId pasien — mock fallback)
  const pid = (row.patient as any).satusehatId ?? (row.patient as any).id;
  await prisma.syncQueue.create({ data: { entityType: 'encounter', entityId: row.id, payload: toFhirEncounter({ practitionerIhsId: row.practitionerIhsId, locationId: row.locationId, periodStart: row.periodStart.toISOString(), periodEnd: row.periodEnd?.toISOString() }, pid, (row.patient as any).name) } });
  res.json(row);
});

// ---- DIAGNOSES ----
r.post('/diagnoses', async (req, res) => {
  const s = z.object({ encounterId: uuid, patientId: uuid, icd10Code: z.string().min(1), icd10Display: z.string().min(2), category: z.enum(['primary','secondary']).default('primary') }).parse(req.body);
  const row = await prisma.diagnosis.create({ data: { ...s, syncStatus: 'pending' } });
  res.status(201).json(row);
});

// ---- PRESCRIPTIONS ----
r.post('/prescriptions', async (req, res) => {
  const s = z.object({
    encounterId: uuid, patientId: uuid, kfaCode: z.string(), medicationName: z.string(),
    dosageInstruction: z.string(), doseQuantity: z.number(), doseUnit: z.string(), frequencyPerDay: z.number().int(), durationDays: z.number().int(),
  }).parse(req.body);
  const row = await prisma.prescription.create({ data: { ...s, syncStatus: 'pending' } });
  res.status(201).json(row);
});

// ---- AI: Auto-ICD suggester ----
r.post('/ai/suggest-icd', async (req, res) => {
  const s = z.object({ subjective: z.string().min(3), objective: z.string().optional().default(''), topK: z.number().optional().default(3) }).parse(req.body);
  // TODO: jika GEMINI_API_KEY ada -> suggestWithLLM; sekarang rule-based whitelist (offline-safe)
  res.json({ suggestions: suggestICD(s.subjective, s.objective, s.topK), disclaimer: 'Rekomendasi AI wajib diverifikasi dokter (human-in-the-loop).' });
});

// ---- SYNC: outbox push (mock SATUSEHAT, return Bundle) ----
r.get('/sync/queue', async (_req, res) => res.json(await prisma.syncQueue.findMany({ where: { status: { in: ['pending','error'] } }, orderBy: { createdAt: 'asc' }, take: 100 })));
r.post('/sync/push', async (_req, res) => {
  const pending = await prisma.syncQueue.findMany({ where: { status: { in: ['pending','error'] } }, take: 50 });
  if (!pending.length) return res.json({ pushed: 0, bundle: null });
  const bundle = toTransactionBundle(pending.map((q) => q.payload));
  // mode mock: langsung tandai synced + isi satusehat_*_id fake
  if ((process.env.SATUSEHAT_MODE ?? 'mock') === 'mock') {
    await prisma.syncQueue.updateMany({ where: { id: { in: pending.map((p) => p.id) } }, data: { status: 'synced', attempts: { increment: 1 } } });
    return res.json({ pushed: pending.length, bundle, mode: 'mock', note: 'Bundle FHIR valid, siap kirim ke SATUSEHAT sandbox saat kredensial tersedia.' });
  }
  // TODO: real POST ke SATUSEHAT dengan OAuth2 client credentials
  res.json({ pushed: pending.length, bundle, mode: 'real-todo' });
});
