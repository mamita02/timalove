// Fonction Edge pour envoyer les invitations par email
// Déployez avec: supabase functions deploy send-invitation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('resend_api_key')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, recipientName, partnerName, date, meetLink, calendarLink } = await req.json()

    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'TimaLove Match <noreply@timalove.com>',
        to: [to],
        subject: '💕 Votre rencontre TimaLove Match est planifiée !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Bonjour ${recipientName},</h2>
            
            <p>Nous avons le plaisir de vous annoncer qu'une rencontre a été organisée pour vous !</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails de la rencontre</h3>
              <p><strong>Avec :</strong> ${partnerName}</p>
              <p><strong>Date :</strong> ${formattedDate}</p>
              <p><strong>Durée :</strong> 1 heure</p>
              <p><strong>Format :</strong> Visioconférence (accompagné par notre équipe)</p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${meetLink}" style="display: inline-block; background: #e91e63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Rejoindre la rencontre
              </a>
            </div>
            
            <p>
              <a href="${calendarLink}" style="color: #e91e63;">Ajouter à mon calendrier</a>
            </p>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Conseils pour la rencontre :</strong></p>
              <ul>
                <li>Préparez un environnement calme et bien éclairé</li>
                <li>Testez votre caméra et micro avant l'heure</li>
                <li>Soyez vous-même et restez naturel(le)</li>
                <li>Notre accompagnatrice sera présente pour faciliter l'échange</li>
              </ul>
            </div>
            
            <p>Si vous avez des questions ou besoin de reporter, contactez-nous à contact@timalove.com</p>
            
            <p style="color: #666; font-size: 14px;">
              Bonne rencontre !<br>
              L'équipe TimaLove Match 💕
            </p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
