import api from "./api";
import { User } from "../types";

interface AuthResponse {
  success: boolean;
  data: { token: string; user: User };
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data.data;
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data.data;
}

export async function logout() {
  await api.post("/auth/logout");
}
