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

  const nowInBsAs = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone })
  );

  const [year, month, day] = dateStr.split('-').map(Number);
  const isToday =
    nowInBsAs.getFullYear() === year &&
    nowInBsAs.getMonth() + 1 === month &&
    nowInBsAs.getDate() === day;

  const minAdvanceMs = minAdvanceHours * 60 * 60 * 1000;

  return allSlots.map((slotTime) => {
    const [h, m] = slotTime.split(':').map(Number);
    const slotStart = new Date(year, month - 1, day, h, m);
    const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);

    // Filter past slots (with minimum advance)
    if (isToday && slotStart.getTime() - nowInBsAs.getTime() < minAdvanceMs) {
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
