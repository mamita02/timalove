import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ─────────────────────────────────────
    // ENV
    // ─────────────────────────────────────
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const NABOOPAY_API_KEY = Deno.env.get("NABOOPAY_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase env manquante");
    }

    if (!NABOOPAY_API_KEY) {
      throw new Error("NABOOPAY_API_KEY manquante");
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // ─────────────────────────────────────
    // DATA FRONTEND
    // ─────────────────────────────────────
    const { userId } = await req.json();
    if (!userId) throw new Error("userId manquant");

    // Récupérer infos utilisateur (pour customer)
    const { data: userProfile } = await supabaseAdmin
      .from("registrations")
      .select("first_name, last_name, phone")
      .eq("id", userId)
      .single();

    if (!userProfile) {
      throw new Error("Profil utilisateur introuvable");
    }

    // ─────────────────────────────────────
    // NABOO API (V2 - DEV)
    // ─────────────────────────────────────
    const response = await fetch(
  "https://api.naboopay.com/api/v2/transactions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${NABOOPAY_API_KEY}`,
    },
    body: JSON.stringify({
      // ⚠️ UN SEUL MOYEN DE PAIEMENT (doc Naboo)
      method_of_payment: ["orange_money"],

      // ⚠️ PRODUITS OBLIGATOIRES
      products: [
        {
          name: "Abonnement TimaLove",
          price: 5000, // >= 10 XOF obligatoire
          quantity: 1,
          description: "Abonnement Premium Homme",
        },
      ],

      // ⚠️ URLS VALIDES
      success_url: "http://localhost:8080/profile?payment=success",
      error_url: "http://localhost:8080/profile?payment=error",

      fees_customer_side: false,
      is_escrow: false,
      is_merchant: false,

      // ⚠️ CUSTOMER OBLIGATOIRE + FORMAT STRICT
      customer: {
        first_name: userProfile.first_name || "Client",
        last_name: userProfile.last_name || "TimaLove",
        phone: "+221774042672", // ⚠️ numéro TEST valide (important)
      },
    }),
  }
);


    const text = await response.text();
let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error(`Réponse Naboo non JSON: ${text}`);
}

console.log("Réponse Naboo :", data);

if (!response.ok) {
  throw new Error(`Erreur Naboo: ${JSON.stringify(data)}`);
}


    // ─────────────────────────────────────
    // SAVE TRANSACTION
    // ─────────────────────────────────────
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      order_id: data.order_id,
      amount: data.amount,
      status: "pending",
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Erreur serveur:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
