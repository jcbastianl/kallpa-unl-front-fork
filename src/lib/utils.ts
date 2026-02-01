/**
 * @module utils
 * @description Funciones utilitarias compartidas en toda la aplicación.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind CSS de manera segura.
 * Utiliza clsx para combinar y twMerge para resolver conflictos.
 * @param inputs - Clases CSS a combinar
 * @returns Cadena de clases CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parsea una cadena de fecha en formato YYYY-MM-DD a objeto Date.
 * Evita problemas de zona horaria estableciendo la hora a mediodía.
 * @param dateStr - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date correspondiente
 */
export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};
