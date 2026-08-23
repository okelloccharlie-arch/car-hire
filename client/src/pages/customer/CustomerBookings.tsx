import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Star } from "lucide-react";
import * as bookingService from "../../services/bookingService";
import * as reviewService from "../../services/reviewService";
import { formatMoney } from "../../utils/format";
import { downloadBookingReceipt } from "../../utils/receipt";
import StarRating from "../../components/StarRating";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-navy-100 text-navy-700",
};

export default function CustomerBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["bookings"], queryFn: bookingService.getBookings });
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.updateBookingStatus(id, "CANCELLED"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const reviewMutation = useMutation({
    mutationFn: (bookingId: string) => reviewService.createReview({ bookingId, rating, comment: comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setReviewingId(null);
      setRating(5);
      setComment("");
    },
  });

  function startReview(bookingId: string) {
    setReviewingId(bookingId);
    setRating(5);
    setComment("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">My bookings</h1>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                {(b.status === "APPROVED" || b.status === "COMPLETED") && (
                  <button
                    className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
                    onClick={() => downloadBookingReceipt(b)}
                  >
                    <Download className="h-4 w-4" /> Receipt
                  </button>
                )}
                {b.status === "COMPLETED" &&
                  (b.review ? (
                    <span className="flex items-center gap-1 text-sm text-navy-400">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Reviewed
                    </span>
                  ) : (
                    <button
                      className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
                      onClick={() => startReview(b.id)}
                    >
                      <Star className="h-4 w-4" /> Leave a review
                    </button>
                  ))}
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

            {reviewingId === b.id && (
              <div className="mt-4 rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                <p className="text-sm font-medium text-navy-900">Rate your rental</p>
                <div className="mt-2">
                  <StarRating value={rating} onChange={setRating} size={24} />
                </div>
                <textarea
                  className="input mt-3 min-h-20"
                  placeholder="How was the car and the service? (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-primary"
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate(b.id)}
                  >
                    Submit review
                  </button>
                  <button className="btn-secondary" onClick={() => setReviewingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {bookings?.length === 0 && <p className="text-navy-500">You have no bookings yet.</p>}
      </div>
    </div>
  );
}