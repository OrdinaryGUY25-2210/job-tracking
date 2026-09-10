// ============================================================
//  Edge Function: generate-token
//  Menghasilkan token sementara AssemblyAI agar API key aslinya tidak
//  pernah dikirim ke browser. Dipanggil dari useLiveTranscription.js lewat:
//    supabaseClient.functions.invoke("generate-token")
//  sebelum membuka koneksi WebSocket transkripsi live.
//
//  CATATAN MIGRASI (Sep 2026): AssemblyAI mematikan Streaming v2 lama
//  (/v2/realtime/token + wss://api.assemblyai.com/v2/realtime/ws) per
//  31 Jan 2026 — itulah sumber error "Terjadi masalah dengan koneksi
//  audio/transkripsi" di Interview Assistant. Function ini sekarang
//  memanggil endpoint token Streaming v3 yang baru.
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const apiKey = Deno.env.get("ASSEMBLYAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ASSEMBLYAI_API_KEY belum di-set di Supabase secrets." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Token v3: GET /v3/token dengan Authorization: <apiKey> (bukan lagi POST /v2/realtime/token).
    // expires_in_seconds cuma jendela waktu untuk MEMBUKA koneksi WS (maks 600 detik),
    // bukan durasi sesi — begitu WS terbuka, sesi jalan sampai 3 jam (default).
    const response = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=60", {
      method: "GET",
      headers: { authorization: apiKey },
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: "AssemblyAI token error: " + errText.slice(0, 300) }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const { token } = await response.json();
    return new Response(JSON.stringify({ token }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server: " + String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
