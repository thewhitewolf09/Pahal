import express from "express";
import {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add Student
router.post("/", protect, addStudent);

// Get All Students
router.get("/", protect, getAllStudents);

// Get Student by ID
router.get("/:id", protect, getStudentById);

// Update Student
router.patch("/:id", protect, updateStudent);

// Delete Student
router.delete("/:id", protect, deleteStudent);

export default router;
