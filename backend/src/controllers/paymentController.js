import Payment from "../models/payment.js";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

export const processPayment = async (req, res) => {
  const { parent_id, amountPaid, transactionId } = req.body;

  if (!parent_id || !amountPaid) {
    return res
      .status(400)
      .json({ message: "Parent ID and amount are required." });
  }

  try {
    // Use provided transactionId or generate a new one
    const currentTimestamp = Date.now(); // Get the current time in milliseconds
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
    const finalTransactionId =
      transactionId || `TXN-${currentTimestamp}-${randomSuffix}`;

    // Record the current payment first
    const payment = new Payment({
      parent_id,
      amount_paid: amountPaid,
      payment_date: new Date(),
      transaction_id: finalTransactionId,
    });
    await payment.save();

    // Fetch all students associated with the parent
    const students = await Student.find({ parent_id });
    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this parent." });
    }

    // Fetch all fees for the parent's children
    const studentIds = students.map((student) => student._id);
    const fees = await Fees.find({ student_id: { $in: studentIds } });

    // Fetch all payments made by the parent, including the newly saved payment
    const payments = await Payment.find({ parent_id });
    const totalPaymentsMade = payments.reduce(
      (sum, payment) => sum + payment.amount_paid,
      0
    );

    // Update fee statuses based on the total payments
    let remainingBalance = totalPaymentsMade;

    for (let fee of fees) {
      if (remainingBalance >= fee.amount) {
        fee.status = "Paid";
        fee.payment_date = new Date();
        remainingBalance -= fee.amount;
      } else {
        fee.status = "Pending"; // Mark as pending if the fee isn't fully paid
        fee.payment_date = null;
      }
      await fee.save();
    }

    res.status(200).json({
      message: "Payment processed successfully.",
      payment, // Send the created payment record
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process payment.",
      error: error.message,
    });
  }
};

export const getPaymentHistoryByParent = async (req, res) => {
  const { parentId } = req.params;

  try {
    const payments = await Payment.find({ parent_id: parentId }).sort({
      payment_date: -1,
    });

    res.status(200).json({
      message: "Payment history fetched successfully.",
      payments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch payment history.",
      error: error.message,
    });
  }
};

export const deletePayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    const { parent_id } = payment;

    // Delete the payment record
    await Payment.findByIdAndDelete(id);

    // Fetch all students associated with the parent
    const students = await Student.find({ parent_id });
    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this parent." });
    }

    // Fetch all fees for the parent's children
    const studentIds = students.map((student) => student._id);
    const fees = await Fees.find({ student_id: { $in: studentIds } });

    // Fetch all remaining payments for the parent
    const payments = await Payment.find({ parent_id });
    const totalPaymentsMade = payments.reduce(
      (sum, payment) => sum + payment.amount_paid,
      0
    );

    // Update fee statuses based on the remaining total payments
    let remainingBalance = totalPaymentsMade;

    for (let fee of fees) {
      if (remainingBalance >= fee.amount) {
        fee.status = "Paid";
        fee.payment_date = new Date();
        remainingBalance -= fee.amount;
      } else {
        fee.status = "Pending";
        fee.payment_date = null;
      }
      await fee.save();
    }

    res.status(200).json({
      message: "Payment deleted successfully, and fees recalculated.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete payment.",
      error: error.message,
    });
  }
};


