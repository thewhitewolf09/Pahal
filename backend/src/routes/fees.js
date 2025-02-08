import express from "express";
import {
  addFee,
  getAllFees,
  updateFeeStatus,
  deleteFee,
  getPendingFees,
  getFeesByParent,
  getMonthlyFeesSummary,
  editFee,
} from "../controllers/feesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add Fee
router.post("/", protect, addFee);

// Get Pending Fees (for reminders)
router.get("/pending",protect, getPendingFees);

// Get Monthly Fees Summary
router.get("/summery/monthly",getMonthlyFeesSummary);

// Get All Fees
router.get("/",protect, getAllFees);

// Get Fees by Student ID
router.get("/:parentId",protect, getFeesByParent);

// Update Fee Record of a student
router.put("/update/:student_id", editFee);

// Update Fee Status (Paid)
router.patch("/:id",protect, updateFeeStatus);
 
// Delete Fee Record
router.delete("/:id",protect, deleteFee);



export default router;
