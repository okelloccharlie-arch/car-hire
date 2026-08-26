import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller";

const router = Router();

router.post("/", sendContactMessage); // public — no login required to contact support

export default router;