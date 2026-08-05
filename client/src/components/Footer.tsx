export default function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-100 bg-navy-900 text-navy-100">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <img src="/logo.png" alt="SmartRental" className="h-10" />
            <p className="mt-2 max-w-xs text-navy-200">
              Book reliable vehicles in minutes. Transparent pricing, no paperwork.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-semibold text-white">Company</p>
              <ul className="mt-2 space-y-1 text-navy-200">
                <li>About</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Support</p>
              <ul className="mt-2 space-y-1 text-navy-200">
                <li>Booking help</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-navy-300">
          © {new Date().getFullYear()} SmartRental. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
