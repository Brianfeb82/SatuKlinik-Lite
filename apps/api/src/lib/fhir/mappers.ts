// FHIR R4 mappers — SATUSEHAT compliant (4 resources inti)
// Input: row DB (Prisma), Output: FHIR JSON. Pure functions -> gampang di-unit-test untuk juri.

export type DbPatient = {
  nik: string; name: string; birth_date?: string; birthDate?: string;
  gender: string; phone?: string | null; satusehat_id?: string | null; satusehatId?: string | null;
};
export type DbEncounter = {
  practitioner_ihs_id?: string; practitionerIhsId?: string;
  location_id?: string; locationId?: string;
  period_start?: string; periodStart?: string;
  period_end?: string | null; periodEnd?: string | null;
  satusehat_encounter_id?: string | null; satusehatEncounterId?: string | null;
};
export type DbDiagnosis = {
  icd10_code?: string; icd10Code?: string;
  icd10_display?: string; icd10Display?: string;
  clinical_status?: string; clinicalStatus?: string;
};
export type DbPrescription = {
  kfa_code?: string; kfaCode?: string;
  medication_name?: string; medicationName?: string;
  dosage_instruction?: string; dosageInstruction?: string;
  dose_quantity?: number; doseQuantity?: number;
  dose_unit?: string; doseUnit?: string;
  frequency_per_day?: number; frequencyPerDay?: number;
  created_at?: string; createdAt?: string;
};

const pick = (...vals: any[]) => vals.find((v) => v !== undefined && v !== null);

export function toFhirPatient(p: DbPatient) {
  return {
    resourceType: 'Patient',
    identifier: [{ use: 'official', system: 'https://fhir.kemkes.go.id/id/nik', value: p.nik }],
    name: [{ use: 'official', text: p.name }],
    gender: p.gender,
    birthDate: pick((p as any).birth_date, (p as any).birthDate),
    telecom: p.phone ? [{ system: 'phone', value: p.phone, use: 'mobile' }] : undefined,
  };
}

export function toFhirEncounter(e: DbEncounter, patientSatusehatId: string, patientName: string) {
  const practitioner = pick((e as any).practitioner_ihs_id, (e as any).practitionerIhsId);
  const location = pick((e as any).location_id, (e as any).locationId);
  return {
    resourceType: 'Encounter',
    status: 'finished',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
    subject: { reference: `Patient/${patientSatusehatId}`, display: patientName },
    participant: [{
      type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }],
      individual: { reference: `Practitioner/${practitioner}` },
    }],
    period: {
      start: pick((e as any).period_start, (e as any).periodStart),
      end: pick((e as any).period_end, (e as any).periodEnd),
    },
    location: [{ location: { reference: `Location/${location}` } }],
  };
}

export function toFhirCondition(d: DbDiagnosis, patientSatusehatId: string, encounterSatusehatId: string) {
  return {
    resourceType: 'Condition',
    clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: pick((d as any).clinical_status, (d as any).clinicalStatus, 'active') }] },
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
    code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: pick((d as any).icd10_code, (d as any).icd10Code), display: pick((d as any).icd10_display, (d as any).icd10Display) }] },
    subject: { reference: `Patient/${patientSatusehatId}` },
    encounter: { reference: `Encounter/${encounterSatusehatId}` },
  };
}

export function toFhirMedicationRequest(m: DbPrescription, patientSatusehatId: string, encounterSatusehatId: string) {
  return {
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: { coding: [{ system: 'http://sys-ids.kemkes.go.id/kfa', code: pick((m as any).kfa_code, (m as any).kfaCode), display: pick((m as any).medication_name, (m as any).medicationName) }] },
    subject: { reference: `Patient/${patientSatusehatId}` },
    encounter: { reference: `Encounter/${encounterSatusehatId}` },
    authoredOn: pick((m as any).created_at, (m as any).createdAt, new Date().toISOString()),
    dosageInstruction: [{
      text: pick((m as any).dosage_instruction, (m as any).dosageInstruction),
      timing: { repeat: { frequency: pick((m as any).frequency_per_day, (m as any).frequencyPerDay), period: 1, periodUnit: 'd' } },
      doseAndRate: [{ doseQuantity: { value: Number(pick((m as any).dose_quantity, (m as any).doseQuantity)), unit: pick((m as any).dose_unit, (m as any).doseUnit) } }],
    }],
  };
}

export function toTransactionBundle(resources: any[], baseUrl = 'https://fhir.kemkes.go.id') {
  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: resources.map((r) => ({ fullUrl: `${baseUrl}/${r.resourceType}/${crypto.randomUUID()}`, resource: r, request: { method: 'POST', url: r.resourceType } })),
  };
}
