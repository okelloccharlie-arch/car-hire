import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reviewService from "../../services/reviewService";
import StarRating from "../../components/StarRating";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useQuery({ queryKey: ["reviews", "admin"], queryFn: reviewService.getAllReviews });

  const deleteMutation = useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Reviews</h1>
      <p className="mt-1 text-navy-500">Moderate customer reviews left on your vehicles.</p>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {reviews?.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-navy-900">
                {r.car?.brand} {r.car?.model}
                {r.user && (
                  <span className="font-normal text-navy-400">
                    {" "}
                    · {r.user.firstName} {r.user.lastName}
                  </span>
                )}
              </p>
              <div className="mt-1">
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-navy-600">{r.comment}</p>}
              <p className="mt-1 text-xs text-navy-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              className="btn-secondary"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm("Delete this review? This can't be undone.")) deleteMutation.mutate(r.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
        {reviews?.length === 0 && <p className="text-navy-500">No reviews yet.</p>}
      </div>
    </div>
  );
}