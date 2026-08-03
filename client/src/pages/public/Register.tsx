import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-900">Create your account</h1>
      <p className="mt-1 text-sm text-navy-500">Book cars online in a couple of clicks.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            First name
            <input className="input mt-1" value={form.firstName} onChange={update("firstName")} required />
          </label>
          <label className="block text-sm">
            Last name
            <input className="input mt-1" value={form.lastName} onChange={update("lastName")} required />
          </label>
        </div>
        <label className="block text-sm">
          Email
          <input type="email" className="input mt-1" value={form.email} onChange={update("email")} required />
        </label>
        <label className="block text-sm">
          Phone (optional)
          <input className="input mt-1" value={form.phone} onChange={update("phone")} />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" className="input mt-1" value={form.password} onChange={update("password")} minLength={8} required />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-navy-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
