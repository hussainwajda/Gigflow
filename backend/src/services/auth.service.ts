import { supabaseAdmin, supabaseAnon } from "../config/supabase.js";
import type { AuthUser, UserRole } from "../types/shared.types.js";
import { AppError } from "../utils/app-error.js";
import { queryable } from "../utils/supabase-query.js";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  token: string;
  user: AuthUser;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function profileToUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name,
      role: input.role,
    },
  });

  if (error) throw new AppError(error.message, 400);
  if (!data.user) throw new AppError("Unable to create user.", 500);

  const email = data.user.email ?? input.email;

  const { data: profile, error: profileError } = await queryable(supabaseAdmin)
    .from<ProfileRow>("profiles")
    .upsert(
      {
        id: data.user.id,
        name: input.name,
        email,
        role: input.role,
      },
      { onConflict: "id" },
    )
    .select("id,name,email,role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    throw new AppError(profileError?.message ?? "User created, but profile was not initialized.", 500);
  }

  return profileToUser(profile);
}

export async function loginUser(input: LoginInput): Promise<AuthSessionResponse> {
  const { data, error } = await supabaseAnon.auth.signInWithPassword(input);
  if (error) throw new AppError("Invalid email or password.", 401);
  if (!data.session || !data.user) throw new AppError("Unable to create session.", 401);

  const { data: profile, error: profileError } = await queryable(supabaseAdmin)
    .from<ProfileRow>("profiles")
    .select("id,name,email,role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) throw new AppError("Profile not found.", 401);

  return {
    token: data.session.access_token,
    user: profileToUser(profile),
  };
}
