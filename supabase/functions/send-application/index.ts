// ============================================================
//  Edge Function: send-application
//  Mengirim email lamaran (dengan lampiran CV/cover letter opsional)
//  lewat SMTP milik pengguna sendiri (mis. Gmail app password).
//
//  Model kerja: REVIEW DULU BARU KIRIM. Function ini hanya mengirim
//  ketika dipanggil eksplisit dari tombol "Kirim Lamaran" di aplikasi
//  setelah pengguna mengecek isi email — tidak ada pengiriman otomatis
//  di belakang layar.
//
//  Cara setup: lihat PANDUAN-TAMBAHAN.md
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { to, subject, body, fromName, attachments } = await req.json();
    // attachments (opsional): [{ filename, contentBase64 }]

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "to, subject, dan body wajib diisi." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "465");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return new Response(
        JSON.stringify({ error: "Kredensial SMTP belum di-set (SMTP_HOST/SMTP_USER/SMTP_PASS). Lihat PANDUAN-TAMBAHAN.md." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: SMTP_PORT === 465,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    });

    const attachList = Array.isArray(attachments)
      ? attachments.map((a: { filename: string; contentBase64: string }) => ({
          filename: a.filename,
          content: Uint8Array.from(atob(a.contentBase64), (c) => c.charCodeAt(0)),
          encoding: "base64" as const,
        }))
      : [];

    await client.send({
      from: fromName ? `${fromName} <${SMTP_USER}>` : SMTP_USER,
      to,
      subject,
      content: "auto",
      html: body.replace(/\n/g, "<br/>"),
      attachments: attachList,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Gagal mengirim email: " + String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
