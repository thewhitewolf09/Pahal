import cron from "node-cron";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

// Utility to calculate the due date
const calculateDueDate = (year, month) => {
  return new Date(year, month, 30, 23, 59, 59); // 30th of the month at 23:59:59
};

// Function to add fees for the previous month if they don't exist
const addMonthlyFees = async () => {
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
        // Use atomic operation to avoid duplicate entries
        const fee = await Fees.findOneAndUpdate(
          {
            student_id: student._id,
            due_date: previousMonthDueDate,
          },
          {
            $setOnInsert: {
              amount: 600,
              status: "Pending",
              payment_date: null,
              transaction_id: null,
            },
          },
          { upsert: true, new: true }
        );
      }
    } else {
      console.log("It's not yet time to generate fees for the next month.");
    }
  } catch (error) {
    console.error("Error while adding monthly fees:", error.message);
  }
};

// Schedule the cron job to run daily at midnight local time
cron.schedule("* * * * * *", () => {
  addMonthlyFees();
});
