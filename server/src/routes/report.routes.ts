import { Router } from "express";
import { getSummary, getBreakdown } from "../controllers/report.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/summary", authenticate, authorize("ADMIN"), getSummary);
router.get("/breakdown", authenticate, authorize("ADMIN"), getBreakdown);

export default router;