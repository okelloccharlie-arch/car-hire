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

// GET /api/reports/breakdown — revenue by month, popular cars, status & drive-type splits
export const getBreakdown = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Revenue + bookings for the last 12 months, bucketed by month
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [recentBookings, recentPayments] = await Promise.all([
    prisma.booking.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.payment.findMany({
      where: { createdAt: { gte: since }, paymentStatus: "PAID" },
      select: { createdAt: true, amount: true },
    }),
  ]);

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const months: { month: string; label: string; bookings: number; revenue: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    months.push({
      month: monthKey(d),
      label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      bookings: 0,
      revenue: 0,
    });
  }
  const byMonth = Object.fromEntries(months.map((m) => [m.month, m]));
  recentBookings.forEach((b) => {
    const key = monthKey(new Date(b.createdAt));
    if (byMonth[key]) byMonth[key].bookings += 1;
  });
  recentPayments.forEach((p) => {
    const key = monthKey(new Date(p.createdAt));
    if (byMonth[key]) byMonth[key].revenue += Number(p.amount);
  });

  // Most popular cars — ranked by number of bookings, with total revenue booked
  const carGroups = await prisma.booking.groupBy({
    by: ["carId"],
    _count: { carId: true },
    _sum: { totalPrice: true },
    orderBy: { _count: { carId: "desc" } },
    take: 10,
  });
  const carIds = carGroups.map((g) => g.carId);
  const carRecords = await prisma.car.findMany({ where: { id: { in: carIds } } });
  const popularCars = carGroups.map((g) => {
    const car = carRecords.find((c) => c.id === g.carId);
    return {
      carId: g.carId,
      brand: car?.brand ?? "Unknown",
      model: car?.model ?? "",
      bookings: g._count.carId,
      revenue: Number(g._sum.totalPrice ?? 0),
    };
  });

  // New customer signups per month, last 12 months
  const newCustomers = await prisma.user.findMany({
    where: { role: "CUSTOMER", createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const customerGrowth = months.map((m) => ({ month: m.month, label: m.label, newCustomers: 0 }));
  const byMonthCustomers = Object.fromEntries(customerGrowth.map((m) => [m.month, m]));
  newCustomers.forEach((c) => {
    const key = monthKey(new Date(c.createdAt));
    if (byMonthCustomers[key]) byMonthCustomers[key].newCustomers += 1;
  });

  // Booking status split
  const statusGroups = await prisma.booking.groupBy({ by: ["status"], _count: { status: true } });
  const statusBreakdown = statusGroups.map((s) => ({ status: s.status, count: s._count.status }));

  // Self-drive vs chauffeur split
  const driveGroups = await prisma.booking.groupBy({
    by: ["driveType"],
    _count: { driveType: true },
    _sum: { totalPrice: true },
  });
  const driveTypeBreakdown = driveGroups.map((d) => ({
    driveType: d.driveType,
    count: d._count.driveType,
    revenue: Number(d._sum.totalPrice ?? 0),
  }));

  res.json({
    success: true,
    data: { monthlyRevenue: months, popularCars, statusBreakdown, driveTypeBreakdown, customerGrowth },
  });
});