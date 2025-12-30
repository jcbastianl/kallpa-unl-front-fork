import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar token automáticamente a las peticiones autenticadas
apiClient.interceptors.request.use(
    (config) => {
        // Solo agregar token si no es una ruta pública
        const publicRoutes = ['/auth/login', '/auth/register'];
        const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
        
        if (!isPublicRoute) {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const get = async <T>(url: string): Promise<T> => {
    const response = await apiClient.get<T>(url);
    return response.data;
};

export const post = async <T, B>(url: string, data: B): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
};

// POST con autenticación (usa el interceptor automáticamente)
export const postWithAuth = async <T, B>(url: string, data: B): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Si es 401, podríamos redirigir al login
        if (error.response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/auth/sign-in';
          }
        }
        return error.response.data;
      }
      throw error;
    }
};

export const put = async <T, B>(url: string, data: B): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
};
