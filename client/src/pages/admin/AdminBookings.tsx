import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import * as bookingService from "../../services/bookingService";
import { Booking, BookingStatus } from "../../types";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-navy-100 text-navy-700",
};

type FilterValue = "ALL" | "PENDING" | "ACTIVE" | "OVERDUE" | "COMPLETED" | "CANCELLED";

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Active rentals", value: "ACTIVE" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function isOverdue(b: Booking) {
  return b.status === "APPROVED" && new Date(b.endDate) < new Date();
}

function daysOverdue(b: Booking) {
  const ms = new Date().getTime() - new Date(b.endDate).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function AdminBookings() {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["bookings", "admin"], queryFn: bookingService.getBookings });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "summary"] });
    },
  });

  const overdueCount = useMemo(() => (bookings ?? []).filter(isOverdue).length, [bookings]);

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    switch (filter) {
      case "ALL":
        return list;
      case "PENDING":
        return list.filter((b) => b.status === "PENDING");
      case "ACTIVE":
        return list.filter((b) => b.status === "APPROVED" && !isOverdue(b));
      case "OVERDUE":
        return list.filter(isOverdue);
      case "COMPLETED":
        return list.filter((b) => b.status === "COMPLETED");
      case "CANCELLED":
        return list.filter((b) => b.status === "CANCELLED");
      default:
        return list;
    }
  }, [bookings, filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Bookings</h1>

      {overdueCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {overdueCount} vehicle{overdueCount > 1 ? "s are" : " is"} overdue for return.
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value ? "bg-navy-900 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {f.label}
            {f.value === "OVERDUE" && overdueCount > 0 && (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-[11px] text-white">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {filtered.map((b) => {
          const overdue = isOverdue(b);
          return (
            <div
              key={b.id}
              className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${
                overdue ? "border-rose-200 bg-rose-50/40" : ""
              }`}
            >
              <div>
                <p className="font-medium text-navy-900">
                  {b.car.brand} {b.car.model}
                  {b.user && <span className="font-normal text-navy-400"> · {b.user.firstName} {b.user.lastName}</span>}
                </p>
                <p className="text-sm text-navy-500">
                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · Ksh{" "}
                  {Number(b.totalPrice).toFixed(0)}
                </p>
                {overdue && (
                  <p className="mt-1 text-sm font-medium text-rose-600">
                    {daysOverdue(b)} day{daysOverdue(b) > 1 ? "s" : ""} overdue
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[b.status]}`}>
                  {overdue ? "OVERDUE" : b.status}
                </span>
                {b.status === "PENDING" && (
                  <button
                    className="btn-primary"
                    onClick={() => statusMutation.mutate({ id: b.id, status: "APPROVED" })}
                  >
                    Approve
                  </button>
                )}
                {b.status === "APPROVED" && (
                  <button
                    className="btn-primary"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: b.id, status: "COMPLETED" })}
                  >
                    Mark returned
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
          );
        })}
        {filtered.length === 0 && !isLoading && (
          <p className="text-navy-500">No bookings {filter !== "ALL" ? "in this category" : "yet"}.</p>
        )}
      </div>
    </div>
  );
}