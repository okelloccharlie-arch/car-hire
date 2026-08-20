import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";
import { sendBookingApprovedEmail, sendBookingCancelledEmail } from "../utils/email";

const CHAUFFEUR_FEE_PER_DAY = 2000; // KSh

const bookingSchema = z.object({
  carId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  driveType: z.enum(["SELF_DRIVE", "CHAUFFEUR"]).optional().default("SELF_DRIVE"),
  paymentMethod: z.enum(["MPESA", "DEBIT_CARD", "CREDIT_CARD", "PESALINK"]),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "CANCELLED", "COMPLETED"]),
});

// GET /api/bookings — admins see all, customers see their own
export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const where = req.user?.role === "ADMIN" ? {} : { userId: req.user?.userId };

  const bookings = await prisma.booking.findMany({
    where,
    include: { car: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: bookings });
});

// POST /api/bookings
export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = bookingSchema.parse(req.body);

  if (data.startDate < new Date()) {
    throw new ApiError(400, "Pickup date and time cannot be in the past");
  }

  if (data.endDate <= data.startDate) {
    throw new ApiError(400, "End date must be after start date");
  }

  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car) throw new ApiError(404, "Car not found");
  if (car.status !== "AVAILABLE") throw new ApiError(400, "Car is not available for booking");

  const overlapping = await prisma.booking.findFirst({
    where: {
      carId: data.carId,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lt: data.endDate },
      endDate: { gt: data.startDate },
    },
  });
  if (overlapping) throw new ApiError(409, "Car is already booked for the selected dates");

  const days = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const baseTotal = Number(car.pricePerDay) * days;
  const chauffeurFee = data.driveType === "CHAUFFEUR" ? CHAUFFEUR_FEE_PER_DAY * days : 0;
  const totalPrice = baseTotal + chauffeurFee;

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.userId,
      carId: data.carId,
      startDate: data.startDate,
      endDate: data.endDate,
      driveType: data.driveType,
      totalPrice,
      payment: {
        create: {
          amount: totalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
        },
      },
    },
    include: { car: true, payment: true },
  });

  res.status(201).json({ success: true, data: booking });
});

// PUT /api/bookings/:id — update status (admin) or cancel (owner)
export const updateBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = statusSchema.parse(req.body);

  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { car: true, user: true },
  });
  if (!booking) throw new ApiError(404, "Booking not found");

  const isOwner = booking.userId === req.user?.userId;
  const isAdmin = req.user?.role === "ADMIN";

  if (!isAdmin && !(isOwner && status === "CANCELLED")) {
    throw new ApiError(403, "You can only cancel your own bookings");
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
    include: { car: true },
  });

  if (status === "APPROVED") {
    await prisma.car.update({ where: { id: booking.carId }, data: { status: "RENTED" } });
  }
  if (status === "CANCELLED" || status === "COMPLETED") {
    await prisma.car.update({ where: { id: booking.carId }, data: { status: "AVAILABLE" } });
  }

  try {
    if (status === "APPROVED") {
      await sendBookingApprovedEmail({
        to: booking.user.email,
        firstName: booking.user.firstName,
        carBrand: booking.car.brand,
        carModel: booking.car.model,
        startDate: booking.startDate,
        endDate: booking.endDate,
      });
    }
    if (status === "CANCELLED") {
      await sendBookingCancelledEmail({
        to: booking.user.email,
        firstName: booking.user.firstName,
        carBrand: booking.car.brand,
        carModel: booking.car.model,
      });
    }
  } catch (emailError) {
    console.error("Failed to send booking status email:", emailError);
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/bookings/:id (admin only)
export const deleteBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.booking.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Booking deleted" });
});