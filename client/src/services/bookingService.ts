import api from "./api";
import { Booking, BookingStatus } from "../types";

export async function getBookings() {
  const { data } = await api.get<{ data: Booking[] }>("/bookings");
  return data.data;
}

export async function createBooking(payload: { carId: string; startDate: string; endDate: string }) {
  const { data } = await api.post<{ data: Booking }>("/bookings", payload);
  return data.data;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { data } = await api.put<{ data: Booking }>(`/bookings/${id}`, { status });
  return data.data;
}
