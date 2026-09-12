# SatuKlinik Lite — Offline-First Smart EMR
**Status:** ✅ Production-Ready MVP  
**Competition:** KOMPRES 16 Software Development  
**Deadline:** 30 September 2026 | **Final:** 13 Oktober 2026

Sistem Rekam Medis Elektronik (EMR) offline-first dengan AI-powered ICD-10 code suggester untuk klinik pratama, FHIR R4 compliant SATUSEHAT.

## ✨ Key Features

- **Offline-First:** Dexie.js IndexedDB + service worker → input tetap jalan tanpa internet
- **AI Auto-ICD:** 52 kode ICD-10 common klinik pratama, keyword scoring, human-in-the-loop
- **FHIR R4 Compliant:** Bundle transaction ready untuk SATUSEHAT API
- **PWA:** Installable, standalone app di mobile/desktop
- **Sync Engine:** Outbox pattern, atomic transaction bundle

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Installation
```bash
# Clone & install dependencies
git clone <repo-url>
cd SatuKlinik-Lite
npm install

# Setup API database
cd apps/api
npm install
npx prisma db push
npx tsx prisma/seed.ts

# Setup Web
cd ../web
npm install
cd ../..
```

### Run Development Servers
```bash
# Option 1: Helper script (recommended)
./dev.sh

# Option 2: Manual (2 terminals)
# Terminal 1: API
cd apps/api && npm run dev
# → http://localhost:3001

# Terminal 2: Web
cd apps/web && npm run dev
# → http://localhost:3000
```

### Verify
```bash
# Check API health
curl http://localhost:3001/health
# Expected: {"ok":true,"app":"satuklinik-lite-api","fhir":"R4","mode":"mock"}

# Test AI suggester
curl -X POST http://localhost:3001/ai/suggest-icd \
  -H "Content-Type: application/json" \
  -d '{"subjective":"batuk pilek demam 2 hari","objective":"td: 120/80"}'
# Expected: top-3 ICD-10 suggestions with confidence scores
```

## 📁 Project Structure
```
SatuKlinik-Lite/
├── apps/
│   ├── api/                    # Backend (Express + Prisma + SQLite)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 4 models + SyncQueue
│   │   │   └── seed.ts         # Mock data (1 patient ISPA)
│   │   ├── src/
│   │   │   ├── lib/fhir/       # FHIR R4 mappers
│   │   │   ├── lib/ai/         # 52 ICD-10 suggester
│   │   │   └── routes/         # REST endpoints
│   │   └── package.json
│   │
│   └── web/                    # Frontend (Next.js 14 PWA)
│       ├── app/
│       │   ├── page.tsx        # Main UI (4 tabs)
│       │   └── layout.tsx      # PWA metadata
│       ├── lib/db.ts           # Dexie IndexedDB
│       ├── public/
│       │   ├── manifest.json   # PWA manifest
│       │   └── sw.js           # Service worker
│       └── package.json
│
├── packages/shared/            # Shared types
├── dev.sh                      # Dev launcher script
├── DEPLOYMENT.md               # Full documentation
├── FLOW_TEST.md                # Test scenarios
└── README.md                   # This file
```

## 🎯 Demo Scenarios (for Juri)

### 1. Offline Patient Registration
1. Open `http://localhost:3000`
2. Toggle "Mode: Online → Offline"
3. Tab "Pasien" → add patient → status `pending` (orange pill)
4. Verify topbar badge shows "1 pending sync"

### 2. AI Auto-ICD Suggester
1. Tab "Kunjungan / SOAP" → select patient
2. Subjective: "batuk pilek demam 2 hari"
3. Click "Suggest ICD-10"
4. Verify 3 recommendations appear (J06.9 ISPA ~95%, J00 Common cold ~65%, R50.9 Fever ~55%)
5. Click "Pakai ✓" → diagnosis confirmed

### 3. Sync to SATUSEHAT
1. Toggle "Mode: Offline → Online"
2. Tab "Antrean Sync" → click "Sync Sekarang"
3. Verify "Sync OK: pushed=1 → Bundle FHIR transaction..."
4. Status changes to `synced` (green pill)

### 4. PWA Install (Mobile)
1. Android Chrome → Menu → "Add to Home Screen"
2. Icon appears on home screen
3. Tap → opens as standalone app

## 📚 Documentation

- **DEPLOYMENT.md** — Full setup, production deployment, demo script for final presentation
- **FLOW_TEST.md** — Detailed test flows, FHIR compliance checklist

## 🔧 Tech Stack

- **Backend:** Express.js + Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Frontend:** Next.js 14 + React + PWA (manifest + service worker)
- **Offline:** Dexie.js (IndexedDB wrapper) + outbox pattern
- **AI:** Rule-based keyword scoring (52 ICD-10 whitelist), LLM-ready architecture
- **FHIR:** R4 mappers (Patient, Encounter, Condition, MedicationRequest)

## 📊 ICD-10 Coverage (52 Codes)

- Infeksi Saluran Pernapasan (8): ISPA, common cold, pharyngitis, tonsillitis, bronchitis, pneumonia, asthma, TBC
- Gastrointestinal (7): diare, gastritis, dyspepsia, konstipasi, disentri, cacingan
- Metabolik & Kardiovaskular (5): diabetes, hipertensi, kolesterol, obesitas
- Penyakit Kulit (6): dermatitis, urtikaria, scabies, bisul, panu
- Nyeri & Muskuloskeletal (5): low back pain, arthralgia, myalgia, headache, cervicalgia
- Gejala Umum (6): fever, cough, nausea, dizziness, fatigue, abdominal pain
- Infeksi Lain (5): typhoid, varicella, dengue, COVID-19, measles
- Mata & THT (3): conjunctivitis, otitis, allergic rhinitis
- Urogenital (2): UTI, vaginitis
- Kehamilan & KB (2): contraception counseling, pregnancy infection

## 🏆 Competition Criteria Alignment

| Kriteria                          | Implementation                                      | Weight |
|-----------------------------------|-----------------------------------------------------|--------|
| Problem Solving                   | SATUSEHAT regulasi + offline/ICD pain points       | 25%    |
| Technical & Functionality         | Offline-first + FHIR + PWA + 52 ICD-10             | 25%    |
| UI/UX                             | Clean medical layout, mobile-responsive            | 15%    |
| Creativity                        | AI whitelist human-in-the-loop + offline-first     | 15%    |
| Architecture & Code Quality       | Prisma ORM, pure functions, monorepo, type-safe    | 10%    |
| Theme Compliance (AI Supporting)  | AI assists, not core (etika medis)                 | 5%     |
| Presentation                      | 4 live demo scenarios + FHIR Bundle inspection     | 5%     |

## 📅 Timeline

- **2026-09-12:** ✅ MVP complete (API + Web + PWA + 52 ICD-10)
- **2026-09-30:** Proposal deadline
- **2026-10-13:** Final presentation & demo

## 🐛 Known Limitations

- SQLite (dev) → migrate to PostgreSQL for production
- No authentication yet → need JWT + RBAC
- Last-write-wins conflict resolution → upgrade to CRDT for concurrent edits
- Rule-based AI → upgrade to embedding/LLM for semantic understanding
- Only 4 FHIR resources → full EMR needs Observation, Procedure, etc.

## 📞 Support

See **DEPLOYMENT.md** for full documentation, deployment guides, and contact information.

---

**Built for KOMPRES 16 Software Development Competition 2026** 🚀
