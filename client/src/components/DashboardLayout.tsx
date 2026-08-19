import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePendingBookingsCount } from "../hooks/usePendingBookingsCount";

interface NavItem {
  to: string;
  label: string;
}

export default function DashboardLayout({ items, heading }: { items: NavItem[]; heading: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pendingCount = usePendingBookingsCount();

  return (
    <div className="flex min-h-screen bg-navy-50/40">
      <aside className="hidden w-60 shrink-0 border-r border-navy-100 bg-white md:block">
        <div className="px-5 py-5">
          <img src="/logo.png" alt="SmartRental" className="h-8" />
          <p className="mt-1 text-xs text-navy-400">{heading}</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-amber-50 text-amber-700" : "text-navy-600 hover:bg-navy-50"
                }`
              }
            >
              <span>{item.label}</span>
              {item.to === "/admin/bookings" && pendingCount > 0 && (
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-6 w-60 px-5">
          <p className="text-xs text-navy-400">{user?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="mt-2 text-sm font-medium text-navy-600 hover:text-navy-900"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}