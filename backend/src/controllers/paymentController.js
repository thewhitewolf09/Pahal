import Payment from "../models/payment.js";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

export const processPayment = async (req, res) => {
  const { parent_id, amountPaid } = req.body;
  if (!parent_id || !amountPaid) {
    return res
      .status(400)
      .json({ message: "Parent ID and amount are required." });
  }

  try {
    // Generate transaction ID in format TXN-time-1000
    const currentTimestamp = Date.now(); // Get the current time in milliseconds
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
    const transactionId = `TXN-${currentTimestamp}-${randomSuffix}`;

    // Fetch students associated with the parent
    const students = await Student.find({ parent_id });
    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this parent." });
    }

    let remainingAmount = amountPaid; // Track the amount left to allocate

    // Current date as payment date
    const currentPaymentDate = new Date();

    // Iterate over students to settle their fees
    for (let student of students) {
      const pendingFees = await Fees.find({
        student_id: student._id,
        status: { $in: ["Pending", "Partial"] },
      }).sort({ due_date: 1 }); // Settle older dues first

      for (let fee of pendingFees) {
        if (remainingAmount === 0) break;

        if (remainingAmount >= fee.amount) {
          remainingAmount -= fee.amount;
          fee.status = "Paid";
          fee.payment_date = currentPaymentDate;
        } else {
          remainingAmount = 0;
          fee.status = "Partial";
          fee.payment_date = currentPaymentDate;
        }

        await fee.save();
      }

      if (remainingAmount === 0) break;
    }

    // Create a new payment record
    const payment = new Payment({
      parent_id,
      amount_paid: amountPaid,
      payment_date: currentPaymentDate,
      transaction_id: transactionId,
    });
    await payment.save();

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

    const { amount_paid, payment_date } = payment;
    let remainingAmountToReverse = amount_paid;

    // Reverse the effects of the payment on fees
    const affectedFees = await Fees.find({ payment_date }).sort({
      due_date: -1,
    }); // Reverse newer payments first

    for (let fee of affectedFees) {
      if (remainingAmountToReverse === 0) break;

      if (fee.status === "Paid") {
        fee.status = "Pending";
        fee.payment_date = null;
        remainingAmountToReverse -= fee.amount;
      } else if (fee.status === "Partial") {
        fee.amount += remainingAmountToReverse;
        fee.status = "Pending";
        remainingAmountToReverse = 0;
      }

      await fee.save();
    }

    // Delete the payment record
    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Payment deleted successfully and fees updated.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete payment.",
      error: error.message,
    });
  }
};
