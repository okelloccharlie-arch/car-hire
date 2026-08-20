import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "../../services/bookingService";
import { BookingStatus } from "../../types";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-navy-100 text-navy-700",
};

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["bookings", "admin"], queryFn: bookingService.getBookings });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Bookings</h1>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-navy-900">
                {b.car.brand} {b.car.model}
              </p>
              <p className="text-sm text-navy-500">
                {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · Ksh
                {Number(b.totalPrice).toFixed(0)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[b.status]}`}>{b.status}</span>
              {b.status === "PENDING" && (
                <button
                  className="btn-primary"
                  onClick={() => statusMutation.mutate({ id: b.id, status: "APPROVED" })}
                >
                  Approve
                </button>
              )}
              {(b.status === "PENDING" || b.status === "APPROVED") && (
                <button
                  className="btn-secondary"
                  onClick={() => statusMutation.mutate({ id: b.id, status: "CANCELLED" })}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {bookings?.length === 0 && <p className="text-navy-500">No bookings yet.</p>}
      </div>
    </div>
  );
}
