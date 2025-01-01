import cron from "node-cron";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

// Utility to calculate the due date
const calculateDueDate = (year, month) => {
  return new Date(year, month, 30, 23, 59, 59); // 30th of the month at 23:59:59
};

// Function to calculate the fee based on the student's joining month and other conditions
const calculateFeesForStudent = (student, changeDate) => {
  const joiningDate = new Date(student.joining_date);
  const currentDate = changeDate || new Date(); // Use the change date if provided
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

// Function to add or update fees for the previous month if they don't exist or need to be updated
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
    const previousMonthDueDate = calculateDueDate(previousMonthYear, previousMonthIndex);

    // Only proceed if the previous month's due date has passed
    if (currentDate > previousMonthDueDate) {
      for (const student of students) {
        const totalFees = calculateFeesForStudent(student); // Calculate the fee based on student joining date and conditions

        // Check if the fees already exist for the student for the previous month
        const existingFee = await Fees.findOne({
          student_id: student._id,
          due_date: previousMonthDueDate,
        });

        // If fees don't exist, create a new one; if they exist, update them if the transport or accommodation status changed
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
          // If the transport or accommodation status changed mid-month, update the fees
          const feeNeedsUpdate =
            student.transport !== existingFee.transport ||
            student.accommodation !== existingFee.accommodation;

          if (feeNeedsUpdate) {
            // Find the date of the change (could be when the student updated their transport/accommodation status)
            const changeDate = new Date(); // Example, you should replace this with the actual date of change

            // Recalculate the fee for the changed status from the change date to the end of the month
            const newFee = calculateFeesForStudent(student, changeDate);

            // Adjust the amount for the current month
            existingFee.amount = newFee;
            existingFee.transport = student.transport;
            existingFee.accommodation = student.accommodation;

            await existingFee.save();
          }
        }
      }
    } else {
      console.log("It's not yet time to generate fees for the next month.");
    }
  } catch (error) {
    console.error("Error while adding or updating monthly fees:", error.message);
  }
};

// Schedule the cron job to run daily at midnight local time
cron.schedule("* * * * * *", () => {
  addOrUpdateMonthlyFees();
});
