export const BOOKING_CONFIG = {
  // Franjas horarias de atención
  timeSlots: [
    { start: '09:00', end: '13:00' }, // Mañana
    { start: '16:00', end: '20:00' }, // Tarde
  ],

  // Duración de cada turno en minutos
  slotDurationMinutes: 30,

  // Días habilitados: 0=Domingo, 1=Lunes, ..., 6=Sábado
  enabledDays: [1, 2, 3, 4, 5], // Lunes a Viernes

  // Anticipación mínima en horas para poder reservar
  minAdvanceHours: 2,

  // Máximo de días a futuro que se puede reservar
  maxFutureDays: 30,

  // Timezone
  timezone: 'America/Argentina/Buenos_Aires',
} as const;

export type BookingConfig = typeof BOOKING_CONFIG;
