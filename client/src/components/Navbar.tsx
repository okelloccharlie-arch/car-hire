import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/packages", label: "Packages" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/">
          <img src="/logo.png" alt="SmartRental" className="h-10" />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-navy-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-sm font-medium text-navy-700 hover:text-navy-900"
              >
                {user?.firstName}
              </Link>
              <button onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          className="flex flex-col gap-1.5 p-2 lg:hidden"
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-6 bg-navy-900" />
          <span className="block h-0.5 w-6 bg-navy-900" />
          <span className="block h-0.5 w-6 bg-navy-900" />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-navy-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="border-b border-navy-50 py-2.5 text-sm font-medium text-navy-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary flex-1 text-center"
                >
                  {user?.firstName}
                </Link>
                <button onClick={handleLogout} className="btn-secondary flex-1">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}