import { Link } from "react-router-dom";

const packages = [
  {
    title: "Self-drive",
    price: "Included in the daily rate",
    description: "Get the keys and go. Perfect if you know your way around and just need a reliable car.",
    features: ["No extra fees", "Full flexibility on your route", "Ideal for local trips and errands"],
  },
  {
    title: "Chauffeur-driven",
    price: "+ KSh 2,000 / day",
    description: "Sit back and let a professional driver handle the road — great for airport runs, events, or unfamiliar routes.",
    features: ["Experienced, vetted drivers", "No parking or navigation stress", "Great for business trips and events"],
  },
];

export default function Packages() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold text-navy-900">Our packages</h1>
      <p className="mt-2 text-navy-500">Choose how you want to travel — you pick the package right on the car's booking page.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.title} className="card p-6">
            <h2 className="font-display text-xl font-bold text-navy-900">{pkg.title}</h2>
            <p className="mt-1 text-sm font-semibold text-amber-600">{pkg.price}</p>
            <p className="mt-3 text-sm text-navy-600">{pkg.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-navy-600">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/cars" className="btn-primary inline-block">
          Browse cars to book
        </Link>
      </div>
    </div>
  );
}