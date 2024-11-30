import express from "express";
import {
  addAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Add Attendance
router.post("/", addAttendance);

// Get Attendance by Date
router.get("/date/:date", getAttendanceByDate);

// Get Attendance by Student
router.get("/student/:student_id", getAttendanceByStudent);

// Update Attendance
router.patch("/:id", updateAttendance);

// Delete Attendance
router.delete("/:id", deleteAttendance);

export default router;
