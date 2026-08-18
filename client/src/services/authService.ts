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
export async function forgotPassword(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post<{ success: boolean; message: string }>("/auth/reset-password", { token, newPassword });
  return data;
}
