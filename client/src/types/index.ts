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
export type DriveType = "SELF_DRIVE" | "CHAUFFEUR";
export type PaymentMethod = "MPESA" | "DEBIT_CARD" | "CREDIT_CARD" | "PESALINK";

export interface BookingCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  car: Car;
  user?: BookingCustomer;
  startDate: string;
  endDate: string;
  driveType: DriveType;
  totalPrice: number;
  status: BookingStatus;
  review?: { id: string } | null;
}

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string };
  car?: Car;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export interface Payment {
  id: string;
  bookingId: string;
  booking: Booking;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}