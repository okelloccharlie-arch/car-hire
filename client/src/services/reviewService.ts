import api from "./api";
import { Review } from "../types";

export async function createReview(payload: { bookingId: string; rating: number; comment?: string }) {
  const { data } = await api.post<{ data: Review }>("/reviews", payload);
  return data.data;
}

export async function getCarReviews(carId: string) {
  const { data } = await api.get<{ data: { reviews: Review[]; average: number; count: number } }>(
    `/reviews/car/${carId}`
  );
  return data.data;
}

export async function getAllReviews() {
  const { data } = await api.get<{ data: Review[] }>("/reviews");
  return data.data;
}

export async function deleteReview(id: string) {
  await api.delete(`/reviews/${id}`);
}