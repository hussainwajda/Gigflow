import { Router } from "express";

import { deleteLead, exportLeads, getLead, getLeads, patchLead, postLead } from "../controllers/lead.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createLeadSchema, getLeadsQuerySchema, leadIdSchema, updateLeadSchema } from "../schemas/lead.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

export const leadRouter = Router();

leadRouter.use(auth);
leadRouter.get("/", validate(getLeadsQuerySchema), asyncHandler(getLeads));
leadRouter.get("/export/csv", validate(getLeadsQuerySchema), requireRole("admin"), asyncHandler(exportLeads));
leadRouter.get("/:id", validate(leadIdSchema), asyncHandler(getLead));
leadRouter.post("/", validate(createLeadSchema), asyncHandler(postLead));
leadRouter.patch("/:id", validate(updateLeadSchema), asyncHandler(patchLead));
leadRouter.delete("/:id", validate(leadIdSchema), requireRole("admin"), asyncHandler(deleteLead));
