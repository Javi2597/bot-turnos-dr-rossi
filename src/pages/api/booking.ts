import type { APIRoute } from 'astro';
import { getBusySlots } from '../../lib/google-calendar';
import { filterAvailableSlots, isEnabledDay } from '../../lib/slots';
import { createAppointment } from '../../lib/google-calendar';

interface BookingPayload {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  reason: string;
}

function validatePayload(body: unknown): body is BookingPayload {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === 'string' && b.name.trim().length > 0 &&
    typeof b.lastName === 'string' && b.lastName.trim().length > 0 &&
    typeof b.phone === 'string' && b.phone.trim().length > 0 &&
    typeof b.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
    typeof b.time === 'string' && /^\d{2}:\d{2}$/.test(b.time) &&
    typeof b.reason === 'string' && b.reason.trim().length > 0
  );
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!validatePayload(body)) {
    return new Response(JSON.stringify({ error: 'Datos incompletos o inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { date, time } = body;

  if (!isEnabledDay(date)) {
    return new Response(JSON.stringify({ error: 'Día no laborable' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Re-check availability before creating
    const busy = await getBusySlots(date);
    const slots = filterAvailableSlots(date, busy);
    const slot = slots.find((s) => s.time === time);

    if (!slot) {
      return new Response(JSON.stringify({ error: 'Horario no encontrado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!slot.available) {
      return new Response(
        JSON.stringify({ error: 'El turno ya no está disponible. Por favor seleccioná otro horario.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { eventId, htmlLink } = await createAppointment(body);

    return new Response(
      JSON.stringify({
        success: true,
        eventId,
        htmlLink,
        appointment: {
          name: body.name,
          lastName: body.lastName,
          date: body.date,
          time: body.time,
          reason: body.reason,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[/api/booking]', err);
    return new Response(JSON.stringify({ error: 'Error al crear el turno. Intentá nuevamente.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
