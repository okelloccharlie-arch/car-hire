import api from "./api";
import { Payment, PaymentStatus } from "../types";

export async function getPayments() {
  const { data } = await api.get<{ data: Payment[] }>("/payments");
  return data.data;
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  const { data } = await api.patch<{ data: Payment }>(`/payments/${id}`, { paymentStatus });
  return data.data;
}