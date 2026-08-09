import api from "./api";
import { Car } from "../types";

export interface CarFilters {
  search?: string;
  brand?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export async function getCars(filters: CarFilters = {}) {
  const { data } = await api.get<{ data: Car[] }>("/cars", { params: filters });
  return data.data;
}

export async function getCarById(id: string) {
  const { data } = await api.get<{ data: Car }>(`/cars/${id}`);
  return data.data;
}

export async function createCar(payload: FormData) {
  const { data } = await api.post<{ data: Car }>("/cars", payload);
  return data.data;
}

export async function updateCar(id: string, payload: FormData) {
  const { data } = await api.put<{ data: Car }>(`/cars/${id}`, payload);
  return data.data;
}

export async function deleteCar(id: string) {
  await api.delete(`/cars/${id}`);
}
