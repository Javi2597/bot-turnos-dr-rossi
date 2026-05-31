interface Props {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  reason: string;
  loading: boolean;
  error: string;
}

export default function StepConfirmation({
  name, lastName, phone, email, date, time, reason, loading, error,
}: Props) {
  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right ml-4 capitalize">{value}</span>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirmá tu turno</h2>
      <p className="text-sm text-gray-500 mb-5">Revisá los datos antes de confirmar.</p>

      <div className="bg-blue-50 rounded-2xl p-5 mb-5 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{name} {lastName}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <Row label="Fecha" value={dateLabel} />
        <Row label="Horario" value={formatTime(time)} />
        <Row label="Teléfono" value={phone} />
        <Row label="Motivo" value={reason} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="w-5 h-5 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Confirmando turno...</span>
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        Al confirmar, recibirás una invitación de calendario en {email}.
      </p>
    </div>
  );
}
