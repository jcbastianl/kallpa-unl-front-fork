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
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await fetch(`${API_URL}/save-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || result.status === "error") {
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
