export type Role = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
}

export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  transmission: string;
  fuelType: string;
  seats: number;
  image?: string;
  status: CarStatus;
  rentedAt?: string | null;
}

export type BookingStatus = "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  car: Car;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
}
