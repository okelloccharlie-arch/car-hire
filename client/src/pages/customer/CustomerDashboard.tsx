import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: bookingService.getBookings });

  const active = bookings?.filter((b) => b.status === "APPROVED" || b.status === "PENDING") ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Welcome back, {user?.firstName}</h1>
      <p className="mt-1 text-navy-500">Here's a quick look at your rentals.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-navy-500">Active bookings</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{active.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-navy-500">Total bookings</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{bookings?.length ?? 0}</p>
        </div>
        <Link to="/cars" className="card flex flex-col justify-center p-5 hover:shadow-md">
          <p className="font-semibold text-amber-600">Book a new car →</p>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-navy-900">Recent bookings</h2>
        <div className="mt-3 space-y-3">
          {bookings?.slice(0, 5).map((b) => (
            <div key={b.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-navy-900">
                  {b.car.brand} {b.car.model}
                </p>
                <p className="text-sm text-navy-500">
                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">{b.status}</span>
            </div>
          ))}
          {bookings?.length === 0 && <p className="text-navy-500">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
