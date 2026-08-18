const services = [
  { title: "Self-drive car rental", description: "Rent a car and drive it yourself, on your own schedule." },
  { title: "Chauffeur-driven rentals", description: "Add a professional driver to any booking for a small daily fee." },
  { title: "Airport transfers", description: "Reliable pickup and drop-off, timed to your flight." },
  { title: "Long-term & corporate leasing", description: "Multi-week and multi-month rates for businesses and extended stays." },
];

export default function Services() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold text-navy-900">Services</h1>
      <p className="mt-2 text-navy-500">Everything we offer, in one place.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.title} className="card p-5">
            <h3 className="font-semibold text-navy-900">{s.title}</h3>
            <p className="mt-1.5 text-sm text-navy-600">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}