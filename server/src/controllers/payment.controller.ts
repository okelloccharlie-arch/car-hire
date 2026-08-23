import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.string().min(1),
});

const paymentStatusSchema = z.object({
  paymentStatus: z.enum(["PAID", "PENDING", "FAILED"]),
});

// GET /api/payments — admins see all, customers see their own
export const getPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const where =
    req.user?.role === "ADMIN" ? {} : { booking: { userId: req.user?.userId } };

  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          car: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: payments });
});

// POST /api/payments — record a payment for a booking
export const createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = paymentSchema.parse(req.body);

  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
    throw new ApiError(403, "You can only pay for your own bookings");
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      amount: booking.totalPrice,
      paymentMethod: data.paymentMethod,
      paymentStatus: "PAID",
    },
  });

  res.status(201).json({ success: true, data: payment });
});

// PATCH /api/payments/:id — admin marks a payment PAID / FAILED / PENDING
export const updatePaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { paymentStatus } = paymentStatusSchema.parse(req.body);

  const existing = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Payment not found");

  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: { paymentStatus },
    include: {
      booking: {
        include: {
          car: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  res.json({ success: true, data: payment });
});