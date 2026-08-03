import { Router } from "express";
import { getBookings, createBooking, updateBooking, deleteBooking } from "../controllers/booking.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", authorize("ADMIN"), deleteBooking);

export default router;
