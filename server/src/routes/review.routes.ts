import { Router } from "express";
import { createReview, getCarReviews, getAllReviews, deleteReview } from "../controllers/review.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/car/:carId", getCarReviews); // public
router.get("/", authenticate, authorize("ADMIN"), getAllReviews);
router.post("/", authenticate, createReview);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteReview);

export default router;