import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";
import cloudinary from "../config/cloudinary";

const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1980),
  pricePerDay: z.coerce.number().positive(),
  transmission: z.string().min(1),
  fuelType: z.string().min(1),
  seats: z.coerce.number().int().min(1),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
});

// GET /api/cars?search=&brand=&transmission=&fuelType=&minPrice=&maxPrice=&status=
export const getCars = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, brand, transmission, fuelType, minPrice, maxPrice, status } = req.query;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { brand: { contains: String(search), mode: "insensitive" } },
      { model: { contains: String(search), mode: "insensitive" } },
    ];
  }
  if (brand) where.brand = { equals: String(brand), mode: "insensitive" };
  if (transmission) where.transmission = { equals: String(transmission), mode: "insensitive" };
  if (fuelType) where.fuelType = { equals: String(fuelType), mode: "insensitive" };
  if (status) where.status = String(status);
  if (minPrice || maxPrice) {
    where.pricePerDay = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }

  const cars = await prisma.car.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: cars });
});

// GET /api/cars/:id
export const getCarById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const car = await prisma.car.findUnique({ where: { id: req.params.id } });
  if (!car) throw new ApiError(404, "Car not found");
  res.json({ success: true, data: car });
});

// POST /api/cars (admin only)
export const createCar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = carSchema.parse(req.body);
  let imageUrl: string | undefined;

  if (req.file) {
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "car-rental" }, (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      });
      stream.end(req.file!.buffer);
    });
    imageUrl = uploadResult.secure_url;
  }

  const car = await prisma.car.create({
    data: {
      ...data,
      image: imageUrl,
      rentedAt: data.status === "RENTED" ? new Date() : null,
    },
  });
  res.status(201).json({ success: true, data: car });
});

// PUT /api/cars/:id (admin only)
export const updateCar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = carSchema.partial().parse(req.body);

  let imageUrl: string | undefined;
  if (req.file) {
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "car-rental" }, (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      });
      stream.end(req.file!.buffer);
    });
    imageUrl = uploadResult.secure_url;
  }

  const car = await prisma.car.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(data.status ? { rentedAt: data.status === "RENTED" ? new Date() : null } : {}),
    },
  });
  res.json({ success: true, data: car });
});

// DELETE /api/cars/:id (admin only)
export const deleteCar = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.car.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Car deleted" });
});