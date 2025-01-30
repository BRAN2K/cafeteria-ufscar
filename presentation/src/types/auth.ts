// src/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}
