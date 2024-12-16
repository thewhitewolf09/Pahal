import express from "express";
import {
  addFee,
  getAllFees,
  updateFeeStatus,
  deleteFee,
  getPendingFees,
  getFeesByParent,
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
router.get("/:parentId",protect, getFeesByParent);

// Update Fee Status (Paid)
router.patch("/:id",protect, updateFeeStatus);
 
// Delete Fee Record
router.delete("/:id",protect, deleteFee);



export default router;
