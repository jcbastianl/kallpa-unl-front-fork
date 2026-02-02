/**
 * @module error-handler
 * @description Utilidades para manejo centralizado de errores del backend
 */

/**
 * Extrae el mensaje de error del formato estándar del backend.
 * 
 * Formato esperado:
 * {
 *   "status": "error",
 *   "msg": "Mensaje descriptivo del error",
 *   "data": { "field": "detalle específico" },
 *   "code": 400
 * }
 * 
 * @param error - Error de axios u otro error
 * @returns Mensaje de error formateado para mostrar al usuario
 */
export function extractErrorMessage(error: any): string {
  // Si no hay error response (servidor apagado o sin conexión)
  if (!error?.response) {
    if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
      return 'No se puede conectar con el servidor. Por favor intenta nuevamente más tarde.';
    }
    if (error?.message?.includes('timeout')) {
      return 'El servidor tardó demasiado en responder. Intenta nuevamente.';
    }
    if (error?.message) {
      return error.message;
    }
    return 'Error de conexión con el servidor. Verifica tu conexión a internet.';
  }

  const response = error.response.data;
  
  // Mensaje principal del backend
  let errorMessage = response.msg || response.message || 'Error desconocido';

  // Si hay detalles en data, agregarlos
  if (response.data && typeof response.data === 'object') {
    const details = Object.entries(response.data)
      .map(([key, value]) => `${value}`)
      .filter(detail => detail && detail !== 'null' && detail !== 'undefined')
      .join('. ');
    
    if (details) {
      errorMessage += `. ${details}`;
    }
  }

  return errorMessage;
}

/**
 * Verifica si el error es por servidor caído o sin conexión.
 * @param error - Error de axios
 * @returns true si el servidor está apagado
 */
export function isServerDownError(error: any): boolean {
  return !error?.response || 
         error?.code === 'ERR_NETWORK' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('ECONNREFUSED');
}

/**
 * Verifica si el error es por autenticación (token inválido/expirado).
 * @param error - Error de axios
 * @returns true si es error de autenticación
 */
export function isAuthError(error: any): boolean {
  const code = error?.response?.status || error?.response?.data?.code;
  return code === 401;
}

/**
 * Verifica si el error es de validación (campos faltantes/inválidos).
 * @param error - Error de axios
 * @returns true si es error de validación
 */
export function isValidationError(error: any): boolean {
  const code = error?.response?.status || error?.response?.data?.code;
  return code === 400;
}

/**
 * Verifica si el error es de registro no encontrado.
 * @param error - Error de axios
 * @returns true si es error 404
 */
export function isNotFoundError(error: any): boolean {
  const code = error?.response?.status || error?.response?.data?.code;
  return code === 404;
}
