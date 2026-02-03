function dispatchEvent(name: string, message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(name, { detail: { message } })
    );
  }
}

export async function fetchWithSession(
  input: RequestInfo,
  init?: RequestInit
) {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    dispatchEvent(
      "SERVER_DOWN",
      "No se puede conectar con el servidor. Intenta nuevamente más tarde."
    );
    throw new Error("SERVER_DOWN");
  }

  // Log para debugging
  console.log(`[fetchWithSession] ${init?.method || 'GET'} ${input} - Status: ${response.status}`);

  if (response.status === 401 || response.status === 403) {
    let message = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
    try {
      const data = await response.clone().json();
      message = data?.msg ?? message;
    } catch { }

    dispatchEvent("SESSION_EXPIRED", message);

    throw new Error("SESSION_EXPIRED");
  }

  return response;
}
