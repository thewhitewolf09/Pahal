import cron from "node-cron";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

// Utility to calculate the due date
const calculateDueDate = (year, month) => {
  const date = new Date(year, month, 30); // 30th of the month
  return date.toISOString().split("T")[0];
};

// Function to calculate the fee based on the student's joining month and other conditions
const calculateFeesForStudent = (student, changeDate) => {
  const joiningDate = new Date(student.joining_date);
  const currentDate = changeDate || new Date();
  const diffInTime = currentDate - joiningDate;
  const diffInDays = diffInTime / (1000 * 3600 * 24);

  // Determine which week the student joined in the current month
  let feeMultiplier = 1; // Default full fee for first week
  if (diffInDays <= 7) {
    feeMultiplier = 1; // First week, full fee
  } else if (diffInDays <= 14) {
    feeMultiplier = 0.75; // Second week, 3/4 fee
  } else if (diffInDays <= 21) {
    feeMultiplier = 0.5; // Third week, half fee
  } else if (diffInDays <= 28) {
    feeMultiplier = 0.25; // Fourth week, 1/4 fee
  }

  // Base fee is 600₹
  let totalFees = 600 * feeMultiplier;

  // Add transport and accommodation fees if applicable
  if (student.transport) {
    totalFees += 600; // Add transport fee
  }
  if (student.accommodation) {
    totalFees += 2500; // Add accommodation fee
  }

  return totalFees;
};

// Function to add or update fees for the previous month
const addOrUpdateMonthlyFees = async () => {
  try {
    const students = await Student.find(); // Get all students

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Calculate the due date for the previous month
    const previousMonth = currentMonth - 1;
    const previousMonthYear = previousMonth < 0 ? currentYear - 1 : currentYear;
    const previousMonthIndex = previousMonth < 0 ? 11 : previousMonth; // Handle December to January transition
    const previousMonthDueDate = calculateDueDate(
      previousMonthYear,
      previousMonthIndex
    );

    for (const student of students) {
      const totalFees = calculateFeesForStudent(student); // Calculate the fee based on student joining date and conditions

      // If the transport or accommodation status changed mid-month, update the fees
      const existingFee = await Fees.findOne({
        student_id: student._id,
        due_date: previousMonthDueDate, // Compare the formatted due date
      });

      if (!existingFee) {
        // Create new fee record if one doesn't exist
        await Fees.create({
          student_id: student._id,
          amount: totalFees,
          status: "Pending",
          due_date: previousMonthDueDate,
          payment_date: null,
          transaction_id: null,
        });
      } else {
        // Check if the transport or accommodation status changed
        const feeNeedsUpdate =
          student.transport !== existingFee.transport ||
          student.accommodation !== existingFee.accommodation;

        if (feeNeedsUpdate) {
          console.log(
            `Updating fee for student ${student._id} due to status change.`
          );

          // Use the date of change (actual implementation depends on tracking)
          const changeDate = new Date(); // Replace with the actual change date if available

          // Recalculate the fee for the updated status
          const updatedFee = calculateFeesForStudent(student, changeDate);

          // Update the fee record
          existingFee.amount = updatedFee;
          existingFee.transport = student.transport;
          existingFee.accommodation = student.accommodation;

          await existingFee.save();
          console.log(
            `Fee updated for student ${student._id} to ${updatedFee} on ${previousMonthDueDate}.`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "Error while adding or updating monthly fees:",
      error.message
    );
  }
};

// Schedule the cron job to run daily at midnight local time
cron.schedule("0 0 * * *", () => {
  addOrUpdateMonthlyFees();
});
