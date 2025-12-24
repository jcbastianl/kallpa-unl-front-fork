import { FaHeartbeat, FaWeight } from "react-icons/fa";

type OverviewCardsGroupProps = {
  bmi: number | null;
  status: string;
  loading?: boolean;
};

export function OverviewCardsGroup({ bmi, status, loading = false }: OverviewCardsGroupProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="ml-3 text-primary font-medium">Calculando IMC...</span>
      </div>
    );
  }

  if (bmi === null) return null;

  const statusColors = {
    "Peso adecuado": "bg-green-100 text-green-800",
    "Bajo peso": "bg-red-100 text-red-800",
    "Sobrepeso": "bg-orange-100 text-orange-800",
  };
  
  const colorClass = status in statusColors ? statusColors[status as keyof typeof statusColors] : "bg-gray-100 text-gray-800";
  

  // Ejemplo barra de progreso IMC (0-40)
  const bmiPercent = Math.min(Math.max((bmi / 40) * 100, 0), 100);

  return (
    <div
      className={`mx-auto w-full max-w-sm rounded-lg p-6 shadow-lg dark:bg-gray-800 ${colorClass}`}
      role="region"
      aria-label="Resumen del índice de masa corporal"
    >
      <div className="flex items-center space-x-4">
        <FaHeartbeat className="text-4xl" />
        <div>
          <p className="text-sm font-semibold">Estado</p>
          <p className="text-xl font-bold">{status}</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-6xl font-extrabold">{bmi.toFixed(2)}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Índice de Masa Corporal
        </p>
      </div>

      <div className="mt-6 bg-gray-300 h-3 rounded-full overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${bmiPercent}%`,
            backgroundColor: colorClass.includes("green") ? "#22c55e" :
                             colorClass.includes("red") ? "#ef4444" :
                             colorClass.includes("orange") ? "#f97316" :
                             "#6b7280"
          }}
        />
      </div>
    </div>
  );
}
