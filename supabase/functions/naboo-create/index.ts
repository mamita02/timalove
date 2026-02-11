import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {

  // 🔥 GESTION CORS
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
      return new Response(JSON.stringify({ error: "UserId manquant" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fakeOrderId = "TEST_" + Date.now();

    await supabase.from("transactions").insert({
      user_id: userId,
      order_id: fakeOrderId,
      amount: 5000,
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        url: "https://api.naboopay.com/api/v1/transaction/create-transaction"
      }),
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message }),
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
