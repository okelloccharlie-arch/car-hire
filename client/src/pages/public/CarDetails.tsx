import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as carService from "../../services/carService";
import * as bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import { DriveType } from "../../types";

const CHAUFFEUR_FEE_PER_DAY = 2000; // KSh — mirrors the backend constant, for preview only

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [driveType, setDriveType] = useState<DriveType>("SELF_DRIVE");
  const [error, setError] = useState("");

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getCarById(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: () => bookingService.createBooking({ carId: id!, startDate, endDate, driveType }),
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
      setError("Please choose both a pickup and return date & time");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("Return time must be after pickup time");
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
  const baseTotal = days * Number(car.pricePerDay);
  const chauffeurFee = driveType === "CHAUFFEUR" ? days * CHAUFFEUR_FEE_PER_DAY : 0;
  const total = baseTotal + chauffeurFee;

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
                Pickup date & time
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="text-sm">
                Return date & time
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>

            <div>
              <p className="text-sm mb-2">Package</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriveType("SELF_DRIVE")}
                  className={`rounded-md border-2 px-3 py-2.5 text-sm font-medium text-left transition ${
                    driveType === "SELF_DRIVE"
                      ? "border-amber-500 bg-amber-50 text-navy-900"
                      : "border-navy-100 text-navy-500 hover:border-navy-200"
                  }`}
                >
                  Self-drive
                  <div className="text-xs font-normal mt-0.5">You drive</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDriveType("CHAUFFEUR")}
                  className={`rounded-md border-2 px-3 py-2.5 text-sm font-medium text-left transition ${
                    driveType === "CHAUFFEUR"
                      ? "border-amber-500 bg-amber-50 text-navy-900"
                      : "border-navy-100 text-navy-500 hover:border-navy-200"
                  }`}
                >
                  Chauffeur-driven
                  <div className="text-xs font-normal mt-0.5">+KSh {CHAUFFEUR_FEE_PER_DAY.toLocaleString()}/day</div>
                </button>
              </div>
            </div>

            {days > 0 && (
              <div className="text-sm text-navy-600 space-y-0.5">
                <p>
                  {days} day{days > 1 ? "s" : ""} × KSh {Number(car.pricePerDay).toFixed(0)} = KSh {baseTotal.toFixed(0)}
                </p>
                {chauffeurFee > 0 && (
                  <p>
                    Chauffeur: {days} day{days > 1 ? "s" : ""} × KSh {CHAUFFEUR_FEE_PER_DAY.toLocaleString()} = KSh {chauffeurFee.toFixed(0)}
                  </p>
                )}
                <p className="font-semibold text-navy-900 pt-1">Total: KSh {total.toFixed(0)}</p>
              </div>
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