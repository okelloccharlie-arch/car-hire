import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

interface Summary {
  totalCars: number;
  availableCars: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => (await api.get<{ data: Summary }>("/reports/summary")).data.data,
  });

  const cards = [
    { label: "Total cars", value: data?.totalCars },
    { label: "Available now", value: data?.availableCars },
    { label: "Customers", value: data?.totalCustomers },
    { label: "Total bookings", value: data?.totalBookings },
    { label: "Active bookings", value: data?.activeBookings },
    { label: "Revenue", value: data ? `$${Number(data.totalRevenue).toFixed(0)}` : undefined },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Admin overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-navy-500">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-navy-900">
              {isLoading ? "…" : c.value ?? 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
