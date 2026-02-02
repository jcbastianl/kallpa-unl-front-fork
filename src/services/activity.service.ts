const API_URL = "http://localhost:5000/api";

export const RecentActivities = {
  getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  async getRecent() {
    try {
      const response = await fetch(`${API_URL}/activities/recent`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al obtener actividades");
      }

      const data = await response.json();
      console.log("----", data);
      return data.data;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        return undefined;
      }
      throw error;
    }
  },
};
