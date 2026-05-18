import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { RequestHandler } from "express";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { leadRouter } from "./routes/lead.routes.js";

export const app = express();
const createHelmet = helmet as unknown as () => RequestHandler;

app.use(createHelmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/leads", leadRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
