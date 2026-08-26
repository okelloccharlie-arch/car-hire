import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as contactService from "../../services/contactService";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: contactService.sendContactMessage,
    onSuccess: () => {
      setName("");
      setEmail("");
      setMessage("");
    },
    onError: () => setError("Something went wrong sending your message. Please try again."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ name, email, message });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-900">Contact us</h1>
      <p className="mt-4 text-navy-600">
        Have a question about a booking or the fleet? Reach out and we'll get back to you.
      </p>

      {mutation.isSuccess ? (
        <div className="mt-6 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          Thanks — your message has been sent. We'll get back to you soon.
        </div>
      ) : (
        <form className="mt-6 max-w-md space-y-3" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            className="input"
            rows={4}
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}