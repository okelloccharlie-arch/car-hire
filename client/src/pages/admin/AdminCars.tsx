import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as carService from "../../services/carService";

const emptyForm = {
  brand: "",
  model: "",
  year: "",
  pricePerDay: "",
  transmission: "Automatic",
  fuelType: "Petrol",
  seats: "5",
  status: "AVAILABLE",
};

export default function AdminCars() {
  const queryClient = useQueryClient();
  const { data: cars, isLoading } = useQuery({ queryKey: ["cars", "admin"], queryFn: () => carService.getCars() });
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => carService.createCar(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      setForm(emptyForm);
      setImageFile(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carService.deleteCar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    createMutation.mutate(fd);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Manage cars</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add car"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-4 grid grid-cols-2 gap-3 p-5">
          <input className="input" placeholder="Brand" value={form.brand} onChange={update("brand")} required />
          <input className="input" placeholder="Model" value={form.model} onChange={update("model")} required />
          <input className="input" type="number" placeholder="Year" value={form.year} onChange={update("year")} required />
          <input
            className="input"
            type="number"
            placeholder="Price per day"
            value={form.pricePerDay}
            onChange={update("pricePerDay")}
            required
          />
          <select className="input" value={form.transmission} onChange={update("transmission")}>
            <option>Automatic</option>
            <option>Manual</option>
          </select>
          <select className="input" value={form.fuelType} onChange={update("fuelType")}>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
            <option>Hybrid</option>
          </select>
          <input className="input" type="number" placeholder="Seats" value={form.seats} onChange={update("seats")} required />
          <select className="input" value={form.status} onChange={update("status")}>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <input
            className="input col-span-2"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <button type="submit" className="btn-primary col-span-2" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Save car"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="py-2">Car</th>
              <th className="py-2">Price/day</th>
              <th className="py-2">Status</th>
              <th className="py-2">Rented since</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 text-navy-500" colSpan={5}>Loading…</td>
              </tr>
            )}
            {cars?.map((car) => (
              <tr key={car.id} className="border-b border-navy-50">
                <td className="py-3 font-medium text-navy-900">
                  {car.brand} {car.model} ({car.year})
                </td>
                <td className="py-3">KSh {Number(car.pricePerDay).toFixed(0)}</td>
                <td className="py-3">{car.status}</td>
                <td className="py-3 text-navy-500">
                  {car.rentedAt ? new Date(car.rentedAt).toLocaleString() : "—"}
                </td>
                <td className="py-3 text-right">
                  <button
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => deleteMutation.mutate(car.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}