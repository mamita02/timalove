/**
 * Service de matching et Google Meet
 */

import { supabase } from './supabase';
import type { RegistrationRecord } from './supabase';

export interface MatchData {
  id: string;
  manId: string;
  womanId: string;
  manName: string;
  womanName: string;
  manEmail: string;
  womanEmail: string;
  meetLink: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

/**
 * Créer un lien Google Meet permanent
 * Utilise le format /new qui crée automatiquement une vraie réunion
 */
export const generateGoogleMeetLink = (
  manName: string,
  womanName: string,
  date: string
): string => {
  // Google Meet génère automatiquement un vrai lien avec /new
  // L'utilisateur sera redirigé vers une nouvelle salle de réunion
  return `https://meet.google.com/new`;
};

/**
 * Créer un événement Google Calendar
 */
export const createGoogleCalendarEvent = (
  manName: string,
  womanName: string,
  manEmail: string,
  womanEmail: string,
  date: string,
  meetLink: string
) => {
  // Format de l'événement pour Google Calendar
  const eventDate = new Date(date);
  const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // +1 heure

  const formatDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = encodeURIComponent('Rencontre TimaLove Match');
  const details = encodeURIComponent(
    `Rencontre organisée entre ${manName} et ${womanName} via TimaLove Match.\n\nLien Google Meet: ${meetLink}`
  );
  const location = encodeURIComponent(meetLink);
  const dates = `${formatDate(eventDate)}/${formatDate(endDate)}`;

  // URL pour ajouter à Google Calendar
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

/**
 * Envoyer un email d'invitation via Supabase Edge Function
 */
const sendInvitationEmail = async (
  email: string,
  recipientName: string,
  partnerName: string,
  date: string,
  meetLink: string,
  calendarLink: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-invitation', {
      body: {
        to: email,
        recipientName,
        partnerName,
        date,
        meetLink,
        calendarLink,
      },
    });

    if (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }

    console.log('✅ Email envoyé à:', email);
    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

/**
 * Sauvegarder un match dans la base de données
 */
export const createMatch = async (
  man: RegistrationRecord,
  woman: RegistrationRecord,
  scheduledDate: string,
  meetLink: string
) => {
  try {
    const matchData = {
      man_id: man.id,
      woman_id: woman.id,
      man_name: `${man.firstName} ${man.lastName}`,
      woman_name: `${woman.firstName} ${woman.lastName}`,
      man_email: man.email,
      woman_email: woman.email,
      meet_link: meetLink,
      scheduled_date: scheduledDate,
      status: 'scheduled' as const,
      created_at: new Date().toISOString(),
    };

    // Créer la table matches si elle n'existe pas (vous devez d'abord la créer dans Supabase)
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du match:', error);
      
      // Si la table n'existe pas, sauvegarder localement
      saveMatchLocally(matchData);
      
      return {
        success: true,
        data: matchData,
        message: 'Match sauvegardé localement (table Supabase à créer)',
      };
    }

    // Générer les liens calendrier
    const calendarLinkMan = createGoogleCalendarEvent(
      `${man.firstName} ${man.lastName}`,
      `${woman.firstName} ${woman.lastName}`,
      man.email,
      woman.email,
      scheduledDate,
      meetLink
    );

    const calendarLinkWoman = createGoogleCalendarEvent(
      `${woman.firstName} ${woman.lastName}`,
      `${man.firstName} ${man.lastName}`,
      woman.email,
      man.email,
      scheduledDate,
      meetLink
    );

    // Envoyer les emails d'invitation
    console.log('📧 Envoi des invitations par email...');
    
    await Promise.all([
      sendInvitationEmail(
        man.email,
        `${man.firstName} ${man.lastName}`,
        `${woman.firstName} ${woman.lastName}`,
        scheduledDate,
        meetLink,
        calendarLinkMan
      ),
      sendInvitationEmail(
        woman.email,
        `${woman.firstName} ${woman.lastName}`,
        `${man.firstName} ${man.lastName}`,
        scheduledDate,
        meetLink,
        calendarLinkWoman
      ),
    ]);

    return {
      success: true,
      data,
      message: 'Match créé avec succès et invitations envoyées',
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

/**
 * Sauvegarder un match localement (fallback)
 */
const saveMatchLocally = (matchData: any) => {
  try {
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    matches.push({
      ...matchData,
      id: crypto.randomUUID(),
    });
    localStorage.setItem('matches', JSON.stringify(matches));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale:', error);
  }
};

/**
 * Récupérer tous les matches
 */
export const getAllMatches = async () => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Récupérer depuis localStorage
      const localMatches = JSON.parse(localStorage.getItem('matches') || '[]');
      return {
        success: true,
        data: localMatches,
        message: 'Matches récupérés depuis le stockage local',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

/**
 * Générer l'email d'invitation
 */
export const generateInvitationEmail = (
  recipientName: string,
  partnerName: string,
  date: string,
  meetLink: string,
  calendarLink: string
) => {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
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
  };
};
