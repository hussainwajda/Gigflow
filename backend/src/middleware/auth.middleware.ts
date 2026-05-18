import type { NextFunction, Response } from "express";

import { supabaseAdmin, supabaseAnon } from "../config/supabase.js";
import { AppError } from "../utils/app-error.js";
import { queryable } from "../utils/supabase-query.js";
import type { AuthenticatedRequest, AuthUser } from "../types/shared.types.js";

export async function auth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) throw new AppError("Missing bearer token.", 401);

    const { data: authData, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !authData.user) throw new AppError("Invalid or expired token.", 401);

    const { data: profile, error: profileError } = await queryable(supabaseAdmin)
      .from<AuthUser>("profiles")
      .select("id,name,email,role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) throw new AppError("Profile not found.", 401);

    req.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
