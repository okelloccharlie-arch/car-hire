import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as carService from "../../services/carService";
import CarCard from "../../components/CarCard";

export default function Home() {
  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", "featured"],
    queryFn: () => carService.getCars({ status: "AVAILABLE" }),
  });

  return (
    <div>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-400">
            Rentals, without the front-desk queue
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Book the right car in minutes, not phone calls.
          </h1>
          <p className="mt-4 max-w-lg text-navy-200">
            Browse live availability, compare vehicles, and reserve online — no paperwork, no double bookings.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/cars" className="btn-primary">Browse cars</Link>
            <Link to="/register" className="btn-secondary bg-transparent text-white hover:bg-white/10 border-white/30">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-navy-900">Available now</h2>
          <Link to="/cars" className="text-sm font-medium text-amber-600 hover:text-amber-700">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && <p className="text-navy-500">Loading cars…</p>}
          {cars?.slice(0, 4).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
          {cars?.length === 0 && <p className="text-navy-500">No cars available right now.</p>}
        </div>
      </section>
    </div>
  );
}
