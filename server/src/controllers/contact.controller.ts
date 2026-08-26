import { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { sendContactMessageEmail } from "../utils/email";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

// POST /api/contact — public, sends the message straight to the admin's inbox
export const sendContactMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = contactSchema.parse(req.body);

  await sendContactMessageEmail(data);

  res.status(201).json({ success: true, message: "Message sent" });
});