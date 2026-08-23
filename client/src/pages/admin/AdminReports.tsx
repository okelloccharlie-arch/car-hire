import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import api from "../../services/api";
import { formatMoney } from "../../utils/format";

interface MonthlyRevenue {
  month: string;
  label: string;
  bookings: number;
  revenue: number;
}

interface PopularCar {
  carId: string;
  brand: string;
  model: string;
  bookings: number;
  revenue: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface DriveTypeBreakdown {
  driveType: string;
  count: number;
  revenue: number;
}

interface CustomerGrowth {
  month: string;
  label: string;
  newCustomers: number;
}

interface Breakdown {
  monthlyRevenue: MonthlyRevenue[];
  popularCars: PopularCar[];
  statusBreakdown: StatusBreakdown[];
  driveTypeBreakdown: DriveTypeBreakdown[];
  customerGrowth: CustomerGrowth[];
}

const statusColors: Record<string, string> = {
  PENDING: "#f3a13a",
  APPROVED: "#2f4a73",
  COMPLETED: "#1a2c46",
  CANCELLED: "#fb7185",
};

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "breakdown"],
    queryFn: async () => (await api.get<{ data: Breakdown }>("/reports/breakdown")).data.data,
  });

  function exportPopularCars() {
    if (!data) return;
    const rows: (string | number)[][] = [["Rank", "Car", "Bookings", "Revenue (Ksh)"]];
    data.popularCars.forEach((c, i) => rows.push([i + 1, `${c.brand} ${c.model}`, c.bookings, c.revenue]));
    downloadCsv("popular-cars.csv", rows);
  }

  function exportMonthlyRevenue() {
    if (!data) return;
    const rows: (string | number)[][] = [["Month", "Bookings", "Revenue (Ksh)"]];
    data.monthlyRevenue.forEach((m) => rows.push([m.label, m.bookings, m.revenue]));
    downloadCsv("monthly-revenue.csv", rows);
  }

  function exportCustomerGrowth() {
    if (!data) return;
    const rows: (string | number)[][] = [["Month", "New Customers"]];
    data.customerGrowth.forEach((m) => rows.push([m.label, m.newCustomers]));
    downloadCsv("customer-growth.csv", rows);
  }

  const totalRevenue12mo = data?.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Reports</h1>
      <p className="mt-1 text-navy-500">Revenue trends and fleet performance over the last 12 months.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-navy-500">Revenue (12 mo)</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy-900">
            {isLoading ? "…" : `Ksh ${formatMoney(totalRevenue12mo)}`}
          </p>
        </div>
        {data?.driveTypeBreakdown.map((d) => (
          <div key={d.driveType} className="card p-5">
            <p className="text-sm text-navy-500">{d.driveType === "SELF_DRIVE" ? "Self-drive" : "Chauffeur"} bookings</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy-900">{d.count}</p>
            <p className="text-xs text-navy-400">Ksh {formatMoney(d.revenue)} booked</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly revenue */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Revenue by Month</h2>
            <button onClick={exportMonthlyRevenue} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRevenue ?? []} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} stroke="#f0f4fa" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8296b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#8296b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatMoney(v)}
                />
                <Tooltip formatter={(value) => [`Ksh ${formatMoney(value as number)}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#f3a13a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking status split */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy-900">Booking Status</h2>
          <div className="mx-auto mt-2 h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusBreakdown ?? []}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {(data?.statusBreakdown ?? []).map((s) => (
                    <Cell key={s.status} fill={statusColors[s.status] ?? "#8296b8"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-navy-500">
            {data?.statusBreakdown.map((s) => (
              <span key={s.status} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusColors[s.status] ?? "#8296b8" }}
                />
                {s.status} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Customer growth */}
      <div className="mt-4 card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">New Customers by Month</h2>
          <button onClick={exportCustomerGrowth} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="mt-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data?.customerGrowth ?? []} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#f0f4fa" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8296b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#8296b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} new customers`, "New customers"]} />
              <Bar dataKey="newCustomers" fill="#2f4a73" radius={[4, 4, 0, 0]} barSize={22} />
              <Line type="monotone" dataKey="newCustomers" stroke="#e8892a" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular cars table */}
      <div className="mt-4 card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Most Popular Cars</h2>
          <button onClick={exportPopularCars} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-navy-500">
                <th className="py-2">#</th>
                <th className="py-2">Car</th>
                <th className="py-2">Bookings</th>
                <th className="py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data?.popularCars.map((c, i) => (
                <tr key={c.carId} className="border-b border-navy-50">
                  <td className="py-2 text-navy-400">{i + 1}</td>
                  <td className="py-2 font-medium text-navy-900">
                    {c.brand} {c.model}
                  </td>
                  <td className="py-2">{c.bookings}</td>
                  <td className="py-2">Ksh {formatMoney(c.revenue)}</td>
                </tr>
              ))}
              {data?.popularCars.length === 0 && (
                <tr>
                  <td className="py-3 text-navy-400" colSpan={4}>
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}