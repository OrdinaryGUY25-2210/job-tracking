// ============================================================
//  Edge Function: tailor-cv
//  Menerima { jobDescription, cvText } dari index.html, memanggil
//  LLM gratis (Groq) yang berperan sebagai Senior HRD, lalu
//  mengembalikan { company, position, coverLetter, cvData }
//  (cvData berisi struktur CV lengkap: nama, tagline, skills, dst).
//
//  Cara deploy: lihat PANDUAN-LLM-GRATIS.md
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Kamu adalah seorang Senior HR Manager berpengalaman lebih dari 15 tahun yang bertugas menyaring dan meloloskan CV terbaik untuk sebuah lowongan pekerjaan.

Tugasmu, diberikan (1) deskripsi lowongan pekerjaan (JD) dan (2) isi CV asli seorang kandidat:
1. Baca JD dan pahami kualifikasi, tanggung jawab, dan kata kunci (keyword) yang dicari.
2. Susun ULANG isi CV kandidat ke dalam struktur data (bukan teks bebas) agar lebih relevan dan menonjolkan pengalaman/skill yang paling sesuai dengan JD — gunakan kata kunci dari JD secara alami di ringkasan dan poin-poin pengalaman.
   ATURAN PENTING: JANGAN mengarang pengalaman, gelar, keahlian, kontak, atau pencapaian yang tidak ada di CV asli. Kamu hanya boleh menata ulang, meringkas, menonjolkan, dan memperbaiki penulisan dari apa yang benar-benar sudah ada di CV asli. Nama, kontak (telepon/email/lokasi), dan riwayat pekerjaan/pendidikan harus tetap sama persis dengan CV asli — hanya cara penulisan/penekanannya yang boleh disesuaikan dengan JD.
   FORMAT SETIAP BULLET (poin pencapaian di experience & projects) WAJIB dipecah jadi dua bagian:
   - "highlight": frasa aksi/pencapaian singkat (3-7 kata, tanpa tanda baca di akhir) yang akan ditampilkan TEBAL — mis. "Meningkatkan konversi penjualan 25%" atau "Memimpin tim 5 developer".
   - "detail": kalimat penjelasan tambahan (opsional, boleh string kosong "" kalau highlight-nya sudah cukup jelas berdiri sendiri) yang ditampilkan dengan berat teks normal — mis. "dengan merombak alur checkout dan menerapkan A/B testing selama 3 bulan".
   Jangan ulangi highlight di dalam detail.
3. Tulis surat lamaran (cover letter) singkat dan profesional (3-4 paragraf, Bahasa Indonesia formal, kecuali JD berbahasa Inggris maka tulis dalam Bahasa Inggris) yang menjelaskan mengapa kandidat ini cocok untuk posisi tersebut. Pisahkan tiap paragraf dengan satu baris kosong, tanpa markdown.
4. Ekstrak nama perusahaan dan judul posisi dari JD (jika tidak disebutkan eksplisit, tulis "Tidak diketahui").

Balas HANYA dalam format JSON valid, tanpa markdown, tanpa teks lain di luar JSON, dengan struktur PERSIS seperti ini (array boleh kosong [] kalau memang tidak ada datanya di CV asli, tapi field wajib tetap ada):
{
  "company": "nama perusahaan",
  "position": "judul posisi",
  "coverLetter": "isi surat lamaran, dalam format teks biasa dengan baris kosong sebagai pemisah paragraf",
  "cvData": {
    "name": "nama lengkap kandidat, HURUF BESAR",
    "tagline": "satu baris ringkas peran/spesialisasi kandidat (mis. jabatan atau bidang keahlian utama)",
    "contact": "satu baris kontak dipisah ' · ' (mis. Kota, Negara · nomor telepon · email · status ketersediaan)",
    "summary": "ringkasan profil 3-5 kalimat yang disesuaikan dengan JD",
    "skills": [
      { "category": "Nama kategori skill", "items": "daftar skill dipisah koma dalam satu string" }
    ],
    "experience": [
      {
        "title": "jabatan",
        "company": "nama perusahaan/klien",
        "location": "kota/remote",
        "dates": "rentang tanggal (mis. 2020 - Sekarang)",
        "bullets": [
          { "highlight": "frasa aksi/pencapaian singkat", "detail": "penjelasan tambahan atau string kosong" }
        ]
      }
    ],
    "projects": [
      { "title": "nama proyek", "bullets": [{ "highlight": "...", "detail": "..." }] }
    ],
    "education": [
      { "degree": "nama jenjang/jurusan", "detail": "institusi, tahun, dan keterangan singkat" }
    ]
  }
}`;

// OpenRouter jadi provider UTAMA (Groq sempat bermasalah/di-deprecate).
// Cek openrouter.ai/models?max_price=0 kalau model ini suatu saat ikut
// deprecated — tinggal ganti string ini, tidak perlu ubah kode lain.
const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
// Groq dipakai HANYA sebagai cadangan kalau OpenRouter gagal. Boleh dikosongkan
// (jangan set secret GROQ_API_KEY) kalau kamu tidak mau pakai Groq sama sekali.
const GROQ_MODEL = "openai/gpt-oss-20b";

/* Panggil LLM dengan fallback otomatis: coba OpenRouter dulu (provider utama),
   kalau gagal (network error, limit, atau model deprecated) baru coba Groq. */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  let lastError = "";

  if (openrouterApiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${openrouterApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: OPENROUTER_MODEL, temperature: 0.4, response_format: { type: "json_object" }, messages }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
        lastError = "Respons kosong dari OpenRouter.";
      } else {
        lastError = "OpenRouter API error: " + (await res.text()).slice(0, 300);
      }
    } catch (e) {
      lastError = "OpenRouter gagal dihubungi: " + String(e);
    }
  } else {
    lastError = "OPENROUTER_API_KEY belum di-set.";
  }

  // OpenRouter gagal — coba Groq kalau secret-nya ada.
  if (groqApiKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.4, response_format: { type: "json_object" }, messages }),
    });
    if (!res.ok) {
      throw new Error(`OpenRouter gagal (${lastError}), Groq juga gagal: ` + (await res.text()).slice(0, 300));
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error(`OpenRouter gagal (${lastError}), respons Groq juga kosong.`);
    return content;
  }

  throw new Error(lastError + " (GROQ_API_KEY juga belum di-set sebagai fallback).");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { jobDescription, cvText } = await req.json();

    if (!jobDescription || !cvText) {
      return new Response(
        JSON.stringify({ error: "jobDescription dan cvText wajib diisi." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let rawContent: string;
    try {
      rawContent = await callLLM(
        SYSTEM_PROMPT,
        `DESKRIPSI LOWONGAN (JD):\n${jobDescription}\n\n---\n\nCV ASLI KANDIDAT:\n${cvText}`
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ error: String((e as Error).message || e) }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      // Beberapa model kadang membungkus JSON dalam ```json ... ``` — bersihkan dulu.
      const cleaned = rawContent.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "");
      parsed = JSON.parse(cleaned);
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: "Gagal mem-parsing respons AI menjadi JSON." }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server: " + String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
