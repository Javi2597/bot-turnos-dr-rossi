import type { APIRoute } from 'astro';
import { getBusySlots } from '../../lib/google-calendar';
import { filterAvailableSlots, isEnabledDay } from '../../lib/slots';
import { BOOKING_CONFIG } from '../../config/booking';

export const GET: APIRoute = async ({ url }) => {
  const dateStr = url.searchParams.get('date');

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Response(JSON.stringify({ error: 'Parámetro date inválido. Usar formato YYYY-MM-DD' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isEnabledDay(dateStr)) {
    return new Response(JSON.stringify({ slots: [], error: 'Día no laborable' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate date is within allowed range
  const { timezone, maxFutureDays } = BOOKING_CONFIG;
  const nowInBsAs = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const today = new Date(nowInBsAs.getFullYear(), nowInBsAs.getMonth(), nowInBsAs.getDate());

  const [year, month, day] = dateStr.split('-').map(Number);
  const requestedDate = new Date(year, month - 1, day);
  const maxDate = new Date(today.getTime() + maxFutureDays * 24 * 60 * 60 * 1000);

  if (requestedDate < today) {
    return new Response(JSON.stringify({ slots: [], error: 'Fecha en el pasado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (requestedDate > maxDate) {
    return new Response(
      JSON.stringify({ slots: [], error: `Solo se puede reservar hasta ${maxFutureDays} días en el futuro` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const busy = await getBusySlots(dateStr);
    const slots = filterAvailableSlots(dateStr, busy);
    return new Response(JSON.stringify({ slots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/slots]', err);
    return new Response(JSON.stringify({ error: 'Error al consultar disponibilidad' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
