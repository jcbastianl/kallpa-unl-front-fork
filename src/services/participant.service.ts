import { Participant } from "@/types/participant";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const participantService = {
  getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token || "",
    };
  },

  async create(data: any) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      email: data.email || `${data.dni}@participante.local`,
      phone: data.phone || "",
      address: data.address || "",
      age: data.age || 0,
      type: data.type,
      password: data.password || undefined,
    };

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.msg || result.message || "Error al registrar participante",
      );
    }

    return result;
  },

  async getAll(): Promise<Participant[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const list = Array.isArray(result) ? result : result.data || [];

    return list
      .map((p: any) => ({
        id: p.external_id || p.java_external || p.id?.toString() || p.dni,
        firstName: p.firstName || p.first_name || "",
        lastName: p.lastName || p.last_name || "",
        dni: p.dni || p.identification || "",
        email: p.email || "",
        phone: p.phone || p.phono || "",
        address: p.address || p.direction || "",
        age: p.age || 0,
        type: p.type || p.type_stament || "PARTICIPANTE",
        role: p.role || "USER",
        status: p.status || "ACTIVO",
      }))
      .filter(
        (p: any) =>
          p.type !== "ADMINISTRATIVO" &&
          p.type !== "DOCENTEADMIN" &&
          p.type !== "PASANTE"
      );
  },

  async searchByDni(dni: string): Promise<Participant | null> {
    const response = await fetch(`${API_URL}/users/search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ dni }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.status === "ok" && result.data) {
      return {
        id:
          result.data.external_id ||
          result.data.java_external ||
          result.data.id?.toString(),
        firstName: result.data.firstName || result.data.first_name || "",
        lastName: result.data.lastName || result.data.last_name || "",
        dni: result.data.dni || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        address: result.data.address || "",
        type: result.data.type || "PARTICIPANTE",
        status: result.data.status || "ACTIVO",
      };
    }

    return null;
  },

  async changeStatus(externalId: string, newStatus: string) {
    const response = await fetch(`${API_URL}/users/${externalId}/status`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || "Error al cambiar estado");
    }

    return result;
  },

  async createInitiation(data: any) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      dni: data.dni,
      address: data.address || "",
      type: "INICIACION",
      responsible: {
        name: data.responsibleName,
        dni: data.responsibleDni,
        phone: data.responsiblePhone,
        relationship: data.relationship,
      },
    };

    const response = await fetch(`${API_URL}/users/initiation`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || "Error al registrar iniciación");
    }

    return result;
  },


  async getPasantes(): Promise<Participant[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const list = Array.isArray(result) ? result : result.data || [];

    return list
      .map((p: any) => ({
        id: p.external_id || p.java_external || p.id?.toString() || p.dni,
        firstName: p.firstName || p.first_name || "",
        lastName: p.lastName || p.last_name || "",
        dni: p.dni || p.identification || "",
        email: p.email || "",
        phone: p.phone || p.phono || "",
        address: p.address || p.direction || "",
        age: p.age || 0,
        type: p.type || "PASANTE",
        role: p.role || "USER",
        status: p.status || "ACTIVO",
      }))
      .filter((p: any) => p.type === 'PASANTE');
  },

  // Método para crear participante y manejar errores del backend
  async createParticipant(data: any) {
    const isMinor = data.age < 18 || data.type === "INICIACION";

    const payload = isMinor
      ? {
        type: "INICIACION",
        program: data.program,
        participant: {
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          dni: data.dni,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        },
        responsible: {
          name: data.responsibleName,
          dni: data.responsibleDni,
          phone: data.responsiblePhone,
        },
      }
      : {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        dni: data.dni,
        phone: data.phone || "",
        email: data.email || `${data.dni}@participante.local`,
        address: data.address || "",
        type: data.type,
        program: data.program,
      };

    const response = await fetch(`${API_URL}/save-participants`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  },

  async getActiveParticipantsCounts(): Promise<{ adult: number; minor: number }> {
    const response = await fetch(`${API_URL}/participants/active/count`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || "Error al obtener totales de participantes");
    }

    return result.data;
  }
};
