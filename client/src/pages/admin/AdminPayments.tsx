import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as paymentService from "../../services/paymentService";
import { PaymentStatus } from "../../types";
import { formatMoney } from "../../utils/format";

const statusStyles: Record<PaymentStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-rose-50 text-rose-700",
};

const filters: { label: string; value: PaymentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
];

const methodLabels: Record<string, string> = {
  MPESA: "M-Pesa",
  DEBIT_CARD: "Visa / Mastercard Debit",
  CREDIT_CARD: "Credit Card",
  PESALINK: "PesaLink",
};

export default function AdminPayments() {
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", "admin"],
    queryFn: paymentService.getPayments,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      paymentService.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "summary"] });
    },
  });

  const filtered = useMemo(
    () => (payments ?? []).filter((p) => filter === "ALL" || p.paymentStatus === filter),
    [payments, filter]
  );

  const totals = useMemo(() => {
    const list = payments ?? [];
    const paid = list.filter((p) => p.paymentStatus === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = list.filter((p) => p.paymentStatus === "PENDING").length;
    const failed = list.filter((p) => p.paymentStatus === "FAILED").length;
    return { paid, pending, failed };
  }, [payments]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Payments</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-navy-500">Confirmed revenue</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">
            {isLoading ? "…" : `Ksh ${formatMoney(totals.paid)}`}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-navy-500">Pending payments</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{isLoading ? "…" : totals.pending}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-navy-500">Failed payments</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{isLoading ? "…" : totals.failed}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value ? "bg-navy-900 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="py-2">Customer</th>
              <th className="py-2">Car</th>
              <th className="py-2">Method</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 text-navy-500" colSpan={7}>
                  Loading…
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-navy-50">
                <td className="py-3 font-medium text-navy-900">
                  {p.booking.user ? `${p.booking.user.firstName} ${p.booking.user.lastName}` : "—"}
                  {p.booking.user && <p className="text-xs font-normal text-navy-400">{p.booking.user.email}</p>}
                </td>
                <td className="py-3">
                  {p.booking.car.brand} {p.booking.car.model}
                </td>
                <td className="py-3">{methodLabels[p.paymentMethod] ?? p.paymentMethod}</td>
                <td className="py-3">Ksh {formatMoney(p.amount)}</td>
                <td className="py-3 text-navy-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[p.paymentStatus]}`}>
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    {p.paymentStatus !== "PAID" && (
                      <button
                        className="btn-primary px-3 py-1.5 text-xs"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: p.id, paymentStatus: "PAID" })}
                      >
                        Mark paid
                      </button>
                    )}
                    {p.paymentStatus !== "FAILED" && (
                      <button
                        className="btn-secondary px-3 py-1.5 text-xs"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: p.id, paymentStatus: "FAILED" })}
                      >
                        Mark failed
                      </button>
                    )}
                    {p.paymentStatus !== "PENDING" && (
                      <button
                        className="text-navy-500 hover:text-navy-700"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: p.id, paymentStatus: "PENDING" })}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td className="py-3 text-navy-500" colSpan={7}>
                  No payments {filter !== "ALL" ? "in this category" : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}