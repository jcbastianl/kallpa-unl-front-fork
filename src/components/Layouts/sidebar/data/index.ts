import { NavSection } from "@/types/auth";
import * as Icons from "../icons";
export type Role = "DOCENTE" | "PASANTE" | "admin";
export const NAV_DATA: NavSection[] = [
  {
    label: "MENU PRINCIPAL",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        roles: ["PASANTE", "ADMINISTRADOR"],
        items: [
          {
            title: "Inicio",
            url: "/dashboard",
          },
        ],
      },
      {
        title: "Calendario",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Participantes",
        icon: Icons.User,
        items: [
          {
            title: "Lista Participantes",
            url: "/pages/participant",
          },
          {
            title: "Registrar Nuevo",
            url: "/pages/participant/register",
          },
        ],
      },
      {
        title: "Asistencia",
        icon: Icons.Calendar,
        items: [
          {
            title: "Dashboard",
            url: "/pages/attendance",
          },

          {
            title: "Historial",
            url: "/pages/attendance/historial",
          },
          {
            title: "Programar",
            url: "/pages/attendance/programar",
          },
        ],
      },
      {
        title: "Medidas Antro",
        icon: Icons.TapeMeasureIcon,
        items: [
          {
            title: "Registrar",
            url: "/anthropometric/form",
          },
        ],
      },
      {
        title: "Evaluaciones",
        icon: Icons.DumbbellIcon,
        roles: ["PASANTE"],
        items: [
          {
            title: "Registrar Test",
            url: "/evolution/form-test",
          },
          {
            title: "Asignar Test",
            url: "/evolution/assign-test",
            roles: ["DOCENTE"],
          },
        ],
      },
      {
        title: "Historial",
        url: "/history/measurements",
        icon: Icons.HistoryIcon,
        items: [],
      },
    ],
  },
  {
    label: "OTROS",
    items: [
      {
        title: "Usuarios",
        url: "/pages/user",
        icon: Icons.User,
        items: [],
      },
    ],
  },
];
