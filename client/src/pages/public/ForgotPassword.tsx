import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-900">Forgot your password?</h1>
      <p className="mt-1 text-sm text-navy-500">Enter your email and we'll send you a link to reset it.</p>

      {status === "sent" ? (
        <p className="mt-6 text-sm text-navy-600">
          If that email is registered, a reset link is on its way. Check your inbox (and spam folder).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Email
            <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {status === "error" && <p className="text-sm text-rose-600">Something went wrong. Please try again.</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-navy-500">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700">
          Log in
        </Link>
      </p>
    </div>
  );
}