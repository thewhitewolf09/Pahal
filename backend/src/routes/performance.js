import express from "express";
import {
  addPerformance,
  getAllPerformance,
  getPerformanceByStudent,
  updatePerformance,
  deletePerformance,
} from "../controllers/performanceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add Performance
router.post("/", protect, addPerformance);

// Get All Performance Records
router.get("/", protect, getAllPerformance);

// Get Performance by Student ID
router.get("/:studentId", protect, getPerformanceByStudent);

// Update Performance
router.patch("/:id", protect, updatePerformance);

// Delete Performance
router.delete("/:id", protect, deletePerformance);

export default router;
