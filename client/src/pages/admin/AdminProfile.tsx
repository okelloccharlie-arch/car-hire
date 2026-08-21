import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AdminProfile() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await api.put(`/users/${user?.id}`, { firstName, lastName, phone });
      setMessage("Profile updated.");
    } catch {
      setMessage("Could not update profile.");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
      <p className="mt-1 text-navy-500">Manage your admin account details.</p>

      <form onSubmit={handleSave} className="card mt-6 space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            First name
            <input className="input mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="text-sm">
            Last name
            <input className="input mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
        </div>
        <label className="block text-sm">
          Email
          <input className="input mt-1 bg-navy-50" value={user?.email} disabled />
        </label>
        <label className="block text-sm">
          Phone
          <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {message && <p className="text-sm text-navy-600">{message}</p>}
        <button type="submit" className="btn-primary">
          Save changes
        </button>
      </form>
    </div>
  );
}