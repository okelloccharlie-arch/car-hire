import api from "./api";
import { ContactMessage } from "../types";

export async function sendContactMessage(payload: { name: string; email: string; message: string }) {
  await api.post("/contact", payload);
}

export async function getMessages() {
  const { data } = await api.get<{ data: ContactMessage[] }>("/contact");
  return data.data;
}

export async function markMessageRead(id: string) {
  const { data } = await api.patch<{ data: ContactMessage }>(`/contact/${id}/read`);
  return data.data;
}

export async function deleteMessage(id: string) {
  await api.delete(`/contact/${id}`);
}