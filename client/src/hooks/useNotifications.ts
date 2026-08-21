import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as bookingService from "../services/bookingService";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data } = useQuery({
    queryKey: ["bookings", "notifications"],
    queryFn: () => bookingService.getBookings(),
    enabled: !!user,
    refetchInterval: 30000, // poll every 30s so badges stay fresh without a manual refresh
  });

  const bookings = data ?? [];

  let items: NotificationItem[] = [];

  if (isAdmin) {
    // Admins are notified about bookings awaiting approval
    items = bookings
      .filter((b) => b.status === "PENDING")
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        title: `New booking request · ${b.car.brand} ${b.car.model}`,
        subtitle: b.user ? `${b.user.firstName} ${b.user.lastName}` : "Customer",
      }));
  } else {
    // Customers are notified about their own upcoming approved rentals
    const now = new Date();
    items = bookings
      .filter((b) => b.status === "APPROVED" && new Date(b.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        title: `Upcoming rental · ${b.car.brand} ${b.car.model}`,
        subtitle: `Starts ${new Date(b.startDate).toLocaleDateString()}`,
      }));
  }

  return { items, count: items.length, isAdmin };
}