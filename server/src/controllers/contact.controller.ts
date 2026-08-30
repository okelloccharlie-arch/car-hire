import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { sendContactMessageEmail } from "../utils/email";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

// POST /api/contact — public, saves the message and emails the admin
export const sendContactMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = contactSchema.parse(req.body);

  const saved = await prisma.contactMessage.create({ data });

  // Email is best-effort — the message is already saved, so a mail hiccup
  // shouldn't cause the visitor's submission to fail.
  try {
    await sendContactMessageEmail(data);
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }

  res.status(201).json({ success: true, data: saved });
});

// GET /api/contact — admin: all messages, newest first
export const getMessages = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: messages });
});

// PATCH /api/contact/:id/read — admin: mark a message as read
export const markMessageRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ success: true, data: message });
});

// DELETE /api/contact/:id — admin: remove a message
export const deleteMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Message deleted" });
});