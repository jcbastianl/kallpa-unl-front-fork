import { FiMoreHorizontal } from "react-icons/fi";

const pendingTests = [
  {
    id: 1,
    user: "Lucía Morales",
    initials: "LM",
    avatarBg: "bg-purple-100 text-purple-600",
    testType: "Resistencia (Cooper)",
    status: "Pendiente",
    statusStyles: "bg-yellow-100 text-yellow-700",
    action: "Iniciar",
  },
  {
    id: 2,
    user: "Jorge Torres",
    initials: "JT",
    avatarBg: "bg-green-100 text-green-600",
    testType: "Fuerza Máxima",
    status: "Atrasado",
    statusStyles: "bg-red-100 text-red-700",
    action: "Reprogramar",
  },
];

export function PendingPhysicalTests() {
  return (
    <div className="rounded-2xl bg-white shadow-sm dark:bg-[#1a2233] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Pruebas Físicas Pendientes
        </h3>
        <button className="text-slate-400 hover:text-slate-600">
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Usuario</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de Prueba</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingTests.map((test) => (
              <tr key={test.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${test.avatarBg}`}>
                      {test.initials}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{test.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {test.testType}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${test.statusStyles}`}>
                    {test.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
                    {test.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}