import { google } from 'googleapis';
import { BOOKING_CONFIG } from '../config/booking';

function getAuthClient() {
  const email = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = import.meta.env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Missing Google service account credentials in environment variables');
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

function getCalendar() {
  const auth = getAuthClient();
  return google.calendar({ version: 'v3', auth });
}

export async function getBusySlots(dateStr: string): Promise<{ start: string; end: string }[]> {
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) throw new Error('Missing GOOGLE_CALENDAR_ID');

  const calendar = getCalendar();

  const timeMin = `${dateStr}T00:00:00`;
  const timeMax = `${dateStr}T23:59:59`;

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(timeMin + '-03:00').toISOString(),
      timeMax: new Date(timeMax + '-03:00').toISOString(),
      timeZone: BOOKING_CONFIG.timezone,
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  return busy.map((b) => ({
    start: b.start ?? '',
    end: b.end ?? '',
  }));
}

export async function createAppointment(data: {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  reason: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) throw new Error('Missing GOOGLE_CALENDAR_ID');

  const calendar = getCalendar();

  const [year, month, day] = data.date.split('-').map(Number);
  const [hour, minute] = data.time.split(':').map(Number);
  const { slotDurationMinutes, timezone } = BOOKING_CONFIG;

  const startDt = new Date(year, month - 1, day, hour, minute);
  const endDt = new Date(startDt.getTime() + slotDurationMinutes * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toLocalISO = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  const res = await calendar.events.insert({
    calendarId,
    sendUpdates: 'none',
    requestBody: {
      summary: `Turno - ${data.name} ${data.lastName}`,
      description: `Tel: ${data.phone} | Email: ${data.email} | Motivo: ${data.reason}`,
      start: {
        dateTime: toLocalISO(startDt),
        timeZone: timezone,
      },
      end: {
        dateTime: toLocalISO(endDt),
        timeZone: timezone,
      },
    },
  });

  return {
    eventId: res.data.id ?? '',
    htmlLink: res.data.htmlLink ?? '',
  };
}
