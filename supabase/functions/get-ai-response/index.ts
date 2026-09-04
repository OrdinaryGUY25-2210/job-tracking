// ============================================================
//  Edge Function: get-ai-response
//  Menerima potongan transkrip interview, minta draf jawaban ke Claude
//  API, lalu menyimpan transcript + jawabannya ke Supabase — memakai
//  token pengguna yang sedang login (bukan service role key), supaya
//  data otomatis tersimpan sebagai milik pengguna itu sendiri sesuai RLS.
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Model produksi Claude saat ini untuk pemanggilan API biasa (di luar
// konteks artifact claude.ai, yang punya aturan model sendiri).
const CLAUDE_MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT: Record<string, string> = {
  id: `Kamu adalah asisten interview real-time. Diberikan potongan transkrip percakapan interview,
tugasmu: (1) jika itu adalah pertanyaan dari pewawancara, berikan draf jawaban singkat, jelas,
dan percaya diri (maks 4-5 kalimat) yang bisa dijadikan bahan oleh kandidat; (2) jika bukan
pertanyaan, berikan catatan singkat/insight yang relevan. Jawab dalam Bahasa Indonesia.`,
  en: `You are a real-time interview assistant. Given a snippet of interview transcript,
your job: (1) if it's a question from the interviewer, provide a short, clear, confident
draft answer (max 4-5 sentences) the candidate can use as a starting point; (2) if it isn't
a question, provide a brief relevant note/insight instead. Respond in English.`,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { transcript, language = "id", sessionId } = await req.json();
    if (!transcript || typeof transcript !== "string") {
      return new Response(
        JSON.stringify({ error: 'Field "transcript" wajib diisi.' }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY belum di-set di Supabase secrets." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 1. Minta draf jawaban ke Claude
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT[language] ?? SYSTEM_PROMPT.id,
        messages: [{ role: "user", content: transcript }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(
        JSON.stringify({ error: "Anthropic API error: " + errText.slice(0, 300) }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const responseText = aiData.content?.find((c: { type: string }) => c.type === "text")?.text?.trim() ?? "";

    // 2. Simpan ke Supabase — pakai token pengguna yang memanggil function ini
    //    (diteruskan otomatis oleh supabaseClient.functions.invoke), bukan
    //    service_role key, sehingga RLS tetap berlaku secara wajar.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .insert({ language, user_id: user?.id ?? null })
        .select("id")
        .single();
      if (sessionError) throw sessionError;
      currentSessionId = session.id;
    }

    const { error: insertError } = await supabase.from("transcript_entries").insert({
      session_id: currentSessionId,
      transcript_text: transcript,
      ai_response: responseText,
    });
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ response: responseText, sessionId: currentSessionId }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server: " + String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
