import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
} as const;

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// GET /api/users (admin only)
export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: users });
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.userId !== req.params.id && req.user?.role !== "ADMIN") {
    throw new ApiError(403, "You can only update your own profile");
  }

  const data = updateUserSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: req.params.id }, data, select: userSelect });
  res.json({ success: true, data: user });
});

// DELETE /api/users/:id (admin only)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "User deleted" });
});
