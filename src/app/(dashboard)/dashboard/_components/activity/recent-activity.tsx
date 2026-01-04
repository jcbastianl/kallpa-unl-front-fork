import { FiUser, FiBarChart2, FiCheckCircle } from "react-icons/fi";

const activities = [
  { id: 1, type: 'REGISTRO', title: 'Nuevo Usuario', desc: 'Juan Pérez registrado en el sistema.', time: 'Hace 5m', icon: FiUser, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'MEDICION', title: 'Medición Completada', desc: 'Actualización de medidas para María G.', time: 'Hace 24m', icon: FiCheckCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, type: 'PRUEBA', title: 'Prueba Física', desc: 'Carlos R. finalizó Test de Cooper.', time: 'Hace 1h', icon: FiBarChart2, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export function RecentActivity() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1a2233] w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actividad Reciente</h3>
        <button className="text-sm font-medium text-blue-500 hover:underline">Ver todo</button>
      </div>

      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4 w-full">
            {/* Contenedor del Icono */}
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white dark:bg-white shadow-sm`}>
               <item.icon size={22} className={item.color} />
            </div>

            {/* Contenedor de Información - flex-1 es la clave aquí */}
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-start justify-between w-full">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {item.title}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                  {item.time}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>

              {/* Etiqueta (Badge) corregida según la imagen */}
              <div className="mt-1">
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-opacity-20 ${item.bg} ${item.color} border border-current border-opacity-10`}>
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}