// ============================================================
//  Edge Function: parse-profile
//  Menerima teks CV (hasil ekstraksi file .pdf/.docx/.txt di klien),
//  lalu memakai LLM gratis (Groq — sama seperti tailor-cv) untuk
//  mengubahnya jadi data profil terstruktur, agar tab "Profil Saya"
//  bisa terisi otomatis tanpa mengetik ulang manual.
//
//  Cara deploy: sama seperti tailor-cv, lihat PANDUAN-TAMBAHAN.md
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// OpenRouter jadi provider UTAMA (Groq sempat bermasalah/di-deprecate).
// Cek openrouter.ai/models?max_price=0 kalau model ini suatu saat ikut
// deprecated — tinggal ganti string ini, tidak perlu ubah kode lain.
const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
// Groq dipakai HANYA sebagai cadangan kalau OpenRouter gagal. Boleh dikosongkan
// (jangan set secret GROQ_API_KEY) kalau kamu tidak mau pakai Groq sama sekali.
const GROQ_MODEL = "openai/gpt-oss-20b";

const SYSTEM_PROMPT = `Kamu bertugas mengekstrak data dari teks CV mentah menjadi struktur data profil, TANPA mengarang atau menambah informasi yang tidak ada di teks aslinya. Kalau suatu bagian tidak ditemukan, kembalikan string kosong "" atau array kosong [].

Balas HANYA dalam format JSON valid, tanpa markdown, tanpa teks lain di luar JSON, dengan struktur PERSIS seperti ini:
{
  "full_name": "nama lengkap sesuai CV",
  "tagline": "satu baris jabatan/spesialisasi utama jika tersirat dari CV, kalau tidak ada buat ringkas dari pengalaman paling relevan",
  "contact": "baris kontak dipisah ' · ' (kota, telepon, email, dll — hanya yang benar-benar ada di CV)",
  "summary": "ringkasan profil 3-5 kalimat berdasarkan isi CV (boleh dirapikan penulisannya, tapi tidak menambah klaim baru)",
  "skills": [
    { "category": "nama kategori", "items": "daftar skill dipisah koma" }
  ],
  "experience": [
    {
      "title": "jabatan",
      "company": "nama perusahaan",
      "location": "kota/remote jika ada, kalau tidak ada string kosong",
      "dates": "rentang tanggal sesuai CV",
      "bullets": [
        { "highlight": "poin pencapaian singkat", "detail": "penjelasan tambahan atau string kosong" }
      ]
    }
  ],
  "education": [
    { "degree": "jenjang/jurusan", "detail": "institusi, tahun, keterangan" }
  ]
}`;

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
        body: JSON.stringify({ model: OPENROUTER_MODEL, temperature: 0.2, response_format: { type: "json_object" }, messages }),
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

  if (groqApiKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.2, response_format: { type: "json_object" }, messages }),
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
    const { cvText } = await req.json();
    if (!cvText) {
      return new Response(
        JSON.stringify({ error: "cvText wajib diisi." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let rawContent: string;
    try {
      rawContent = await callLLM(SYSTEM_PROMPT, `TEKS CV:\n${cvText}`);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: String((e as Error).message || e) }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
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
