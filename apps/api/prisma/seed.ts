// Seed: pasien mock + referensi ICD-10/KFA. Jalan: npm run db:seed
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SatuKlinik Lite...');
  const p1 = await prisma.patient.upsert({
    where: { nik: '3174051209900001' },
    update: {},
    create: { nik: '3174051209900001', name: 'Budi Santoso', birthDate: '1990-09-12', gender: 'male', phone: '0812000001', address: 'Jl. Merdeka No.1, Depok', syncStatus: 'pending' },
  });
  const enc = await prisma.encounter.create({
    data: {
      patientId: p1.id, practitionerIhsId: '10009880719', locationId: '10000001',
      status: 'finished', periodStart: new Date(), periodEnd: new Date(),
      subjective: 'batuk pilek disertai demam 2 hari, tenggorokan nyeri',
      objective: JSON.stringify({ td: '120/80', hr: 88, temp: 38.2, rr: 20, spo2: 98 }),
      syncStatus: 'pending',
    },
  });
  await prisma.diagnosis.create({
    data: { encounterId: enc.id, patientId: p1.id, icd10Code: 'J06.9', icd10Display: 'Acute upper respiratory infection, unspecified (ISPA)', category: 'primary', syncStatus: 'pending' },
  });
  await prisma.prescription.create({
    data: {
      encounterId: enc.id, patientId: p1.id, kfaCode: '52003026', medicationName: 'Paracetamol 500 mg Tablet',
      dosageInstruction: '3x sehari 1 tablet sesudah makan', doseQuantity: 1, doseUnit: 'TAB', frequencyPerDay: 3, durationDays: 5, syncStatus: 'pending',
    },
  });
  console.log('Seed OK:', p1.id, enc.id);
}
main().finally(() => prisma.$disconnect());
