import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as carService from "../../services/carService";
import CarCard from "../../components/CarCard";

export default function Cars() {
  const [search, setSearch] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", { search, transmission, fuelType }],
    queryFn: () =>
      carService.getCars({
        search: search || undefined,
        transmission: transmission || undefined,
        fuelType: fuelType || undefined,
      }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy-900">Browse cars</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search brand or model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
          <option value="">Any transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>
        <select className="input max-w-[160px]" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
          <option value="">Any fuel type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-navy-500">Loading cars…</p>}
        {cars?.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
        {cars?.length === 0 && <p className="text-navy-500">No cars match your filters.</p>}
      </div>
    </div>
  );
}
