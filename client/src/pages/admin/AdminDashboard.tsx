import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Car, CarFront, Wrench, Users, Wallet, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import * as bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";

interface DailyStat {
  date: string;
  bookings: number;
  revenue: number;
}

interface TopCar {
  carId: string;
  brand: string;
  model: string;
  image: string | null;
  bookings: number;
}

interface Summary {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  overdueBookings: number;
  totalRevenue: number;
  dailyStats: DailyStat[];
  topCars: TopCar[];
}

const statusColors = { AVAILABLE: "#e8892a", RENTED: "#1a2c46", MAINTENANCE: "#fb7185" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => (await api.get<{ data: Summary }>("/reports/summary")).data.data,
  });
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: bookingService.getBookings });

  const cards = [
    { label: "Total Vehicles", value: data?.totalCars, icon: Car },
    { label: "Rented Today", value: data?.rentedCars, icon: CarFront },
    { label: "Under Maintenance", value: data?.maintenanceCars, icon: Wrench },
    { label: "Total Customers", value: data?.totalCustomers, icon: Users },
    { label: "Revenue", value: data ? `Ksh ${Number(data.totalRevenue).toFixed(0)}` : undefined, icon: Wallet },
  ];

  const donutData = data
    ? [
        { name: "Available", value: data.availableCars, color: statusColors.AVAILABLE },
        { name: "Rented", value: data.rentedCars, color: statusColors.RENTED },
        { name: "Maintenance", value: data.maintenanceCars, color: statusColors.MAINTENANCE },
      ].filter((d) => d.value > 0)
    : [];
  const availablePct = data && data.totalCars > 0 ? Math.round((data.availableCars / data.totalCars) * 100) : 0;

  const chartData =
    data?.dailyStats.map((d) => ({
      day: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Bookings: d.bookings,
      "Revenue (Ksh)": d.revenue,
    })) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Good morning, {user?.firstName}!</h1>
          <p className="mt-1 text-navy-500">Here's the health overview of your fleet at a glance.</p>
        </div>
        <select className="input w-auto text-sm" defaultValue="7">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {data && data.overdueBookings > 0 && (
        <Link
          to="/admin/bookings"
          className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {data.overdueBookings} vehicle{data.overdueBookings > 1 ? "s are" : " is"} overdue for return — review
          now
        </Link>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-500">{c.label}</p>
              <c.icon className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-navy-900 lg:text-3xl">
              {isLoading ? "…" : c.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Donut: fleet status */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Fleet Status by Category</h2>
          </div>
          <div className="relative mx-auto mt-2 h-56 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={2}>
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} cars`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-navy-400">Available</p>
              <p className="font-display text-2xl font-bold text-navy-900">{availablePct}%</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-navy-500">
            {donutData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({data && data.totalCars > 0 ? Math.round((d.value / data.totalCars) * 100) : 0}%)
              </span>
            ))}
          </div>
        </div>

        {/* Bar + line: bookings vs revenue */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-navy-900">Bookings vs Revenue</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} stroke="#f0f4fa" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8296b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#8296b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#8296b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar yAxisId="left" dataKey="Revenue (Ksh)" fill="#f3a13a" radius={[4, 4, 0, 0]} barSize={22} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Bookings"
                  stroke="#1a2c46"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top rented cars */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Top Rented Cars</h2>
            <Link to="/admin/cars" className="text-xs font-medium text-amber-600 hover:underline">
              View More
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {data?.topCars.map((c) => (
              <div key={c.carId} className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-navy-50">
                  {c.image ? (
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy-300">
                      <Car className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {c.brand} {c.model}
                  </p>
                  <p className="text-xs text-navy-400">{c.bookings} bookings</p>
                </div>
                <span className="font-display text-sm font-semibold text-navy-900">{c.bookings}</span>
              </div>
            ))}
            {data && data.topCars.length === 0 && <p className="text-sm text-navy-400">No bookings yet.</p>}
          </div>
        </div>

        {/* Recent bookings (replaces live map — no location tracking yet) */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-xs font-medium text-amber-600 hover:underline">
              Detail View
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {bookings?.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg px-1 py-2 hover:bg-navy-50/60">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {b.user ? `${b.user.firstName} ${b.user.lastName}` : "Customer"} · {b.car.brand} {b.car.model}
                  </p>
                  <p className="text-xs text-navy-400">
                    {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">
                  {b.status}
                </span>
              </div>
            ))}
            {bookings?.length === 0 && <p className="text-sm text-navy-400">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}