import type { AuthUser } from "./shared.types.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export {};
