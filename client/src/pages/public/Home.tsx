import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as carService from "../../services/carService";
import CarCard from "../../components/CarCard";

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 40));
            const tick = () => {
              current += step;
              if (current >= target) {
                setValue(target);
                return;
              }
              setValue(current);
              requestAnimationFrame(tick);
            };
            tick();
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return { value, ref };
}

export default function Home() {
  const stats = [
    { label: "Cars listed", target: 105 },
    { label: "Towms covered", target: 70 },
    { label: "Min. avg approval", target: 15 },
    { label: "Trips completed", target: 950 },
  ];

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", "home-featured"],
    queryFn: () => carService.getCars({}),
  });

  const featuredCars = cars?.slice(0, 3) ?? [];
  const heroCar = cars?.find((c) => c.model.toLowerCase().includes("land cruiser")) ?? cars?.[0];

  return (
    <div className="bg-concrete text-ink font-body">
      {/* Hero */}
      <header className="relative bg-ink text-concrete overflow-hidden pt-16">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 items-center pb-14 md:pb-20 relative">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-lane mb-4">
              <span className="w-2 h-2 rounded-full bg-lane inline-block" />
              RENTALS, WITHOUT THE FRONT-DESK QUEUE
            </div>
            <h1 className="font-display uppercase font-bold text-4xl md:text-5xl leading-tight mb-4">
              Book the right car <span className="text-orange">in minutes,</span><br />no phone calls.
            </h1>
            <p className="text-[#C7CBD1] max-w-md mb-7 leading-relaxed">
              Browse live availability, compare vehicles, and reserve online — no paperwork, no double bookings.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#cars" className="px-5 py-3 rounded-md bg-orange text-white font-semibold text-sm hover:bg-orange-dim transition">
                Browse cars
              </a>
              <Link to="/register" className="px-5 py-3 rounded-md border-2 border-white/40 font-semibold text-sm hover:border-white transition">
                Create an account
              </Link>
            </div>
          </div>
          <div
  className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[240px] flex items-end p-5 bg-cover bg-center"
  style={{
    backgroundImage: heroCar?.image
      ? `linear-gradient(to top, rgba(20,23,28,0.85), rgba(20,23,28,0.1)), url(${heroCar.image})`
      : undefined,
    backgroundColor: !heroCar?.image ? "#1F232A" : undefined,
  }}
>
  <div className="bg-concrete text-ink rounded-lg px-4 py-3.5 shadow-2xl">
    <div className="font-display font-semibold text-sm">
      {heroCar ? `${heroCar.brand} ${heroCar.model}` : "Toyota Land Cruiser Prado"}
    </div>
    <div className="font-mono font-bold text-xl text-orange-dim">
      KSh {heroCar ? Number(heroCar.pricePerDay).toFixed(0) : "15,000"}{" "}
      <span className="text-xs text-gray-500 font-medium">/ day</span>
    </div>
  </div>
</div>
        </div>
      </header>

      <div className="border-t-4 border-dashed border-lane" />

      {/* Stats */}
      <div className="bg-asphalt text-concrete">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
          {stats.map((s) => {
            const { value, ref } = useCountUp(s.target);
            return (
              <div key={s.label} ref={ref}>
                <div className="font-mono font-bold text-3xl text-lane">{value}</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available cars — now using REAL data + real photos */}
      <section id="cars" className="py-14 md:py-20">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2.5 mb-7">
            <h2 className="font-display uppercase text-2xl font-semibold">Available now</h2>
            <Link to="/cars" className="text-orange-dim font-semibold text-sm">View all →</Link>
          </div>

          {isLoading && <p className="text-gray-500">Loading cars…</p>}

          {!isLoading && featuredCars.length === 0 && (
            <p className="text-gray-500">No cars available right now — check back soon.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <div className="border-t-4 border-dashed border-lane max-w-[1180px] mx-auto" />

      {/* How it works */}
      <section id="how" className="py-14 md:py-20">
        <div className="max-w-[1180px] mx-auto px-6">
          <h2 className="font-display uppercase text-2xl font-semibold mb-7">How it works</h2>
          <div>
            {[
              { n: "01", t: "Browse", d: "Filter by dates, transmission, and budget to see only cars that are actually free when you need them." },
              { n: "02", t: "Book", d: "Reserve online in minutes. No calls, no back-and-forth — you get a confirmation the moment an admin approves it." },
              { n: "03", t: "Drive", d: "Pick up your car at the agreed time and go. Return it, and you're free to book your next trip." },
            ].map((step, i, arr) => (
              <div
                key={step.n}
                className={`flex gap-4 py-5 border-t border-concrete-dim ${i === arr.length - 1 ? "border-b" : ""}`}
              >
                <div className="font-mono font-bold text-sm text-orange-dim min-w-[28px]">{step.n}</div>
                <div>
                  <h3 className="font-semibold text-base mb-1.5">{step.t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-md">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}