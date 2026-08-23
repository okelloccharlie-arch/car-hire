import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "../../services/bookingService";
import { formatMoney } from "../../utils/format";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-navy-100 text-navy-700",
};

export default function CustomerBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["bookings"], queryFn: bookingService.getBookings });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.updateBookingStatus(id, "CANCELLED"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">My bookings</h1>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-navy-900">
                {b.car.brand} {b.car.model} ({b.car.year})
              </p>
              <p className="text-sm text-navy-500">
                {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · Ksh{" "}
                {formatMoney(b.totalPrice)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[b.status]}`}>{b.status}</span>
              {(b.status === "PENDING" || b.status === "APPROVED") && (
                <button
                  className="btn-secondary"
                  onClick={() => cancelMutation.mutate(b.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {bookings?.length === 0 && <p className="text-navy-500">You have no bookings yet.</p>}
      </div>
    </div>
  );
}
