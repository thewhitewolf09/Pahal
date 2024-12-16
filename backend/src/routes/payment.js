import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  deletePayment,
  getPaymentHistoryByParent,
  processPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Process a new payment
router.post("/", protect, processPayment);

// Get payment history by parent ID
router.get("/history/:parentId", protect, getPaymentHistoryByParent);

// Delete a payment record
router.delete("/:id", protect, deletePayment);

export default router;
