import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // JWTs are stateless; the client discards the token. This endpoint exists
  // for symmetry and as a hook for future token-blacklisting if needed.
  res.json({ success: true, message: "Logged out successfully" });
});
