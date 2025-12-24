import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

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
  

export const put = async <T, B>(url: string, data: B): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
};
