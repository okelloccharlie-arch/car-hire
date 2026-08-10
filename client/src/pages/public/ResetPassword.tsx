import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import * as authService from "../../services/authService";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
        <h1 className="text-2xl font-bold text-navy-900">Invalid link</h1>
        <p className="mt-2 text-sm text-navy-500">This password reset link is missing its token. Please request a new one.</p>
        <Link to="/forgot-password" className="mt-4 font-medium text-amber-600 hover:text-amber-700">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-900">Set a new password</h1>
      <p className="mt-1 text-sm text-navy-500">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          New password
          <PasswordInput className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </label>
        <label className="block text-sm">
          Confirm password
          <PasswordInput className="input mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}