import { ReactNode, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Settings, HelpCircle, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePendingBookingsCount } from "../hooks/usePendingBookingsCount";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  badgeKey?: "pendingBookings";
}

export default function DashboardLayout({ items, heading }: { items: NavItem[]; heading: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pendingCount = usePendingBookingsCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const sidebar = (
    <>
      <div className="px-5 pb-4 pt-5">
        <img src="/logo.png" alt="SmartRental" className="h-8" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-navy-400">{heading}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const badgeCount = item.badgeKey === "pendingBookings" ? pendingCount : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-amber-50 text-amber-700" : "text-navy-500 hover:bg-navy-50 hover:text-navy-900"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
                {item.label}
              </span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-3">
        <div className="flex flex-col gap-1 border-t border-navy-100 pt-3">
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900">
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900">
            <HelpCircle className="h-[18px] w-[18px]" />
            Help and support
          </button>
          <NavLink
            to={items.find((i) => i.badgeKey === "pendingBookings")?.to ?? items[0].to}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900"
          >
            <span className="relative">
              <Bell className="h-[18px] w-[18px]" />
              {pendingCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </span>
            Notifications
          </NavLink>
        </div>

        <div className="mt-2 flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
            {initials || "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-navy-400">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            aria-label="Log out"
            className="shrink-0 text-navy-400 hover:text-rose-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-navy-50/40">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy-100 bg-white md:flex">{sidebar}</aside>

      {/* Mobile top bar + drawer */}
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 md:hidden">
          <img src="/logo.png" alt="SmartRental" className="h-7" />
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-navy-700">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="flex w-72 flex-col bg-white">
              <div className="flex justify-end px-3 pt-3">
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-navy-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {sidebar}
            </div>
            <div className="flex-1 bg-navy-900/30" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}