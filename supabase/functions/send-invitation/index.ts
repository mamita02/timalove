import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    // ✅ Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Tous les champs sont obligatoires." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY manquante");
      return new Response(
        JSON.stringify({ error: "Configuration serveur invalide." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ===============================
    // 📩 EMAIL ADMIN
    // ===============================
    const adminEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tima Love <contact@tima-love.com>",
        to: ["contact@tima-love.com"],
        reply_to: email,
        subject: `Nouveau message de ${name}`,
        html: `
          <h2>Nouveau message depuis tima-love.com</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Message :</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    const adminResult = await adminEmail.json();

    if (!adminEmail.ok) {
      console.error("Erreur Resend Admin:", adminResult);
      return new Response(
        JSON.stringify({ error: "Erreur envoi email admin." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ⏳ Délai pour éviter Rate Limit (429)
    await new Promise((resolve) => setTimeout(resolve, 700));

    // ===============================
    // 📬 EMAIL CLIENT
    // ===============================
    const clientEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tima Love <contact@tima-love.com>",
        to: [email],
        subject: "Merci pour votre message 💌",
        html: `
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre message.</p>
          <p>Nous vous répondrons rapidement.</p>
          <br/>
          <p>— L’équipe Tima Love</p>
        `,
      }),
    });

    const clientResult = await clientEmail.json();

    if (!clientEmail.ok) {
      console.error("Erreur Resend Client:", clientResult);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Erreur générale:", error);

    return new Response(
      JSON.stringify({ error: "Erreur serveur." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});