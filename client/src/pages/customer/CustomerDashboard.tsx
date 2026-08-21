import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarCheck, Wallet, ArrowRight } from "lucide-react";
import * as bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";

const statusColors: Record<string, string> = {
  PENDING: "#f3a13a",
  APPROVED: "#2f4a73",
  COMPLETED: "#1a2c46",
  CANCELLED: "#fb7185",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useQuery({ queryKey: ["bookings"], queryFn: bookingService.getBookings });

  const active = bookings?.filter((b) => b.status === "APPROVED" || b.status === "PENDING") ?? [];
  const totalSpend = useMemo(
    () => (bookings ?? []).filter((b) => b.status !== "CANCELLED").reduce((sum, b) => sum + Number(b.totalPrice), 0),
    [bookings]
  );

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    (bookings ?? []).forEach((b) => {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: statusColors[name] ?? "#8296b8" }));
  }, [bookings]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Welcome back, {user?.firstName}!</h1>
      <p className="mt-1 text-navy-500">Here's a quick look at your rentals.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-navy-500">Active bookings</p>
            <CalendarCheck className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">{isLoading ? "…" : active.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-navy-500">Total spent</p>
            <Wallet className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">
            {isLoading ? "…" : `Ksh ${totalSpend.toFixed(0)}`}
          </p>
        </div>
        <Link to="/cars" className="card flex flex-col justify-center p-5 hover:shadow-md">
          <p className="flex items-center gap-1.5 font-semibold text-amber-600">
            Book a new car <ArrowRight className="h-4 w-4" />
          </p>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Booking status breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy-900">Booking Status</h2>
          {statusData.length > 0 ? (
            <>
              <div className="mx-auto mt-2 h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={d.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-navy-500">
                {statusData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-navy-400">Book a car to see your stats here.</p>
          )}
        </div>

        {/* Recent bookings */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Recent Bookings</h2>
            <Link to="/dashboard/bookings" className="text-xs font-medium text-amber-600 hover:underline">
              View More
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {bookings?.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg px-1 py-2 hover:bg-navy-50/60">
                <div>
                  <p className="font-medium text-navy-900">
                    {b.car.brand} {b.car.model}
                  </p>
                  <p className="text-sm text-navy-500">
                    {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${statusColors[b.status] ?? "#8296b8"}1a`,
                    color: statusColors[b.status] ?? "#8296b8",
                  }}
                >
                  {b.status}
                </span>
              </div>
            ))}
            {bookings?.length === 0 && <p className="text-navy-500">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}