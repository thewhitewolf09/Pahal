import express from "express";
import {
  addParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
  loginParent,
  sendReminder,
  notifyAllParents,
} from "../controllers/parentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/", protect, addParent);
router.post("/login", loginParent);

// Protected Routes
router.get("/", protect, getAllParents);
router.get("/:id", protect, getParentById);
router.patch("/:id", protect, updateParent);
router.delete("/:id", protect, deleteParent);
router.post("/send-reminder",protect, sendReminder);
router.post("/notify-all",protect, notifyAllParents);

export default router;
