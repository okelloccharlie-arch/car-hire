import { Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";

// GET /api/reports/summary — admin dashboard KPIs + chart data
export const getSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [
    totalCars,
    availableCars,
    rentedCars,
    maintenanceCars,
    totalCustomers,
    totalBookings,
    activeBookings,
    overdueBookings,
    revenue,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: "AVAILABLE" } }),
    prisma.car.count({ where: { status: "RENTED" } }),
    prisma.car.count({ where: { status: "MAINTENANCE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "APPROVED" } }),
    prisma.booking.count({ where: { status: "APPROVED", endDate: { lt: new Date() } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PAID" } }),
  ]);

  // Last 7 days of bookings + revenue, bucketed by day
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [recentBookings, recentPayments] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: since }, paymentStatus: "PAID" },
      select: { createdAt: true, amount: true },
    }),
  ]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days: { date: string; bookings: number; revenue: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push({ date: dayKey(d), bookings: 0, revenue: 0 });
  }
  const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
  recentBookings.forEach((b) => {
    const key = dayKey(new Date(b.createdAt));
    if (byDate[key]) byDate[key].bookings += 1;
  });
  recentPayments.forEach((p) => {
    const key = dayKey(new Date(p.createdAt));
    if (byDate[key]) byDate[key].revenue += Number(p.amount);
  });

  // Top 5 most-booked cars
  const grouped = await prisma.booking.groupBy({
    by: ["carId"],
    _count: { carId: true },
    orderBy: { _count: { carId: "desc" } },
    take: 5,
  });
  const topCarIds = grouped.map((g) => g.carId);
  const topCarRecords = await prisma.car.findMany({ where: { id: { in: topCarIds } } });
  const topCars = grouped.map((g) => {
    const car = topCarRecords.find((c) => c.id === g.carId);
    return {
      carId: g.carId,
      brand: car?.brand ?? "Unknown",
      model: car?.model ?? "",
      image: car?.image ?? null,
      bookings: g._count.carId,
    };
  });

  res.json({
    success: true,
    data: {
      totalCars,
      availableCars,
      rentedCars,
      maintenanceCars,
      totalCustomers,
      totalBookings,
      activeBookings,
      overdueBookings,
      totalRevenue: revenue._sum.amount ?? 0,
      dailyStats: days,
      topCars,
    },
  });
});