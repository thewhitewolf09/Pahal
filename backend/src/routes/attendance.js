import express from "express";
import {
  addAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
  updateAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add Attendance
router.post("/",protect, addAttendance);

// Get Attendance by Date
router.get("/date/:date",protect, getAttendanceByDate);

// Get Attendance by Student
router.get("/student/:student_id",protect, getAttendanceByStudent);

// Update Attendance
router.patch("/",protect, updateAttendance);

// Delete Attendance
router.delete("/:id",protect, deleteAttendance);

export default router;
