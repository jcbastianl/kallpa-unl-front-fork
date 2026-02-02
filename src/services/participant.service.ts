import { Participant, UpdateParticipantData } from "@/types/participant";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const participantService = {
  getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
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

  async getAll(): Promise<Participant[] | undefined> {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return undefined;
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
    } catch (error) {
      return undefined;
    }
  },

  /**
   * Obtiene un participante por su ID externo.
   * Intenta obtener datos completos (incluyendo responsable) desde /participants/:id.
   * Si falla, hace fallback a /users para obtener datos básicos.
   */
  async getById(externalId: string): Promise<Participant | null> {
    // Usar el endpoint específico de participantes que incluye datos del responsable
    try {
      const response = await fetch(`${API_URL}/participants/${externalId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;

        if (data) {
          // La API puede devolver estructura plana o anidada {participant: {...}, responsible: {...}}
          const participantData = data.participant || data;
          const responsibleData = data.responsible;

          return {
            id: participantData.external_id || externalId,
            firstName: participantData.firstName || participantData.first_name || "",
            lastName: participantData.lastName || participantData.last_name || "",
            dni: participantData.dni || "",
            email: participantData.email || "",
            phone: participantData.phone || participantData.phono || "",
            address: participantData.address || participantData.direction || "",
            age: participantData.age || 0,
            type: participantData.type || participantData.type_stament || "PARTICIPANTE",
            program: participantData.program || undefined,
            role: participantData.role || "USER",
            status: participantData.status || "ACTIVO",
            responsible: responsibleData ? {
              name: responsibleData.name || "",
              dni: responsibleData.dni || "",
              phone: responsibleData.phone || "",
            } : undefined,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching participant by ID:", error);
    }

    // Fallback: obtener todos y filtrar (no incluye datos del responsable)
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const list = Array.isArray(result) ? result : result.data || [];

    const found = list.find(
      (p: any) =>
        p.external_id === externalId ||
        p.java_external === externalId ||
        p.id?.toString() === externalId
    );

    if (found) {
      return {
        id: found.external_id || found.java_external || found.id?.toString(),
        firstName: found.firstName || found.first_name || "",
        lastName: found.lastName || found.last_name || "",
        dni: found.dni || "",
        email: found.email || "",
        phone: found.phone || found.phono || "",
        address: found.address || found.direction || "",
        age: found.age || 0,
        type: found.type || found.type_stament || "PARTICIPANTE",
        program: found.program || undefined,
        role: found.role || "USER",
        status: found.status || "ACTIVO",
        responsible: found.responsible ? {
          name: found.responsible.name || "",
          dni: found.responsible.dni || "",
          phone: found.responsible.phone || "",
        } : undefined,
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
    try {
      const age = Number(data.age);
      const isMinor = age > 0 && age < 18;

      const payload = isMinor
        ? {
          participant: {
            firstName: data.firstName,
            lastName: data.lastName,
            age: data.age,
            dni: data.dni,
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            type: data.type,
            program: data.program,
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
        throw result; // el backend manda { data, msg, etc }
      }
      return result;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw { type: "SERVER_DOWN" };
      }
      throw error;
    }
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
  },

  /**
   * Actualiza un participante existente.
   * Si tiene datos de responsable (solo permitido si ya tenía responsable previamente),
   * envía estructura anidada {participant: {...}, responsible: {...}}.
   */
  async updateParticipant(externalId: string, data: UpdateParticipantData) {
    try {
      const response = await fetch(`${API_URL}/participants/${externalId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw result;
      }
      return result;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw { type: "SERVER_DOWN" };
      }
      throw error;
    }
  }
};
