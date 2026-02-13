import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { name, email, message } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY manquante");
    }

    // 📩 Email vers toi (admin)
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

    if (!adminEmail.ok) {
      throw new Error("Erreur envoi mail admin");
    }

    // 📬 Email automatique au client
    await fetch("https://api.resend.com/emails", {
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

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
