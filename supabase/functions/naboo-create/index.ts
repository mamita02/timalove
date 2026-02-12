import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 🔥 Configuration CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("UserId manquant");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const nabooApiKey = Deno.env.get("NABOO_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construction dynamique de l'URL du webhook
    // On extrait l'ID du projet depuis l'URL Supabase
    const projectId = supabaseUrl.split(".")[0].split("//")[1];
    const callbackUrl = `https://${projectId}.functions.supabase.co/naboo-webhook`;

    // 🔥 APPEL NABOO V2 (PROD)
    const naboResponse = await fetch(
      "https://api.naboopay.com/api/v2/transactions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nabooApiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          method_of_payment: ["wave", "orange_money"],
          products: [
            {
              name: "Abonnement Premium",
              price: 5000, // Prix mis à jour selon tes besoins (ex: 5000 FCFA)
              quantity: 1,
              description: "Accès premium complet"
            }
          ],
          success_url: "https://darkblue-elk-319522.hostingersite.com/", 
          error_url: "https://darkblue-elk-319522.hostingersite.com/error",
          callback_url: callbackUrl, // 🚀 C'est ici que Naboo préviendra ton site
          fees_customer_side: false,
          is_escrow: false,
          is_merchant: false,
          customer: {
            first_name: "",
            last_name: "",
            phone: ""
          }
        })
      }
    );

    const naboData = await naboResponse.json();

    if (!naboResponse.ok) {
      console.error("Erreur Naboo détaillée:", naboData);
      throw new Error(naboData.message || "Erreur lors de la création de la transaction Naboo");
    }

    if (!naboData.checkout_url) {
      console.error("Réponse Naboo sans URL:", naboData);
      throw new Error("checkout_url manquant dans la réponse Naboo");
    }

    // 🔥 ENREGISTREMENT DANS LA TABLE TRANSACTIONS
    const { error: dbError } = await supabase.from("transactions").insert({
      user_id: userId,
      order_id: naboData.order_id,
      amount: naboData.amount,
      status: "pending",
    });

    if (dbError) {
      console.error("Erreur insertion DB:", dbError);
    }

    return new Response(
      JSON.stringify({ url: naboData.checkout_url }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
      }
    );

  } catch (error: any) {
    console.error("ERREUR COMPLETE:", error);

    return new Response(
      JSON.stringify({ error: error?.message || "Erreur interne du serveur" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
      }
    );
  }
});