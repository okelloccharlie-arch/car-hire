import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-lg font-bold text-navy-800">
          Smart<span className="text-amber-500">Rental</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-navy-600 md:flex">
          <Link to="/cars" className="hover:text-navy-900">Cars</Link>
          <Link to="/about" className="hover:text-navy-900">About</Link>
          <Link to="/contact" className="hover:text-navy-900">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
