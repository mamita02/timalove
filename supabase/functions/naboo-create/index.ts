import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {

  // 🔥 CORS
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🔥 APPEL NABOO V2 (PROD)
    const naboResponse = await fetch(
      "https://api.naboopay.com/api/v2/transactions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("NABOO_API_KEY")}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          method_of_payment: ["wave", "orange_money"],
          products: [
            {
              name: "Abonnement Premium",
              price: 100,
              quantity: 1,
              description: "Accès premium"
            }
          ],
          success_url: "https://darkblue-elk-319522.hostingersite.com/success",
          error_url: "https://darkblue-elk-319522.hostingersite.com/error",
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
      console.error("Erreur Naboo:", naboData);
      throw new Error("Erreur API Naboo");
    }

    if (!naboData.checkout_url) {
      console.error("Réponse Naboo invalide:", naboData);
      throw new Error("checkout_url manquant");
    }

    // 🔥 INSERT DB
    await supabase.from("transactions").insert({
      user_id: userId,
      order_id: naboData.order_id,
      amount: naboData.amount,
      status: "pending",
    });

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
      JSON.stringify({ error: error?.message }),
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
