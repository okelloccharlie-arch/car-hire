import { useState } from "react";

const faqs = [
  { q: "How do I book a car?", a: "Browse available cars, pick your dates and package (self-drive or chauffeur-driven), and submit a booking request. An admin will approve it and you'll get an email confirmation." },
  { q: "What do I need to rent a car?", a: "A valid driver's license and a registered account with us. Chauffeur-driven bookings don't require your own license." },
  { q: "How much does a chauffeur cost?", a: "An extra KSh 2,000 per day on top of the car's daily rate." },
  { q: "Can I cancel a booking?", a: "Yes, you can cancel a pending or approved booking from your dashboard before pickup." },
  { q: "How will I know my booking is confirmed?", a: "You'll receive an email as soon as an admin approves your booking." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold text-navy-900">Frequently asked questions</h1>

      <div className="mt-8 divide-y divide-navy-100 border-t border-b border-navy-100">
        {faqs.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-navy-900">{item.q}</span>
              <span className="ml-4 text-navy-400">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && <p className="pb-4 text-sm text-navy-600">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}