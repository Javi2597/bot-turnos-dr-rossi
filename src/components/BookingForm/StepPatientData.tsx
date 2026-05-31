interface PatientData {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  reason: string;
}

interface Props {
  data: PatientData;
  onChange: (data: PatientData) => void;
}

export default function StepPatientData({ data, onChange }: Props) {
  const set = (field: keyof PatientData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [field]: e.target.value });

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-gray-400';

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tus datos</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Nombre *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={set('name')}
              placeholder="Juan"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Apellido *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={set('lastName')}
              placeholder="García"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Teléfono *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={set('phone')}
            placeholder="+54 9 11 1234-5678"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={set('email')}
            placeholder="juan@ejemplo.com"
            className={inputClass}
            required
          />
          <p className="text-xs text-gray-400 mt-1">Recibirás la confirmación del turno en este email.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Motivo de consulta *
          </label>
          <textarea
            value={data.reason}
            onChange={set('reason')}
            placeholder="Describí brevemente el motivo de tu consulta..."
            rows={3}
            className={`${inputClass} resize-none`}
            required
          />
        </div>
      </div>
    </div>
  );
}
