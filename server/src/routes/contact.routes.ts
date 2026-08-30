import { Router } from "express";
import { sendContactMessage, getMessages, markMessageRead, deleteMessage } from "../controllers/contact.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", sendContactMessage); // public — no login required to contact support
router.get("/", authenticate, authorize("ADMIN"), getMessages);
router.patch("/:id/read", authenticate, authorize("ADMIN"), markMessageRead);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteMessage);

export default router;