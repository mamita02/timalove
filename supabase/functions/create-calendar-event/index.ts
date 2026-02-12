// Fonction Edge pour créer un événement Google Calendar
// Déployez avec: supabase functions deploy create-calendar-event

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_CALENDAR_API_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY')
const GOOGLE_SERVICE_ACCOUNT = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')

serve(async (req) => {
  try {
    const { summary, description, startTime, endTime, attendees, meetLink } = await req.json()

    // Créer un événement Google Calendar via API
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Europe/Paris',
      },
      attendees: attendees.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `timalove-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 jour avant
          { method: 'popup', minutes: 30 },
        ],
      },
    }

    // Si vous avez configuré l'API Google Calendar avec un compte de service
    if (GOOGLE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT)
      
      // Créer un JWT pour l'authentification
      // Note: En production, utilisez une bibliothèque JWT appropriée
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GOOGLE_CALENDAR_API_KEY}`,
          },
          body: JSON.stringify(event),
        }
      )

      const data = await response.json()

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Sinon, retourner un lien pour créer manuellement
    return new Response(
      JSON.stringify({
        success: false,
        message: 'API Google Calendar non configurée',
        calendarLink: generateCalendarLink(summary, description, startTime, endTime, meetLink),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function generateCalendarLink(
  summary: string,
  description: string,
  startTime: string,
  endTime: string,
  location: string
) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
    details: description,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
