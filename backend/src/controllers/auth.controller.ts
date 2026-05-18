import type { Request, Response } from "express";

import { loginUser, registerUser } from "../services/auth.service.js";
import type { ApiSuccess, AuthenticatedRequest, AuthUser } from "../types/shared.types.js";
import { AppError } from "../utils/app-error.js";

export async function register(req: Request, res: Response<ApiSuccess<AuthUser>>): Promise<void> {
  const user = await registerUser(req.body);
  res.status(201).json({ success: true, data: user, message: "User registered." });
}

export async function login(req: Request, res: Response<ApiSuccess<{ token: string; user: AuthUser }>>): Promise<void> {
  const data = await loginUser(req.body);
  res.status(200).json({ success: true, data, message: "Logged in." });
}

export async function me(req: AuthenticatedRequest, res: Response<ApiSuccess<AuthUser>>): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  res.status(200).json({ success: true, data: req.user });
}
