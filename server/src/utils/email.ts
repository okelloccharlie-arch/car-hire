import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingApprovedEmail(params: {
  to: string;
  firstName: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
}) {
  const { to, firstName, carBrand, carModel, startDate, endDate } = params;

  await resend.emails.send({
    from: "Car Hire <onboarding@resend.dev>",
    to,
    subject: "Your booking has been approved ✅",
    html: `
      <p>Hi ${firstName},</p>
      <p>Good news — your booking for the <strong>${carBrand} ${carModel}</strong> has been approved.</p>
      <p><strong>Pickup date:</strong> ${startDate.toLocaleDateString()}</p>
      <p><strong>Return date:</strong> ${endDate.toLocaleDateString()}</p>
      <p>See you soon!</p>
    `,
  });
}

export async function sendBookingCancelledEmail(params: {
  to: string;
  firstName: string;
  carBrand: string;
  carModel: string;
}) {
  const { to, firstName, carBrand, carModel } = params;

  await resend.emails.send({
    from: "Car Hire <onboarding@resend.dev>",
    to,
    subject: "Your booking has been cancelled",
    html: `
      <p>Hi ${firstName},</p>
      <p>We're sorry to let you know your booking for the <strong>${carBrand} ${carModel}</strong> has been cancelled.</p>
      <p>If you have questions, please contact support.</p>
    `,
  });
}
export async function sendPasswordResetEmail(params: { to: string; firstName: string; resetUrl: string }) {
  const { to, firstName, resetUrl } = params;
  await resend.emails.send({
    from: "Car Hire <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <p>Hi ${firstName},</p>
      <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendContactMessageEmail(params: { name: string; email: string; message: string }) {
  const { name, email, message } = params;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@carrental.com";

  await resend.emails.send({
    from: "Car Hire <onboarding@resend.dev>",
    to: adminEmail,
    replyTo: email,
    subject: `New contact message from ${name}`,
    html: `
      <p>You've received a new message from the Contact Us page.</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
}
