import { Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";

// GET /api/reports/summary — admin dashboard KPIs
export const getSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [totalCars, availableCars, totalCustomers, totalBookings, activeBookings, revenue] =
    await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { status: "AVAILABLE" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "APPROVED" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PAID" } }),
    ]);

  res.json({
    success: true,
    data: {
      totalCars,
      availableCars,
      totalCustomers,
      totalBookings,
      activeBookings,
      totalRevenue: revenue._sum.amount ?? 0,
    },
  });
});
