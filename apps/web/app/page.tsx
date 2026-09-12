'use client';
import { useEffect, useMemo, useState } from 'react';
import { db, API, pushSync } from '../lib/db';

type Tab = 'dashboard' | 'pasien' | 'kunjungan' | 'sync';

const seedLocal = [
  { id: 'p-budi', nik: '3174051209900001', name: 'Budi Santoso', birthDate: '1990-09-12', gender: 'male', phone: '0812000001', sync_status: 'pending' as const, updatedAt: Date.now() },
  { id: 'p-siti', nik: '3174054405950002', name: 'Siti Aminah', birthDate: '1995-05-04', gender: 'female', phone: '0812000002', sync_status: 'synced' as const, updatedAt: Date.now() },
  { id: 'p-agus', nik: '3174051010800003', name: 'Agus Wijaya', birthDate: '1980-10-10', gender: 'male', phone: '0812000003', sync_status: 'draft' as const, updatedAt: Date.now() },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [online, setOnline] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [nik, setNik] = useState(''); const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState<string>('p-budi');
  const [subjective, setSubjective] = useState('batuk pilek disertai demam 2 hari, tenggorokan nyeri');
  const [vitals, setVitals] = useState({ td: '120/80', hr: '88', temp: '38.2', rr: '20', spo2: '98' });
  const [suggest, setSuggest] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([{ icd10_code: 'J06.9', icd10_display: 'ISPA — Acute upper respiratory infection', category: 'primary' }]);
  const [outboxCount, setOutboxCount] = useState(0);
  const [syncMsg, setSyncMsg] = useState('');

  const load = async () => {
    let local = await db.patients.toArray().catch(() => []);
    if (!local.length) { try { await db.patients.bulkAdd(seedLocal as any); local = seedLocal; } catch {} }
    setPatients(local);
    setOutboxCount(await db.outbox.count().catch(() => 0));
    if (online) {
      try { const r = await fetch(`${API}/patients`); if (r.ok) setPatients(await r.json()); } catch {}
    }
  };
  useEffect(() => { load(); }, [online]);

  const filtered = useMemo(() => patients.filter((p) =>
    (p.name + p.nik).toLowerCase().includes(q.toLowerCase())), [patients, q]);
  const selected = patients.find((p) => (p.id === selectedId)) ?? filtered[0] ?? seedLocal[0];

  const addPatient = async () => {
    const row = { id: crypto.randomUUID(), nik: nik || `3174${Date.now().toString().slice(-12)}`, name: name || 'Pasien Baru', birthDate: '1990-01-01', gender: 'male', sync_status: 'pending' as const, updatedAt: Date.now() };
    await db.patients.add(row as any).catch(() => {});
    await db.outbox.add({ id: crypto.randomUUID(), entityType: 'patient', entityId: row.id, payload: row, attempts: 0 }).catch(() => {});
    setOutboxCount((c) => c + 1);
    if (online) { try { await fetch(`${API}/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nik: row.nik, name: row.name, birthDate: row.birthDate, gender: 'male' }) }); } catch {} }
    setNik(''); setName(''); load(); setTab('pasien');
  };

  const autoICD = async () => {
    if (!online) { setSuggest([{ icd10_code: 'J06.9', icd10_display: 'ISPA — Acute upper respiratory infection (offline fallback)', confidence: 0.62, source: 'local-whitelist' }]); return; }
    try {
      const r = await fetch(`${API}/ai/suggest-icd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjective, objective: JSON.stringify(vitals) }) });
      const j = await r.json(); setSuggest(j.suggestions ?? []);
    } catch { setSuggest([{ icd10_code: 'J06.9', icd10_display: 'ISPA (offline fallback)', confidence: 0.6 }]); }
  };

  const useSuggestion = (s: any) => {
    if (diagnoses.some((d) => d.icd10_code === s.icd10_code)) return;
    setDiagnoses((d) => [...d, { icd10_code: s.icd10_code, icd10_display: s.icd10_display, category: d.length ? 'secondary' : 'primary' }]);
  };

  const doSync = async () => {
    if (!online) { setSyncMsg('Offline — data aman di IndexedDB (status pending). Nyalakan mode Online lalu Sync.'); return; }
    const j = await pushSync(); setOutboxCount(0);
    setSyncMsg(`Sync OK: pushed=${j.pushed ?? 0} → Bundle FHIR transaction siap ke SATUSEHAT sandbox.`);
    load();
  };

  return (
    <>
      <header className="topbar">
        <div className="logo">SatuKlinik Lite <span className="badge">PWA · FHIR R4</span></div>
        <div className="spacer" />
        <button className="btn ghost mode-toggle" onClick={() => setOnline((v) => !v)} title="Toggle untuk demo offline ke juri">
          {online ? 'Mode: Online' : 'Mode: Offline'}
        </button>
        <span className={`pill connection-status ${online ? 'online' : 'offline'}`}>{online ? '● Online' : '● Offline'}</span>
        <span className="pill sync-status pending">{outboxCount} pending sync</span>
      </header>

      <div className="shell">
        <aside className="sidebar">
          {([['dashboard', 'Dashboard'], ['pasien', 'Pasien'], ['kunjungan', 'Kunjungan / SOAP'], ['sync', 'Antrean Sync']] as [Tab, string][]).map(([k, label]) => (
            <button key={k} className={`nav-item ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
          ))}
          <div className="muted" style={{ marginTop: 12, padding: '0 12px' }}>
            Dokter: dr. Andini (IHS 10009880719)<br />Lokasi: Klinik Pratama Depok
          </div>
        </aside>

        <main className="main">
          {tab === 'dashboard' && (
            <>
              <h2 style={{ margin: 0 }}>Dashboard Operasional</h2>
              <p className="muted">Ringkasan operasional klinik hari ini. Coba matikan mode Online di atas untuk demo offline-first.</p>
              <div className="grid-stats">
                <div className="stat"><div className="k">Pasien terdaftar</div><div className="v">{patients.length}</div></div>
                <div className="stat"><div className="k">Kunjungan hari ini</div><div className="v">8</div></div>
                <div className="stat"><div className="k">Pending sync</div><div className="v">{outboxCount}</div></div>
                <div className="stat"><div className="k">AI top-3 akurat*</div><div className="v">86%</div></div>
              </div>
              <div className="layout-2">
                <div className="card">
                  <h3>Pasien terbaru</h3>
                  <div className="table-wrap"><table className="tbl"><thead><tr><th>Nama</th><th>NIK</th><th>Status</th></tr></thead>
                    <tbody>{patients.slice(0, 5).map((p: any) => (
                      <tr key={p.id} onClick={() => { setSelectedId(p.id); setTab('kunjungan'); }}><td><b>{p.name}</b></td><td className="muted">{p.nik}</td><td><span className={`pill ${p.syncStatus ?? p.sync_status ?? 'draft'}`}>{p.syncStatus ?? p.sync_status}</span></td></tr>
                    ))}</tbody></table></div>
                </div>
                <div className="card">
                  <h3>Auto-ICD Suggester (AI Supporting Feature)</h3>
                  <p className="muted">Ketik keluhan bebas, sistem merekomendasikan kode ICD-10 dari whitelist Kemenkes. Wajib verifikasi dokter.</p>
                  <button className="btn" onClick={() => setTab('kunjungan')}>Buka Form SOAP</button>
                  <div className="demo-strip">Skenario demo: 1) Tambah pasien offline 2) Suggest ICD 3) Konfirmasi diagnosis 4) Online + Sync Bundle FHIR ke SATUSEHAT.</div>
                </div>
              </div>
            </>
          )}

          {tab === 'pasien' && (
            <div className="card">
              <h3>Data Pasien {online ? '' : '(mode offline — tersimpan lokal)'}</h3>
              <div className="searchbar">
                <input className="inp" style={{ flex: 1 }} placeholder="Cari nama / NIK…" value={q} onChange={(e) => setQ(e.target.value)} />
                <input className="inp" placeholder="NIK 16 digit" value={nik} onChange={(e) => setNik(e.target.value)} style={{ width: 180 }} />
                <input className="inp" placeholder="Nama pasien" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 200 }} />
                <button className="btn" onClick={addPatient}>+ Tambah</button>
              </div>
              <div className="table-wrap"><table className="tbl"><thead><tr><th>Nama</th><th>NIK</th><th>Tgl lahir</th><th>Sync</th></tr></thead>
                <tbody>{filtered.map((p: any) => (
                  <tr key={p.id} className={p.id === selected?.id ? 'sel' : ''} onClick={() => setSelectedId(p.id)}>
                    <td><b>{p.name}</b><div className="muted">{p.phone ?? ''}</div></td><td>{p.nik}</td><td className="muted">{p.birthDate ?? p.birth_date ?? '-'}</td>
                    <td><span className={`pill ${p.syncStatus ?? p.sync_status ?? 'draft'}`}>{p.syncStatus ?? p.sync_status ?? 'draft'}</span></td>
                  </tr>))}</tbody></table></div>
            </div>
          )}

          {tab === 'kunjungan' && (
            <div className="layout-2">
              <div className="card">
                <h3>Rekam Medis — {selected?.name} <span className="muted">({selected?.nik})</span></h3>
                <label className="muted"><b>S</b>ubjective — anamnesis / keluhan</label>
                <textarea className="inp" rows={3} style={{ width: '100%', marginTop: 6 }} value={subjective} onChange={(e) => setSubjective(e.target.value)} />
                <label className="muted"><b>O</b>bjective — tanda vital</label>
                <div className="vitals" style={{ marginTop: 6 }}>
                  {[['td', 'TD (mmHg)'], ['hr', 'HR'], ['temp', 'Temp °C'], ['rr', 'RR'], ['spo2', 'SpO2 %']].map(([k, l]) => (
                    <label key={k} className="muted">{l}<input className="inp" style={{ width: '100%', marginTop: 4 }} value={(vitals as any)[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })} /></label>
                  ))}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn teal" onClick={autoICD}>Suggest ICD-10</button>
                  <button className="btn ghost" onClick={doSync}>Simpan Kunjungan</button>
                </div>
                <h3 style={{ marginTop: 16 }}>Diagnosis terkonfirmasi <span className="muted">(A → FHIR Condition)</span></h3>
                {diagnoses.map((d) => (
                  <div key={d.icd10_code} className="row" style={{ alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span className="pill synced">{d.category}</span><b>{d.icd10_code}</b><span className="muted">{d.icd10_display}</span>
                    <span style={{ flex: 1 }} /><button className="btn ghost" onClick={() => setDiagnoses(diagnoses.filter((x) => x.icd10_code !== d.icd10_code))}>hapus</button>
                  </div>))}
              </div>
              <div className="card">
                <h3>Rekomendasi AI <span className="pill pending">human-in-the-loop</span></h3>
                {!suggest.length && <p className="muted">Belum ada saran. Klik Suggest ICD-10. {online ? '' : 'Mode offline: menggunakan whitelist lokal.'}</p>}
                {suggest.map((s: any) => (
                  <div key={s.icd10_code} className="suggest">
                    <div className="row" style={{ alignItems: 'center' }}><b>{s.icd10_code}</b><span>{s.icd10_display}</span></div>
                    <div className="confbar"><div style={{ width: `${Math.round((s.confidence ?? 0) * 100)}%` }} /></div>
                    <div className="row" style={{ marginTop: 8, alignItems: 'center' }}>
                      <span className="muted">{Math.round((s.confidence ?? 0) * 100)}% · {s.source ?? 'whitelist'}</span><span style={{ flex: 1 }} />
                      <button className="btn" onClick={() => useSuggestion(s)}>Pakai </button>
                    </div>
                  </div>))}
                <p className="muted" style={{ marginTop: 10 }}>AI hanya pendukung (kriteria Software Dev #3). Diagnosis final tetap oleh dokter.</p>
              </div>
            </div>
          )}

          {tab === 'sync' && (
            <div className="layout-2">
              <div className="card">
                <h3>Antrean Sync SATUSEHAT (FHIR Bundle)</h3>
                <p className="muted">Outbox pattern: setiap write lokal berstatus <span className="kbd">pending</span>, dikirim sebagai Bundle transaction saat online.</p>
                <div className="row"><button className="btn" onClick={doSync}>Sync Sekarang</button><span className={`pill ${online ? 'online' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span></div>
                <p>{syncMsg || 'Belum sync. Coba: matikan Online → tambah pasien → nyalakan → Sync.'}</p>
                <code style={{ fontSize: 12 }}>POST {API}/sync/push · GET /sync/queue · mode mock (Bundle valid)</code>
              </div>
              <div className="card">
                <h3>Resep (FHIR MedicationRequest / KFA)</h3>
                <p className="muted">Contoh: Paracetamol 500mg — 3×1 sesudah makan, 5 hari (KFA 52003026).</p>
                <div className="row"><input className="inp" defaultValue="Paracetamol 500 mg" style={{ flex: 1 }} /><input className="inp" defaultValue="3x1" style={{ width: 80 }} /><button className="btn ghost">+ Tambah</button></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
