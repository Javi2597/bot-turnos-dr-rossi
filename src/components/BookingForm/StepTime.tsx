import { useEffect, useState } from 'react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Props {
  date: string;
  selectedTime: string;
  onSelect: (time: string) => void;
}

export default function StepTime({ date, selectedTime, onSelect }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setSlots([]);

    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSlots(data.slots ?? []);
        }
      })
      .catch(() => setError('Error al cargar los horarios. Intentá nuevamente.'))
      .finally(() => setLoading(false));
  }, [date]);

  const available = slots.filter((s) => s.available);

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Seleccioná un horario</h2>
      <p className="text-sm text-gray-500 mb-4 capitalize">{dateLabel}</p>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Consultando disponibilidad...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && available.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium">Sin turnos disponibles</p>
          <p className="text-amber-600 text-sm mt-1">No hay horarios libres para este día. Probá con otra fecha.</p>
        </div>
      )}

      {!loading && !error && available.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-3">{available.length} horario{available.length !== 1 ? 's' : ''} disponible{available.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && onSelect(slot.time)}
                disabled={!slot.available}
                className={`
                  py-3 px-2 rounded-xl text-sm font-medium transition-all border
                  ${slot.time === selectedTime
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                    : slot.available
                    ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                  }
                `}
              >
                {formatTime(slot.time)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
