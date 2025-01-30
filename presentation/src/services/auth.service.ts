import api from "./api";
import { LoginCredentials, AuthResponse } from "../types/auth";

export const authService = {
  async loginEmployee(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/employee/login",
      credentials
    );
    return data;
  },

  async loginCustomer(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/customer/login",
      credentials
    );
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
