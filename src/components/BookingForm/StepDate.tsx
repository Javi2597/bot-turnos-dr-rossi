import { useState } from 'react';
import { BOOKING_CONFIG } from '../../config/booking';

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getNowInBsAs() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BOOKING_CONFIG.timezone }));
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function StepDate({ selectedDate, onSelect }: Props) {
  const now = getNowInBsAs();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = new Date(today.getTime() + BOOKING_CONFIG.maxFutureDays * 24 * 60 * 60 * 1000);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = () => {
    return !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
  };

  const isDisabled = (day: number): boolean => {
    const date = new Date(viewYear, viewMonth, day);
    if (date < today || date > maxDate) return true;
    return !BOOKING_CONFIG.enabledDays.includes(date.getDay() as typeof BOOKING_CONFIG.enabledDays[number]);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccioná una fecha</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev()}
            className="p-1 rounded-full hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="font-semibold text-lg">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-blue-500 transition-colors"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 bg-blue-50">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-blue-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 p-3 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const dateStr = toDateStr(viewYear, viewMonth, day);
            const disabled = isDisabled(day);
            const selected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => !disabled && onSelect(dateStr)}
                disabled={disabled}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${selected
                    ? 'bg-blue-600 text-white shadow-md scale-110'
                    : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <p className="mt-3 text-center text-sm text-blue-600 font-medium">
          Fecha seleccionada: {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
