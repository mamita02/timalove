import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Gestion du preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 2. Récupération du payload (Naboo envoie du JSON)
    const payload = await req.json();
    console.log("🔔 Webhook Naboo reçu :", JSON.stringify(payload));

    // Naboo V2 utilise souvent 'order_id' et 'status'
    const { order_id, transaction_status, status } = payload;
    const finalStatus = (transaction_status || status || "").toLowerCase();

    // 3. On ne traite que si le paiement est un succès
    if (finalStatus === "paid" || finalStatus === "success" || finalStatus === "done") {
      
      // Trouver la transaction correspondante
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('user_id, status')
        .eq('order_id', order_id)
        .maybeSingle();
      
      if (txError || !transaction) {
        console.error(`❌ Transaction introuvable pour order_id: ${order_id}`);
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 200 }); // On répond 200 pour que Naboo arrête d'envoyer
      }

      // Éviter de traiter deux fois la même transaction
      if (transaction.status === 'paid') {
        console.log("ℹ️ Transaction déjà traitée.");
        return new Response(JSON.stringify({ message: "Already processed" }), { status: 200 });
      }

      const userId = transaction.user_id;

      // 4. Calcul de la date de fin (Aujourd'hui + 3 mois)
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 3);

      console.log(`🚀 Activation Premium pour ${userId} jusqu'au ${newEndDate.toISOString()}`);

      // 5. Mise à jour atomique : Profil + Transaction
      // Mise à jour du profil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Mise à jour du statut de la transaction
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({ 
          status: 'paid', 
          updated_at: new Date().toISOString() 
        })
        .eq('order_id', order_id);

      if (updateTxError) throw updateTxError;

      return new Response(JSON.stringify({ message: "Abonnement activé avec succès" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      });
    } else {
      console.log(`⚠️ Statut ignoré : ${finalStatus}`);
      return new Response(JSON.stringify({ message: "Statut non traité" }), { status: 200 });
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("❌ Erreur Webhook détaillée:", msg);
    return new Response(JSON.stringify({ error: msg }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    });
  }
});