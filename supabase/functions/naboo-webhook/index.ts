import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const payload = await req.json()
    console.log("🔔 Webhook Naboo reçu :", payload)

    const { order_id, transaction_status } = payload

    if (transaction_status === "paid") {
      
      // 1. RETROUVER L'UTILISATEUR grâce à l'order_id
      // On cherche dans la table qu'on a remplie à l'étape 2
      const { data: transaction, error: txError } = await supabase
         .from('transactions')
         .select('user_id')
         .eq('order_id', order_id)
         .single();
      
      if (txError || !transaction) {
          console.error("❌ Transaction introuvable pour order_id:", order_id);
          // On répond 200 pour que Naboo arrête d'insister, même si on a pas trouvé
          return new Response(JSON.stringify({ message: "Transaction inconnue" }), { status: 200 });
      }

      const userId = transaction.user_id;
      console.log(`✅ Paiement confirmé pour l'utilisateur : ${userId}`);

      // 2. CALCULER LA DATE DE FIN (+3 mois)
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 3);

      // 3. ACTIVER L'ABONNEMENT
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_end_date: newEndDate.toISOString()
        })
        .eq("id", userId);

      if (updateError) console.error("Erreur update profile:", updateError);

      // 4. Mettre à jour le statut de la transaction
      await supabase
        .from("transactions")
        .update({ status: 'paid' })
        .eq('order_id', order_id);
    }

    return new Response(JSON.stringify({ success: true }), { 
        headers: { "Content-Type": "application/json" }, status: 200 
    })

  } catch (err) {
    // On convertit l'erreur en texte proprement pour TypeScript
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    console.error("Erreur critique Webhook:", errorMessage)
    
    return new Response(JSON.stringify({ error: errorMessage }), { 
      headers: { "Content-Type": "application/json" },
      status: 400 
    })
  }
})