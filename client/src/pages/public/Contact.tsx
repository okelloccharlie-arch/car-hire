export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-900">Contact us</h1>
      <p className="mt-4 text-navy-600">
        Have a question about a booking or the fleet? Reach out and we'll get back to you.
      </p>
      <form className="mt-6 max-w-md space-y-3" onSubmit={(e) => e.preventDefault()}>
        <input className="input" placeholder="Your name" />
        <input className="input" type="email" placeholder="Email address" />
        <textarea className="input" rows={4} placeholder="Message" />
        <button type="submit" className="btn-primary">Send message</button>
      </form>
    </div>
  );
}
