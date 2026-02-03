import { CreateUserRequest, CreateUserResponse } from "../types/user";
import { get, put } from "@/hooks/apiUtils";
import { fetchWithSession } from "./fetchWithSession";

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
    const response = await fetchWithSession(`${API_URL}/save-user`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }

    return result;
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
