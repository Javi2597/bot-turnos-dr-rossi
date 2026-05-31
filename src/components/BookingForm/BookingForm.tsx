import { useState } from 'react';
import StepDate from './StepDate';
import StepTime from './StepTime';
import StepPatientData from './StepPatientData';
import StepConfirmation from './StepConfirmation';

type Step = 1 | 2 | 3 | 4;

interface PatientData {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  reason: string;
}

interface SuccessData {
  name: string;
  lastName: string;
  date: string;
  time: string;
  reason: string;
}

const STEPS = ['Fecha', 'Horario', 'Datos', 'Confirmar'];

export default function BookingForm() {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patient, setPatient] = useState<PatientData>({
    name: '', lastName: '', phone: '', email: '', reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const canAdvance = () => {
    if (step === 1) return !!date;
    if (step === 2) return !!time;
    if (step === 3) {
      return (
        patient.name.trim() &&
        patient.lastName.trim() &&
        patient.phone.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email) &&
        patient.reason.trim()
      );
    }
    return false;
  };

  const handleNext = () => {
    if (step < 4 && canAdvance()) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patient, date, time }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error ?? 'Error al confirmar el turno. Intentá nuevamente.');
        return;
      }

      setSuccess(data.appointment);
    } catch {
      setSubmitError('Error de conexión. Verificá tu internet e intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const dateLabel = new Date(success.date + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const [h, m] = success.time.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const timeLabel = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;

    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Turno confirmado!</h3>
        <p className="text-gray-500 mb-6">Revisá tu email para ver la invitación de calendario.</p>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left max-w-sm mx-auto mb-6">
          <p className="text-sm font-semibold text-green-800 mb-3">Resumen del turno</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2"><span className="text-green-600">👤</span> {success.name} {success.lastName}</div>
            <div className="flex gap-2"><span className="text-green-600">📅</span> <span className="capitalize">{dateLabel}</span></div>
            <div className="flex gap-2"><span className="text-green-600">🕐</span> {timeLabel}</div>
            <div className="flex gap-2"><span className="text-green-600">📋</span> {success.reason}</div>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(null);
            setStep(1);
            setDate('');
            setTime('');
            setPatient({ name: '', lastName: '', phone: '', email: '', reason: '' });
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
        >
          Reservar otro turno
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`
                flex items-center gap-2 transition-all
                ${isActive ? 'opacity-100' : isDone ? 'opacity-70' : 'opacity-30'}
              `}>
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                `}>
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">
        {step === 1 && <StepDate selectedDate={date} onSelect={setDate} />}
        {step === 2 && <StepTime date={date} selectedTime={time} onSelect={setTime} />}
        {step === 3 && <StepPatientData data={patient} onChange={setPatient} />}
        {step === 4 && (
          <StepConfirmation
            {...patient}
            date={date}
            time={time}
            loading={submitting}
            error={submitError}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={step === 1 || submitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Volver
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
          >
            Continuar →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-green-200"
          >
            {submitting ? 'Confirmando...' : 'Confirmar turno'}
          </button>
        )}
      </div>
    </div>
  );
}
