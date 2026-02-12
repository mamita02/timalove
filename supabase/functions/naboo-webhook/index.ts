import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gestion du preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const payload = await req.json()
    console.log("🔔 Webhook Naboo reçu :", JSON.stringify(payload))

    // Note : Vérifie bien que Naboo envoie 'order_id' et 'transaction_status' dans le body
    const { order_id, transaction_status, status } = payload
    
    // Certains systèmes utilisent 'status' au lieu de 'transaction_status'
    const finalStatus = transaction_status || status;

    if (finalStatus === "paid" || finalStatus === "success") {
      
      // 1. Retrouver l'utilisateur
      const { data: transaction, error: txError } = await supabase
         .from('transactions')
         .select('user_id')
         .eq('order_id', order_id)
         .maybeSingle(); // Plus sûr que .single() pour éviter de crash si pas trouvé
      
      if (txError || !transaction) {
          console.error(`❌ Transaction introuvable pour order_id: ${order_id}`);
          return new Response(JSON.stringify({ error: "Order not found" }), { status: 200 });
      }

      const userId = transaction.user_id;

      // 2. Calculer la date de fin (Aujourd'hui + 3 mois)
      const now = new Date();
      const newEndDate = new Date();
      newEndDate.setMonth(now.getMonth() + 3);

      // Sécurité : Si le mois de destination n'a pas assez de jours (ex: 31 Mai -> 31 Février n'existe pas)
      // JS passe au mois suivant, ce qui est correct, mais on s'assure d'avoir un format ISO propre.
      const isoEndDate = newEndDate.toISOString();

      console.log(`🚀 Activation Premium pour ${userId} jusqu'au ${isoEndDate}`);

      // 3. Mise à jour du profil et de la transaction en une "pseudo-transaction"
      // On met à jour le profil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_end_date: isoEndDate,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 4. On marque la transaction comme terminée
      await supabase
        .from("transactions")
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('order_id', order_id);

      return new Response(JSON.stringify({ message: "Abonnement activé" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      });
    }

    return new Response(JSON.stringify({ message: "Statut non traité" }), { status: 200 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("❌ Erreur Webhook:", msg);
    return new Response(JSON.stringify({ error: msg }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    });
  }
})