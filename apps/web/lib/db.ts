import Dexie, { Table } from 'dexie';

// Offline-first store: mirror 4 tabel + outbox. Semua write -> status pending -> sync saat online.
export interface LocalPatient { id: string; nik: string; name: string; birthDate: string; gender: string; phone?: string; sync_status: 'draft'|'pending'|'synced'|'error'; updatedAt: number; }
export interface LocalEncounter { id: string; patientId: string; subjective: string; objective: string; practitionerIhsId: string; locationId: string; sync_status: 'draft'|'pending'|'synced'|'error'; updatedAt: number; }
export interface Outbox { id: string; entityType: string; entityId: string; payload: any; attempts: number; }

class KlinikDB extends Dexie {
  patients!: Table<LocalPatient, string>;
  encounters!: Table<LocalEncounter, string>;
  outbox!: Table<Outbox, string>;
  constructor() {
    super('satuklinik-lite');
    this.version(1).stores({ patients: 'id, nik', encounters: 'id, patientId', outbox: 'id, entityType' });
  }
}
export const db = new KlinikDB();
export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function pushSync() {
  const items = await db.outbox.toArray();
  if (!items.length) return { pushed: 0 };
  try {
    const res = await fetch(`${API}/sync/push`, { method: 'POST' });
    const json = await res.json();
    if (json.pushed) await db.outbox.clear();
    return json;
  } catch (e) {
    return { pushed: 0, offline: true };
  }
}
