import { Router } from "express";
import admin from "./admin.js";
import attendance from "./attendance.js";
import parent from "./parent.js";
import student from "./student.js";
import performance from "./performance.js";
import fees from "./fees.js";

const router = Router();

router.use("/admin", admin);
router.use("/attendance", attendance);
router.use("/parent", parent);
router.use("/student", student);
router.use("/performance", performance);
router.use("/fees", fees);

export default router;
