import { Router } from "express";
import { getCars, getCarById, createCar, updateCar, deleteCar } from "../controllers/car.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.get("/", getCars);
router.get("/:id", getCarById);

router.post("/", authenticate, authorize("ADMIN"), upload.single("image"), createCar);
router.put("/:id", authenticate, authorize("ADMIN"), upload.single("image"), updateCar);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCar);

export default router;
