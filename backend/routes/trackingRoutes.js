import express from "express";
import { trackOrder } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/:orderNumber", trackOrder);

export default router;
