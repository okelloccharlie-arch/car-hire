import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as bookingService from "../services/bookingService";

export function usePendingBookingsCount() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["bookings", "pending-count"],
    queryFn: () => bookingService.getBookings(),
    enabled: user?.role === "ADMIN",
    refetchInterval: 30000, // poll every 30s so admins see new bookings without refreshing
  });

  return data?.filter((b) => b.status === "PENDING").length ?? 0;
}