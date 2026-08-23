import { Router } from "express";
import { getPayments, createPayment, updatePaymentStatus } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getPayments);
router.post("/", createPayment);
router.patch("/:id", authorize("ADMIN"), updatePaymentStatus);

export default router;