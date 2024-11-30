import express from "express";
import {
  addFee,
  getAllFees,
  getFeesByStudent,
  updateFeeStatus,
  deleteFee,
  getPendingFees,
} from "../controllers/feesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add Fee
router.post("/", protect, addFee);

// Get Pending Fees (for reminders)
router.get("/pending",protect, getPendingFees);

// Get All Fees
router.get("/",protect, getAllFees);

// Get Fees by Student ID
router.get("/:studentId",protect, getFeesByStudent);

// Update Fee Status (Paid)
router.patch("/:id",protect, updateFeeStatus);
 
// Delete Fee Record
router.delete("/:id",protect, deleteFee);



export default router;
