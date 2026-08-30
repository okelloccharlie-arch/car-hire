import { ReactNode, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Settings, HelpCircle, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  badgeKey?: "pendingBookings" | "unreadMessages";
}

export default function DashboardLayout({ items, heading }: { items: NavItem[]; heading: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    items: notifications,
    count: notificationCount,
    isAdmin,
    pendingBookingsCount,
    unreadMessagesCount,
  } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const settingsPath = isAdmin ? "/admin/profile" : "/dashboard/profile";

  function badgeCountFor(key?: "pendingBookings" | "unreadMessages") {
    if (key === "pendingBookings") return pendingBookingsCount;
    if (key === "unreadMessages") return unreadMessagesCount;
    return 0;
  }

  // Close the notifications dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebar = (
    <>
      <div className="px-5 pb-4 pt-5">
        <img src="/logo.png" alt="SmartRental" className="h-8" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-navy-400">{heading}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const badgeCount = badgeCountFor(item.badgeKey);
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
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate(settingsPath);
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate("/faq");
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            Help and support
          </button>

          {/* Notifications dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-900"
            >
              <span className="relative">
                <Bell className="h-[18px] w-[18px]" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </span>
              Notifications
            </button>

            {notifOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-80 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-lg">
                <div className="border-b border-navy-100 px-4 py-3">
                  <p className="text-sm font-semibold text-navy-900">Notifications</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-navy-400">You're all caught up.</p>
                  )}
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNotifOpen(false);
                        setMobileOpen(false);
                        navigate(n.to);
                      }}
                      className="block w-full border-b border-navy-50 px-4 py-3 text-left last:border-0 hover:bg-navy-50/60"
                    >
                      <p className="text-sm font-medium text-navy-900">{n.title}</p>
                      <p className="text-xs text-navy-400">{n.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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