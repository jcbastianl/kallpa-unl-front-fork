import { NavSection } from "@/types/auth";
import * as Icons from "../icons";
export type Role = "DOCENTE" | "PASANTE" | "admin";
export const NAV_DATA: NavSection[] = [
  {
    label: "MENU PRINCIPAL",
    items: [
      {
        title: "Participantes",
        icon: Icons.User,
        roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"],
        items: [
          {
            title: "Lista Participantes",
            url: "/pages/participant",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
          {
            title: "Registrar Nuevo",
            url: "/pages/participant/register",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
        ],
      },
      {
        title: "Asistencia",
        icon: Icons.Calendar,
        roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"],
        items: [
          {
            title: "Sesiones",
            url: "/pages/attendance",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
          {
            title: "Programar Sesión",
            url: "/pages/attendance/programar",
            roles: ["ADMINISTRADOR", "DOCENTE"]
          },
          {
            title: "Historial",
            url: "/pages/attendance/historial",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
        ],
      },
      {
        title: "Medidas Antro",
        icon: Icons.TapeMeasureIcon,
        roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"],
        items: [
          {
            title: "Registrar",
            url: "/anthropometric",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
        ],
      },
      {
        title: "Evaluaciones",
        icon: Icons.DumbbellIcon,
        roles: ["PASANTE"],
        items: [
          {
            title: "Crear Evaluación",
            url: "/evolution/form-test",
            roles: ["ADMINISTRADOR", "DOCENTE"]
          },
          {
            title: "Aplicar Evaluación",
            url: "/evolution/assign-test",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
          {
            title: "Evaluaciones Registradas",
            url: "/evolution/list-test",
            roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"]
          },
        ],
      },
      {
        title: "Ver progreso",
        url: "/history/measurements",
        icon: Icons.ProgressIcon,
        roles: ["PASANTE", "ADMINISTRADOR", "DOCENTE"],
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
        roles: ["ADMINISTRADOR"],
        items: [],
      },
    ],
  },
];
