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