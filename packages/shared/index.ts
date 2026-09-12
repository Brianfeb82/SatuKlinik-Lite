// Tipe bersama FE-BE biar kontrak FHIR konsisten
export type SyncStatus = 'draft' | 'pending' | 'synced' | 'error';
export interface SuggestResult { icd10_code: string; icd10_display: string; confidence: number; needs_review?: boolean; }
export const SATUSEHAT_SYSTEMS = {
  nik: 'https://fhir.kemkes.go.id/id/nik',
  icd10: 'http://hl7.org/fhir/sid/icd-10',
  kfa: 'http://sys-ids.kemkes.go.id/kfa',
};
