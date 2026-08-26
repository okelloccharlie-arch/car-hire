import api from "./api";

export async function sendContactMessage(payload: { name: string; email: string; message: string }) {
  await api.post("/contact", payload);
}