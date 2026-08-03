import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-extrabold text-navy-200">404</p>
      <h1 className="mt-2 text-xl font-semibold text-navy-900">Page not found</h1>
      <p className="mt-2 text-navy-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back home</Link>
    </div>
  );
}
