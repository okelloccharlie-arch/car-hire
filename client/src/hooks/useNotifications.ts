import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as bookingService from "../services/bookingService";
import * as contactService from "../services/contactService";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  to: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data: bookingsData } = useQuery({
    queryKey: ["bookings", "notifications"],
    queryFn: () => bookingService.getBookings(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["contact", "notifications"],
    queryFn: () => contactService.getMessages(),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const bookings = bookingsData ?? [];
  const messages = messagesData ?? [];

  let items: NotificationItem[] = [];
  let pendingBookingsCount = 0;
  let unreadMessagesCount = 0;

  if (isAdmin) {
    const pendingBookings = bookings.filter((b) => b.status === "PENDING");
    pendingBookingsCount = pendingBookings.length;

    const unreadMessages = messages.filter((m) => !m.isRead);
    unreadMessagesCount = unreadMessages.length;

    const bookingItems: NotificationItem[] = pendingBookings.slice(0, 5).map((b) => ({
      id: `booking-${b.id}`,
      title: `New booking request · ${b.car.brand} ${b.car.model}`,
      subtitle: b.user ? `${b.user.firstName} ${b.user.lastName}` : "Customer",
      to: "/admin/bookings",
    }));

    const messageItems: NotificationItem[] = unreadMessages.slice(0, 5).map((m) => ({
      id: `message-${m.id}`,
      title: `New message from ${m.name}`,
      subtitle: m.message.length > 60 ? `${m.message.slice(0, 60)}…` : m.message,
      to: "/admin/messages",
    }));

    items = [...messageItems, ...bookingItems];
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
        to: "/dashboard/bookings",
      }));
  }

  return {
    items,
    count: items.length,
    isAdmin,
    pendingBookingsCount,
    unreadMessagesCount,
  };
}