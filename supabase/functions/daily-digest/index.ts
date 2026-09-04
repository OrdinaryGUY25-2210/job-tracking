// ============================================================
//  Edge Function: daily-digest
//  Dipanggil terjadwal (via Cron Jobs di Supabase Dashboard) setiap
//  pagi. Mengumpulkan status lamaran tiap pengguna dan mengirim email
//  ringkasan harian ke email masing-masing lewat SMTP.
//
//  Cara setup jadwalnya: lihat PANDUAN-TAMBAHAN.md
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "465");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const DIGEST_TO = Deno.env.get("DIGEST_TO"); // email tujuan ringkasan (email pribadimu)

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !DIGEST_TO) {
      return new Response(
        JSON.stringify({ error: "SMTP_* atau DIGEST_TO belum di-set sebagai secret." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Ambil semua lamaran yang masih aktif (belum Diterima/Ditolak)
    const { data: apps, error } = await supabase
      .from("applications")
      .select("company, position, status, date_applied, interview_at")
      .in("status", ["Dilamar", "Diproses", "Interview"])
      .order("date_applied", { ascending: false });

    if (error) throw error;

    const counts = { Dilamar: 0, Diproses: 0, Interview: 0 };
    (apps || []).forEach((a: { status: string }) => {
      if (a.status in counts) (counts as Record<string, number>)[a.status]++;
    });

    const upcomingInterviews = (apps || [])
      .filter((a: { interview_at: string | null }) => a.interview_at)
      .sort((a: { interview_at: string }, b: { interview_at: string }) => a.interview_at.localeCompare(b.interview_at));

    const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

    let html = `<h2>Ringkasan Lamaran — ${today}</h2>`;
    html += `<p>Dilamar: <b>${counts.Dilamar}</b> · Diproses: <b>${counts.Diproses}</b> · Interview: <b>${counts.Interview}</b></p>`;

    if (upcomingInterviews.length) {
      html += `<h3>Jadwal Interview</h3><ul>`;
      upcomingInterviews.forEach((a: { position: string; company: string; interview_at: string }) => {
        const dt = new Date(a.interview_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
        html += `<li>${a.position} — ${a.company}: <b>${dt}</b></li>`;
      });
      html += `</ul>`;
    }

    if (!apps || apps.length === 0) {
      html += `<p>Tidak ada lamaran aktif saat ini.</p>`;
    }

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: SMTP_PORT === 465,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    });
    await client.send({
      from: SMTP_USER,
      to: DIGEST_TO,
      subject: `Ringkasan Lamaran Harian — ${today}`,
      content: "auto",
      html,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true, sent: apps?.length || 0 }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
