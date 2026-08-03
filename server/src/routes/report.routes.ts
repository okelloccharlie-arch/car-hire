import { Router } from "express";
import { getSummary } from "../controllers/report.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/summary", authenticate, authorize("ADMIN"), getSummary);

export default router;
