import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, city } = await req.json();

    if (!firstName || !lastName || !phone) {
      return new Response(
        JSON.stringify({ error: "Données inscription incomplètes." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "contact@tima-love.com";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY manquante." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const registrationDate = new Date().toLocaleString("fr-FR");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "TimaLove Match <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "🆕 Nouveau membre inscrit sur TimaLove",
        html: `
          <h2>Nouvelle inscription membre</h2>
          <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
          <p><strong>Téléphone :</strong> ${phone}</p>
          <p><strong>Email :</strong> ${email || "Non renseigné"}</p>
          <p><strong>Ville :</strong> ${city || "Non renseignée"}</p>
          <p><strong>Date :</strong> ${registrationDate}</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: "Erreur envoi email admin.", details: errorData }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur serveur." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
