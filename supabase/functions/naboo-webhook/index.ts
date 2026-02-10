// Fichier : supabase/functions/naboo-webhook/index.ts

// On ignore l'avertissement de Deno pour les imports URL car c'est standard dans les Edge Functions
// deno-lint-ignore-file no-import-prefix

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const payload = await req.json()
    console.log("Webhook reçu de Naboo:", payload)

    const { order_id, status } = payload

    if (status === 'paid') {
      // A. Mettre à jour la transaction
      const { data: transaction, error: txError } = await supabaseClient
        .from('transactions')
        .update({ status: 'paid' })
        .eq('order_id', order_id)
        .select('user_id')
        .single()

      if (txError || !transaction) {
        console.error("Transaction introuvable ou erreur update:", txError)
        // On renvoie quand même 200 pour que Naboo arrête de réessayer, même si chez nous ça a raté
        return new Response("Erreur interne transaction", { status: 200 })
      }

      // B. Activer l'abonnement
      // On calcule la date de fin (aujourd'hui + 30 jours)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', transaction.user_id)

      if (profileError) {
        console.error("Erreur activation profil:", profileError)
      } else {
        console.log(`Succès ! Utilisateur ${transaction.user_id} activé jusqu'au ${endDate.toISOString()}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: unknown) {
    // Correction du type 'unknown'
    const msg = (error as Error).message || String(error);
    console.error("Erreur Webhook:", msg)
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})