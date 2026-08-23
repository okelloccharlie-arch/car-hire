import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews — customer leaves a review for one of their completed bookings
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = reviewSchema.parse(req.body);

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { review: true },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.userId !== req.user?.userId) throw new ApiError(403, "You can only review your own bookings");
  if (booking.status !== "COMPLETED") throw new ApiError(400, "You can only review completed rentals");
  if (booking.review) throw new ApiError(409, "This booking has already been reviewed");

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      carId: booking.carId,
      userId: booking.userId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  res.status(201).json({ success: true, data: review });
});

// GET /api/reviews/car/:carId — public reviews + average rating for a car
export const getCarReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { carId: req.params.carId },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  res.json({ success: true, data: { reviews, average, count: reviews.length } });
});

// GET /api/reviews — admin: all reviews, for moderation
export const getAllReviews = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const reviews = await prisma.review.findMany({
    include: {
      car: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: reviews });
});

// DELETE /api/reviews/:id — admin: moderate/remove a review
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Review deleted" });
});