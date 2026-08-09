import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as carService from "../../services/carService";
import * as bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getCarById(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: () => bookingService.createBooking({ carId: id!, startDate, endDate }),
    onSuccess: () => navigate("/dashboard/bookings"),
    onError: (err: any) => setError(err?.response?.data?.message || "Booking failed"),
  });

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please choose both a start and end date");
      return;
    }
    bookingMutation.mutate();
  }

  if (isLoading) return <p className="mx-auto max-w-4xl px-4 py-10 text-navy-500">Loading…</p>;
  if (!car) return <p className="mx-auto max-w-4xl px-4 py-10 text-navy-500">Car not found.</p>;

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 0;
  const total = days * Number(car.pricePerDay);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-navy-50">
          <img
            src={car.image || "https://placehold.co/600x400?text=No+Image"}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">
            {car.brand} {car.model} ({car.year})
          </h1>
          <p className="mt-1 text-navy-500">
            {car.transmission} · {car.fuelType} · {car.seats} seats
          </p>
          <p className="mt-4 font-display text-3xl font-bold text-navy-900">
            KSh {Number(car.pricePerDay).toFixed(0)}
            <span className="text-base font-normal text-navy-500"> / day</span>
          </p>

          <form onSubmit={handleBook} className="card mt-6 space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Start date
                <input
                  type="date"
                  className="input mt-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="text-sm">
                End date
                <input
                  type="date"
                  className="input mt-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            {days > 0 && (
              <p className="text-sm text-navy-600">
                {days} day{days > 1 ? "s" : ""} · Total: <span className="font-semibold">KSh {total.toFixed(0)}</span>
              </p>
            )}
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={car.status !== "AVAILABLE" || bookingMutation.isPending}
            >
              {car.status !== "AVAILABLE" ? "Not available" : bookingMutation.isPending ? "Booking…" : "Book this car"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}