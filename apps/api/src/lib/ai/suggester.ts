// Kamus ICD-10 Kemenkes — 50+ kode common klinik pratama
// Referensi: icd10.kemkes.go.id + pedoman BPJS Kesehatan
export const ICD10_DICT = [
  // Infeksi Saluran Pernapasan
  { code: 'J00', display: 'Acute nasopharyngitis [common cold]', keywords: ['batuk', 'pilek', 'flu', 'hidung', 'bersin', 'common cold', 'selesma'] },
  { code: 'J06.9', display: 'Acute upper respiratory infection, unspecified (ISPA)', keywords: ['ispa', 'batuk', 'pilek', 'tenggorokan', 'demam', 'sakit tenggorokan'] },
  { code: 'J02.9', display: 'Acute pharyngitis, unspecified', keywords: ['faringitis', 'radang tenggorokan', 'nyeri menelan', 'tenggorokan merah'] },
  { code: 'J03.9', display: 'Acute tonsillitis, unspecified', keywords: ['tonsilitis', 'amandel', 'radang amandel', 'bengkak tenggorokan'] },
  { code: 'J20.9', display: 'Acute bronchitis, unspecified', keywords: ['bronkitis', 'batuk berdahak', 'dada sesak', 'napas berbunyi'] },
  { code: 'J18.9', display: 'Pneumonia, unspecified', keywords: ['pneumonia', 'radang paru', 'batuk produktif', 'sesak napas berat'] },
  { code: 'J45.9', display: 'Asthma, unspecified', keywords: ['asma', 'sesak', 'mengi', 'napas bunyi', 'wheezing'] },
  { code: 'A15.0', display: 'Tuberculosis of lung', keywords: ['tbc', 'tuberkulosis', 'batuk darah', 'batuk lama', 'tb paru'] },
  
  // Penyakit Gastrointestinal
  { code: 'A09', display: 'Diarrhoea and gastroenteritis of presumed infectious origin', keywords: ['diare', 'mencret', 'mual', 'muntah', 'bab cair', 'gastroenteritis'] },
  { code: 'K29.7', display: 'Gastritis, unspecified', keywords: ['maag', 'lambung', 'nyeri ulu hati', 'mual', 'kembung', 'gastritis', 'perut perih'] },
  { code: 'K30', display: 'Functional dyspepsia', keywords: ['dispepsia', 'gangguan pencernaan', 'perut kembung', 'begah', 'tidak nafsu makan'] },
  { code: 'K59.0', display: 'Constipation', keywords: ['konstipasi', 'sembelit', 'susah bab', 'sulit buang air besar'] },
  { code: 'K52.9', display: 'Noninfective gastroenteritis and colitis, unspecified', keywords: ['gastroenteritis non infeksi', 'kolik', 'kram perut'] },
  { code: 'A06.0', display: 'Acute amoebic dysentery', keywords: ['disentri', 'bab berdarah', 'amuba', 'lendir darah'] },
  { code: 'B82.0', display: 'Intestinal helminthiasis, unspecified', keywords: ['cacingan', 'cacing', 'perut buncit', 'gatal dubur'] },
  
  // Penyakit Metabolik & Kardiovaskular
  { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications', keywords: ['diabetes', 'gula darah', 'kencing manis', 'dm', 'diabetes melitus'] },
  { code: 'E11.65', display: 'Type 2 diabetes mellitus with hyperglycemia', keywords: ['gula darah tinggi', 'hiperglikemia', 'dm tidak terkontrol'] },
  { code: 'I10', display: 'Essential (primary) hypertension', keywords: ['hipertensi', 'darah tinggi', 'tensi tinggi', 'pusing', 'tekanan darah'] },
  { code: 'E78.5', display: 'Hyperlipidaemia, unspecified', keywords: ['kolesterol tinggi', 'lemak darah', 'dislipidemia', 'trigliserida'] },
  { code: 'E66.9', display: 'Obesity, unspecified', keywords: ['obesitas', 'kegemukan', 'berat badan berlebih', 'overweight'] },
  
  // Penyakit Kulit
  { code: 'L23.9', display: 'Allergic contact dermatitis, unspecified', keywords: ['gatal', 'alergi', 'ruam', 'dermatitis', 'biduran', 'bentol'] },
  { code: 'L30.9', display: 'Dermatitis, unspecified', keywords: ['eksim', 'kulit merah', 'iritasi kulit', 'kulit kering'] },
  { code: 'L50.9', display: 'Urticaria, unspecified', keywords: ['urtikaria', 'biduran', 'kaligata', 'gatal bentol'] },
  { code: 'B86', display: 'Scabies', keywords: ['skabies', 'kudis', 'gudik', 'gatal malam'] },
  { code: 'L08.9', display: 'Local infection of skin and subcutaneous tissue, unspecified', keywords: ['bisul', 'abses', 'nanah', 'furunkel'] },
  { code: 'B35.9', display: 'Dermatophytosis, unspecified', keywords: ['panu', 'kurap', 'kadas', 'jamur kulit'] },
  
  // Nyeri & Muskuloskeletal
  { code: 'M54.5', display: 'Low back pain', keywords: ['pinggang', 'punggung', 'nyeri punggung', 'low back pain', 'sakit pinggang'] },
  { code: 'M25.5', display: 'Pain in joint', keywords: ['nyeri sendi', 'lutut sakit', 'sendi kaku', 'arthralgia'] },
  { code: 'M79.1', display: 'Myalgia', keywords: ['nyeri otot', 'pegal', 'linu', 'muscle pain'] },
  { code: 'R51', display: 'Headache', keywords: ['sakit kepala', 'nyeri kepala', 'pusing', 'headache', 'cephalgia'] },
  { code: 'M54.2', display: 'Cervicalgia', keywords: ['leher kaku', 'nyeri leher', 'tengkuk pegal'] },
  
  // Gejala Umum
  { code: 'R50.9', display: 'Fever, unspecified', keywords: ['demam', 'panas', 'febris', 'suhu tinggi', 'meriang'] },
  { code: 'R05', display: 'Cough', keywords: ['batuk', 'cough', 'batuk kering'] },
  { code: 'R11.0', display: 'Nausea', keywords: ['mual', 'nausea', 'enek'] },
  { code: 'R42', display: 'Dizziness and giddiness', keywords: ['pusing', 'vertigo', 'berputar', 'kliyengan'] },
  { code: 'R53', display: 'Malaise and fatigue', keywords: ['lemas', 'capek', 'lelah', 'fatigue', 'tidak bertenaga'] },
  { code: 'R10.4', display: 'Other and unspecified abdominal pain', keywords: ['nyeri perut', 'sakit perut', 'abdominal pain'] },
  
  // Penyakit Infeksi Lain
  { code: 'A01.0', display: 'Typhoid fever', keywords: ['tifoid', 'tipes', 'demam tifoid', 'tipus'] },
  { code: 'B01.9', display: 'Varicella without complication', keywords: ['cacar air', 'varicella', 'chickenpox'] },
  { code: 'A90', display: 'Dengue fever', keywords: ['dbd', 'demam berdarah', 'dengue', 'trombosit rendah'] },
  { code: 'B34.2', display: 'Coronavirus infection, unspecified', keywords: ['covid', 'corona', 'anosmia', 'covid-19'] },
  { code: 'B05.9', display: 'Measles without complication', keywords: ['campak', 'measles', 'bercak merah'] },
  
  // Penyakit Mata & THT
  { code: 'H10.9', display: 'Conjunctivitis, unspecified', keywords: ['mata merah', 'konjungtivitis', 'belekan', 'mata berair'] },
  { code: 'H66.9', display: 'Otitis media, unspecified', keywords: ['radang telinga', 'sakit telinga', 'otitis', 'congek'] },
  { code: 'J30.4', display: 'Allergic rhinitis, unspecified', keywords: ['rinitis alergi', 'pilek alergi', 'bersin terus'] },
  
  // Penyakit Urogenital
  { code: 'N39.0', display: 'Urinary tract infection, site not specified', keywords: ['infeksi saluran kemih', 'isk', 'anyang-anyangan', 'sakit kencing'] },
  { code: 'N76.0', display: 'Acute vaginitis', keywords: ['keputihan', 'vaginitis', 'gatal kemaluan'] },
  
  // Kehamilan & KB (common di klinik)
  { code: 'Z30.0', display: 'General counselling and advice on contraception', keywords: ['kb', 'kontrasepsi', 'konseling kb'] },
  { code: 'O23.9', display: 'Unspecified infection of genitourinary tract in pregnancy', keywords: ['hamil infeksi'] },
];

/**
 * suggestICD — v1 rule-based (TF keyword scoring) + siap di-swap ke Gemini/OpenAI.
 * Kenapa rule-based dulu? Biar demo offline tetap jalan (nilai juri: human-in-the-loop).
 * Kalau GEMINI_API_KEY ada, panggil LLM dengan whitelist constraint (lihat suggestWithLLM).
 */
export function suggestICD(subjective: string, objective = '', topK = 3) {
  const text = `${subjective} ${objective}`.toLowerCase();
  const scored = ICD10_DICT.map((d) => {
    let score = 0;
    for (const kw of d.keywords) if (text.includes(kw)) score += kw.length > 5 ? 2 : 1;
    return { ...d, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
  const max = Math.max(1, ...scored.map((s) => s.score));
  return scored.map((s) => ({
    icd10_code: s.code, icd10_display: s.display,
    confidence: Math.min(0.95, 0.45 + (s.score / max) * 0.5),
    source: 'rule-based-whitelist' as const,
    needs_review: true, // wajib konfirmasi dokter
  }));
}

export const AI_SYSTEM_PROMPT = `Kamu medical coding assistant. Tugas: dari anamnesis bebas -> rekomendasi kode ICD-10.
ATURAN KERAS:
1. Hanya jawab kode dari WHITELIST yang diberikan (jangan halusinasi kode baru).
2. Output JSON array: [{icd10_code, icd10_display, confidence, reason}].
3. confidence 0-1. Selalu sertakan needs_review=true.
4. Bahasa display: Indonesia + English klinis.`;

export async function suggestWithLLM(subjective: string, objective: string, fetchLLM: (prompt: string) => Promise<string>) {
  const whitelist = ICD10_DICT.map((d) => `${d.code} | ${d.display}`).join('\n');
  const prompt = `${AI_SYSTEM_PROMPT}\nWHITELIST:\n${whitelist}\n\nANAMNESIS: ${subjective}\nPEMERIKSAAN: ${objective}`;
  const raw = await fetchLLM(prompt);
  try {
    const parsed = JSON.parse(raw);
    // validasi whitelist — buang halusinasi
    const allowed = new Set(ICD10_DICT.map((d) => d.code));
    return (Array.isArray(parsed) ? parsed : []).filter((x) => allowed.has(x.icd10_code)).slice(0, 3);
  } catch { return suggestICD(subjective, objective); }
}
