import { Link } from "react-router-dom";
import { Car } from "../types";

const statusStyles: Record<Car["status"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  RENTED: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-rose-50 text-rose-700",
};

export default function CarCard({ car }: { car: Car }) {
  return (
    <Link to={`/cars/${car.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-navy-50">
        <img
          src={car.image || "https://placehold.co/600x400?text=No+Image"}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-navy-900">
            {car.brand} {car.model}
          </h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[car.status]}`}>
            {car.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-navy-500">
          {car.year} · {car.transmission} · {car.fuelType} · {car.seats} seats
        </p>
        <p className="mt-3 font-display text-lg font-bold text-navy-900">
          KSh {Number(car.pricePerDay).toFixed(0)}
          <span className="text-sm font-normal text-navy-500"> / day</span>
        </p>
      </div>
    </Link>
  );
}