# SatuKlinik Lite — System Verification Checklist
**Date:** 2026-09-12 06:50 AM  
**Status:** Ready for Testing

Follow these steps to verify the entire system works correctly.

---

## ✅ Step 1: Database Verification (30 seconds)

### Check Database File
```bash
cd /mnt/c/Users/T14/SatuKlinik-Lite
ls -lh apps/api/prisma/dev.db
# Expected: ~96KB file exists
```

### Query Seeded Data
```bash
cd apps/api
npx prisma studio
# Browser opens at http://localhost:5555
# Check tables: Patient (1 row: Budi Santoso), Encounter, Diagnosis, Prescription
# Close with Ctrl+C when done
```

**✅ Pass Criteria:** 
- dev.db exists (90KB+)
- Patient table has 1 row: Budi Santoso, NIK 3174051209900001

---

## ✅ Step 2: Start Development Servers (1 minute)

### Kill Any Existing Processes
```bash
pkill -f "tsx.*index.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
```

### Start Both Servers
```bash
cd /mnt/c/Users/T14/SatuKlinik-Lite
./dev.sh
```

**Expected Output:**
```
🚀 Starting SatuKlinik Lite dev servers...
📡 Starting API server (port 3001)...
✅ API server ready (PID: xxxx)
🌐 Starting Web server (port 3000)...
✅ Web server ready (PID: xxxx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Frontend:  http://localhost:3000
🔌 API:       http://localhost:3001
```

**If servers timeout/hang:**
```bash
# Manual start in separate terminals
# Terminal 1:
cd apps/api && npm run dev

# Terminal 2:
cd apps/web && npm run dev
```

**✅ Pass Criteria:** 
- No error messages in console
- Ports 3000 and 3001 listening

---

## ✅ Step 3: Test API Endpoints (2 minutes)

### 3A: Health Check
```bash
curl http://localhost:3001/health
```
**Expected:**
```json
{"ok":true,"app":"satuklinik-lite-api","fhir":"R4","mode":"mock"}
```

### 3B: Get Patients List
```bash
curl http://localhost:3001/patients
```
**Expected:** JSON array with 1 patient:
```json
[{
  "id": "...",
  "nik": "3174051209900001",
  "name": "Budi Santoso",
  "dob": "1990-12-09T00:00:00.000Z",
  "gender": "male",
  ...
}]
```

### 3C: AI ICD-10 Suggester (Test 1: ISPA)
```bash
curl -X POST http://localhost:3001/ai/suggest-icd \
  -H "Content-Type: application/json" \
  -d '{"subjective":"batuk pilek demam 2 hari, tenggorokan sakit","objective":"TD 120/80, temp 38.2"}'
```
**Expected:** Top 3 suggestions:
```json
{
  "suggestions": [
    {
      "icd10_code": "J06.9",
      "icd10_display": "Acute upper respiratory infection, unspecified (ISPA)",
      "confidence": 0.95,
      "source": "rule-based-whitelist",
      "needs_review": true
    },
    {
      "icd10_code": "J00",
      "icd10_display": "Acute nasopharyngitis [common cold]",
      "confidence": 0.75,
      ...
    },
    ...
  ]
}
```

### 3D: AI ICD-10 Suggester (Test 2: Headache + Vertigo)
```bash
curl -X POST http://localhost:3001/ai/suggest-icd \
  -H "Content-Type: application/json" \
  -d '{"subjective":"pusing berputar 3 hari, nyeri kepala, mual muntah","objective":"TD 140/90"}'
```
**Expected:** Top suggestions include:
- R42 (Dizziness and giddiness) — high confidence
- R51 (Headache) — medium-high
- R11.0 (Nausea) — medium

### 3E: AI ICD-10 Suggester (Test 3: Gastritis)
```bash
curl -X POST http://localhost:3001/ai/suggest-icd \
  -H "Content-Type: application/json" \
  -d '{"subjective":"nyeri ulu hati, kembung, mual setelah makan","objective":"epigastrik tenderness"}'
```
**Expected:** Top suggestion:
- K29.7 (Gastritis, unspecified) — high confidence

**✅ Pass Criteria:**
- All 5 endpoints return valid JSON
- AI suggester returns 3 results with confidence 0.45-0.95
- `needs_review: true` on all suggestions

---

## ✅ Step 4: Test Web UI (5 minutes)

### 4A: Open Frontend
Open browser: **http://localhost:3000**

**Expected:**
- Header: "SatuKlinik Lite" with badge "PWA · FHIR R4"
- Toggle button: "Mode: Online"
- Status pills: "● Online" (green), "0 pending sync" (gray)
- Sidebar: 4 tabs (Dashboard, Pasien, Kunjungan/SOAP, Antrean Sync)
- Main area: Dashboard stats (Pasien terdaftar: 0, Kunjungan hari ini: 8, etc.)

### 4B: Tab 1 — Dashboard
**Check:**
- Stats grid: 4 cards (Pasien terdaftar, Kunjungan hari ini, Pending sync, AI top-3 akurat)
- "Pasien terbaru" table (empty)
- "Auto-ICD Suggester" card with description

**✅ Pass:** All UI elements render correctly

### 4C: Tab 2 — Pasien (Add Patient)
1. Click **"Pasien"** tab
2. Fill form:
   - NIK: `3174020199950001`
   - Nama: `Siti Aminah`
   - Tanggal Lahir: `1995-01-01`
   - Jenis Kelamin: `Perempuan`
   - Alamat: `Jl. Margonda Raya 100 Depok`
   - Telepon: `08123456789`
3. Click **"+ Tambah Pasien"**

**Expected:**
- Patient appears in table below form
- Status pill: `pending` (orange/amber)
- Topbar badge updates: "1 pending sync"

**✅ Pass:** Patient added to IndexedDB, status pending

### 4D: Tab 3 — Kunjungan / SOAP (AI Suggester Test)
1. Click **"Kunjungan / SOAP"** tab
2. Select patient: **"Budi Santoso"** (seeded patient)
3. Fill Subjective:
   ```
   Keluhan: batuk berdahak 3 hari, pilek, demam tinggi malam hari, tenggorokan nyeri saat menelan
   ```
4. Fill Objective (Vital Signs):
   - TD: `120/80`
   - HR: `88`
   - Temp: `38.5`
   - RR: `20`
   - SpO2: `98`
5. Click **"✨ Suggest ICD-10"**

**Expected:**
- Loading state briefly
- 3 recommendation cards appear:
  1. **J06.9** (ISPA) — confidence ~90-95% — badge "rule-based-whitelist"
  2. **J00** (Common cold) — confidence ~65-75%
  3. **R50.9** (Fever) — confidence ~55-65%
- Each card has:
  - Code + display name
  - Confidence bar (colored: green >80%, yellow 60-80%, orange <60%)
  - "needs_review" warning badge
  - "Pakai ✓" button

6. Click **"Pakai ✓"** on J06.9 (ISPA)

**Expected:**
- Card moves to "Diagnosis terkonfirmasi" section
- Badge `[primary]` appears on first diagnosis

**✅ Pass:** AI suggester returns valid results, user can confirm diagnosis

### 4E: Tab 3 — Complete SOAP Entry
1. Fill Assessment: `ISPA (Infeksi Saluran Pernapasan Akut)`
2. Fill Plan:
   ```
   - Paracetamol 500mg 3x1 PRN demam
   - Amoxicillin 500mg 3x1 selama 5 hari
   - Istirahat cukup, minum air hangat
   - Kontrol 3 hari jika tidak membaik
   ```
3. Click **"💾 Simpan SOAP"**

**Expected:**
- Success message or encounter appears in list
- Status: `pending` (offline mode)

**✅ Pass:** SOAP entry saved to IndexedDB

### 4F: Tab 4 — Antrean Sync (Offline → Online Flow)
1. Click **"Antrean Sync"** tab
2. **Expected:** Table shows:
   - Row 1: Siti Aminah (Patient) — status `pending`
   - Row 2: Budi Santoso (Encounter) — status `pending`
3. Click **"Sync Sekarang"** button

**Expected:**
- Loading state
- Success message: "Sync OK: pushed=2 → Bundle FHIR transaction berisi 2 resources..."
- Status changes: `pending` → `synced` (green pills)
- Topbar badge: "0 pending sync"

**✅ Pass:** Sync engine creates FHIR Bundle and updates status

---

## ✅ Step 5: Test Offline Mode (3 minutes)

### 5A: Simulate Offline
1. **Dashboard** → click toggle "Mode: Online"
2. **Expected:** Button text changes to "Mode: Offline", status pill "● Offline" (gray)

### 5B: Add Patient Offline
1. **Tab Pasien** → add new patient:
   - NIK: `3174051010880003`
   - Nama: `Agus Wijaya`
   - (fill other fields)
2. Click **"+ Tambah Pasien"**

**Expected:**
- Patient added with status `pending`
- Topbar: "1 pending sync"

### 5C: Go Back Online
1. Toggle "Mode: Offline → Online"
2. **Tab Antrean Sync** → click "Sync Sekarang"

**Expected:**
- Agus Wijaya synced → status `synced`
- Bundle includes Patient resource

**✅ Pass:** Offline-first flow works, outbox pattern syncs when online

---

## ✅ Step 6: Test PWA Capabilities (2 minutes)

### 6A: Check Manifest
Open browser DevTools:
1. **Application** tab → **Manifest**
2. **Expected:**
   - Name: "SatuKlinik Lite"
   - Short name: "SatuKlinik"
   - Start URL: "/"
   - Theme color: #0f172a
   - Icons: 192x192, 512x512 (SVG)

### 6B: Check Service Worker
1. **Application** tab → **Service Workers**
2. **Expected:**
   - sw.js registered
   - Status: "activated and is running"
   - Scope: "/"

### 6C: Test Install Prompt (Desktop Chrome)
1. Address bar → look for ⊕ install icon (right side)
2. Click → "Install SatuKlinik Lite?"
3. Accept → app opens in standalone window

**✅ Pass:** PWA manifest valid, service worker active, installable

### 6D: Test Offline Caching (Optional)
1. **Application** → **Service Workers** → check "Offline"
2. Refresh page (Ctrl+R)
3. **Expected:** Page still loads (cached by service worker)

**✅ Pass:** Offline caching works

---

## ✅ Step 7: Inspect FHIR Bundle (2 minutes)

### 7A: Check Sync Endpoint Response
1. Browser DevTools → **Network** tab
2. **Tab Antrean Sync** → click "Sync Sekarang"
3. Find request: `POST /sync/push`
4. Click → **Response** tab

**Expected JSON Structure:**
```json
{
  "pushed": 2,
  "bundle": {
    "resourceType": "Bundle",
    "type": "transaction",
    "entry": [
      {
        "fullUrl": "urn:uuid:...",
        "resource": {
          "resourceType": "Patient",
          "identifier": [
            {
              "system": "https://fhir.kemkes.go.id/id/nik",
              "value": "3174020199950001"
            }
          ],
          "name": [{"text": "Siti Aminah"}],
          "gender": "female",
          "birthDate": "1995-01-01"
        },
        "request": {
          "method": "POST",
          "url": "Patient"
        }
      },
      {
        "resource": {
          "resourceType": "Encounter",
          "status": "finished",
          "class": {...},
          "subject": {"reference": "urn:uuid:..."}
        },
        "request": {
          "method": "POST",
          "url": "Encounter"
        }
      }
    ]
  },
  "mode": "mock"
}
```

**Verify:**
- ✅ `resourceType: "Bundle"`
- ✅ `type: "transaction"`
- ✅ Patient identifier system: `https://fhir.kemkes.go.id/id/nik`
- ✅ Each entry has `resource` + `request.method` + `request.url`
- ✅ `mode: "mock"` (sandbox mode)

**✅ Pass:** Bundle is valid FHIR R4 transaction format

---

## 📊 Final Verification Summary

| Component                  | Test                          | Status |
|----------------------------|-------------------------------|--------|
| Database                   | dev.db exists + seeded        | ⬜     |
| API Server                 | Health check responds         | ⬜     |
| API Patients               | GET /patients returns data    | ⬜     |
| AI Suggester (ISPA)        | Returns J06.9 top result      | ⬜     |
| AI Suggester (Headache)    | Returns R51 in top 3          | ⬜     |
| AI Suggester (Gastritis)   | Returns K29.7 top result      | ⬜     |
| Web UI - Dashboard         | Stats render correctly        | ⬜     |
| Web UI - Pasien            | Add patient → pending status  | ⬜     |
| Web UI - SOAP              | AI suggest → 3 recommendations| ⬜     |
| Web UI - Sync              | Sync → Bundle transaction     | ⬜     |
| Offline Mode               | Add offline → sync online     | ⬜     |
| PWA Manifest               | Valid manifest + icons        | ⬜     |
| Service Worker             | Registered + active           | ⬜     |
| PWA Install                | "Add to Home Screen" works    | ⬜     |
| FHIR Bundle                | Valid R4 transaction format   | ⬜     |

---

## 🐛 Troubleshooting

### Problem: API server hangs/timeout
**Solution:**
```bash
# Kill and restart manually
pkill -f "tsx.*index.ts"
cd apps/api
npm run dev
# Keep terminal open, watch for errors
```

### Problem: Web shows "Failed to fetch API"
**Check:**
1. API server running? `curl http://localhost:3001/health`
2. CORS issue? Check browser console (should be allowed in dev)
3. Wrong API URL? Check `apps/web/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Problem: Database empty (no seeded patient)
**Solution:**
```bash
cd apps/api
npx tsx prisma/seed.ts
# Should output: "Seeded: 1 patient (Budi Santoso)"
```

### Problem: Service worker not registering
**Check:**
1. Browser console for errors
2. Must be http://localhost or https:// (not IP address for SW)
3. File exists? `ls apps/web/public/sw.js`

### Problem: PWA install prompt not showing
**Note:** 
- Chrome requires HTTPS in production (localhost is OK)
- Firefox doesn't show install prompt (manual: Menu → Install)
- iOS Safari: use "Share → Add to Home Screen" instead

---

## ✅ All Tests Passed? You're Ready!

If all checkboxes above are ✅, your system is **production-ready for demo**.

**Next steps:**
1. Practice the 4 demo scenarios (15 minutes)
2. Read DEPLOYMENT.md demo script (Slide 3: Live Demo)
3. Prepare proposal document referencing pain points from DEPLOYMENT.md
4. Optional: Deploy to public URL (Vercel + Railway) for easier juri access

**Good luck with KOMPRES 16! 🚀**
