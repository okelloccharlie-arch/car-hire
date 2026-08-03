import { Router } from "express";
import { getPayments, createPayment } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getPayments);
router.post("/", createPayment);

export default router;
