import Fees from "../models/fees.js";
import Student from "../models/student.js";

// Add Fees
export const addFee = async (req, res) => {
  const { student_id, amount, due_date } = req.body;

  try {
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const fee = new Fees({
      student_id,
      amount,
      due_date,
      status: "Pending",
    });

    await fee.save();

    res.status(201).json({
      message: "Fee added successfully",
      fee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add fee",
      error: error.message,
    });
  }
};

// Get All Fees
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fees.find()
      .populate("student_id", "name class")
      .sort({ due_date: -1 });

    res.status(200).json({
      message: "Fees records fetched successfully",
      fees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fees records",
      error: error.message,
    });
  }
};

// Get Fees by Student ID
export const getFeesByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const fees = await Fees.find({ student_id: studentId })
      .populate("student_id", "name class")
      .sort({ due_date: -1 });

    if (!fees) {
      return res.status(404).json({
        message: "No fee records found for this student",
      });
    }

    res.status(200).json({
      message: "Fee records retrieved successfully",
      fees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fee records",
      error: error.message,
    });
  }
};

// Update Fee Status (Paid)
export const updateFeeStatus = async (req, res) => {
  const { id } = req.params;
  const { status, payment_date, transaction_id } = req.body;

  try {
    const fee = await Fees.findByIdAndUpdate(
      id,
      { status, payment_date, transaction_id },
      { new: true }
    );

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    res.status(200).json({
      message: "Fee status updated successfully",
      fee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update fee status",
      error: error.message,
    });
  }
};

// Delete Fee Record
export const deleteFee = async (req, res) => {
  const { id } = req.params;

  try {
    const fee = await Fees.findByIdAndDelete(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    res.status(200).json({
      message: "Fee record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete fee record",
      error: error.message,
    });
  }
};

// Get Pending Fees (for reminders)
export const getPendingFees = async (req, res) => {
  try {
    const pendingFees = await Fees.find({ status: "Pending" })
      .populate("student_id", "name class")
      .sort({ due_date: 1 }); // Sort by due date (ascending)

    res.status(200).json({
      message: "Pending fees records fetched successfully",
      pendingFees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending fees",
      error: error.message,
    });
  }
};
