import { CreateUserRequest, CreateUserResponse } from "../types/user";
import { get, put } from "@/hooks/apiUtils";

const API_URL = "http://localhost:5000/api";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  password?: string;
}

export const userService = {
  getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await fetch(`${API_URL}/save-user`, {
        method: "POST",
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
  },

  async getProfile() {
    const response = await get("/users/profile");
    return response;
  },

  async updateProfile(data: UserProfileData) {
    const response = await put("/users/profile", data);
    return response;
  },
};
