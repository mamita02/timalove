import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';


serve(async (req: Request) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, recipientName, partnerName, date, meetLink, calendarLink } = await req.json();

    const resend_api_key = Deno.env.get('RESEND_API_KEY');

    if (!resend_api_key) {
      console.error('❌ RESEND_API_KEY manquante dans Vault');
      throw new Error('RESEND_API_KEY manquante dans Vault');
    }

    console.log('✅ API Key récupérée, longueur:', resend_api_key.length);
    console.log('✅ Préfixe de la clé:', resend_api_key.substring(0, 8));

    // Formater la date
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('📧 Envoi email à:', to);

    // Envoyer l'email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resend_api_key}`,
      },
      body: JSON.stringify({
        from: 'TimaLove Match <onboarding@resend.dev>',
        to: [to],
        subject: '💕 Votre rencontre TimaLove Match est planifiée !',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💕 Votre rencontre est planifiée !</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${recipientName}</strong>,</p>
                <p>Nous avons le plaisir de vous annoncer qu'une rencontre a été organisée avec <strong>${partnerName}</strong>.</p>
                <p><strong>📅 Date :</strong> ${formattedDate}</p>
                <p><strong>🎥 Lien Google Meet :</strong></p>
                <a href="${meetLink}" class="button">Rejoindre la réunion</a>
                <p><strong>📆 Ajouter à votre calendrier :</strong></p>
                <a href="${calendarLink}" class="button">Ajouter au calendrier</a>
                <p>Nous vous souhaitons une excellente rencontre ! 💖</p>
                <p>Cordialement,<br/>L'équipe TimaLove Match</p>
              </div>
              <div class="footer">
                <p>TimaLove Match - L'amour à portée de main</p>
                <p><a href="https://tima-love.com">tima-love.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    console.log('📤 Réponse Resend - Status:', res.status);

    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ Erreur Resend:', JSON.stringify(errorData, null, 2));
      console.error('Status:', res.status);
      console.error('Headers:', Object.fromEntries(res.headers.entries()));
      throw new Error(`Resend API Error (${res.status}): ${JSON.stringify(errorData)}`);
    }

    const responseData = await res.json();
    console.log('✅ Email envoyé avec succès:', responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erreur inconnue'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
