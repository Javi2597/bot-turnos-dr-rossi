import { BOOKING_CONFIG } from '../config/booking';

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlotsForDay(): string[] {
  const { timeSlots, slotDurationMinutes } = BOOKING_CONFIG;
  const slots: string[] = [];

  for (const { start, end } of timeSlots) {
    let current = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    while (current + slotDurationMinutes <= endMin) {
      slots.push(minutesToTime(current));
      current += slotDurationMinutes;
    }
  }

  return slots;
}

export function filterAvailableSlots(
  dateStr: string,
  busy: { start: string; end: string }[]
): TimeSlot[] {
  const allSlots = generateSlotsForDay();
  const { slotDurationMinutes, minAdvanceHours, timezone } = BOOKING_CONFIG;

  const now = new Date();
  // Get current date in Buenos Aires timezone for isToday check
  const todayBsAs = now.toLocaleDateString('en-CA', { timeZone: timezone }); // "YYYY-MM-DD"
  const [ny, nm, nd] = todayBsAs.split('-').map(Number);

  const [year, month, day] = dateStr.split('-').map(Number);
  const isToday = ny === year && nm === month && nd === day;

  const minAdvanceMs = minAdvanceHours * 60 * 60 * 1000;

  return allSlots.map((slotTime) => {
    const [h, m] = slotTime.split(':').map(Number);
    // Build proper UTC timestamp using the Buenos Aires offset (-03:00)
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const slotStart = new Date(`${dateStr}T${hh}:${mm}:00-03:00`);
    const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);

    // Filter past slots (with minimum advance)
    if (isToday && slotStart.getTime() - now.getTime() < minAdvanceMs) {
      return { time: slotTime, available: false };
    }

    // Check against busy periods
    const isBusy = busy.some(({ start, end }) => {
      const busyStart = new Date(start);
      const busyEnd = new Date(end);
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    return { time: slotTime, available: !isBusy };
  });
}

export function isEnabledDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return BOOKING_CONFIG.enabledDays.includes(dayOfWeek as typeof BOOKING_CONFIG.enabledDays[number]);
}
