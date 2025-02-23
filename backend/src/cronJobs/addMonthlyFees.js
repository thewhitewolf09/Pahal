import cron from "node-cron";
import Fees from "../models/fees.js";
import Student from "../models/student.js";

const calculateDueDate = (prevMonthsYear, prevMonth) => {
  const lastDayOfPrevMonth = new Date(prevMonthsYear, prevMonth + 1, 0).getDate(); // Last day of the previous month

  const dueDay = prevMonth === 1 ? lastDayOfPrevMonth : 30; 
  const dueDate = new Date(prevMonthsYear, prevMonth, dueDay);
  
  // Convert to YYYY-MM-DD in local time
  const formattedDate = dueDate.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
  return formattedDate; // Return in local time YYYY-MM-DD format
};

const calculateFeesForStudent = (student) => {
  const baseFee = 600;
  let totalFees = baseFee;

  if (student.transport) {
    totalFees += 600; // Transport fee
  }
  if (student.accommodation) {
    totalFees += 2500; // Accommodation fee
  }

  return totalFees;
};

const addOrUpdateMonthlyFees = async () => {
  try {
    const students = await Student.find(); // Fetch all students

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const previousMonth = currentMonth - 1;
    const previousMonthYear = previousMonth < 0 ? currentYear - 1 : currentYear;
    const previousMonthIndex = previousMonth < 0 ? 11 : previousMonth;
    
    const previousMonthDueDate = calculateDueDate(
      previousMonthYear,
      previousMonthIndex
    );

    for (const student of students) {
      const recalculatedFee = calculateFeesForStudent(student);

      const existingFee = await Fees.findOne({
        student_id: student._id,
        due_date: previousMonthDueDate,
      });

      if (!existingFee) {
        // No fee record exists, create a new one
        await Fees.create({
          student_id: student._id,
          amount: recalculatedFee,
          status: "Pending",
          due_date: previousMonthDueDate,
          payment_date: null,
          accommodation: student.accommodation, // Add accommodation status
          transport: student.transport, // Add transport status
        });
      } else {
        // Check if the `accommodation` or `transport` status has changed
        const hasAccommodationChanged = existingFee.accommodation !== student.accommodation;
        const hasTransportChanged = existingFee.transport !== student.transport;

        if (hasAccommodationChanged || hasTransportChanged) {
          console.log(
            `Updating fees for student ${student._id} due to changes in accommodation or transport`
          );

          // Recalculate fee based on the updated status
          const updatedFee = calculateFeesForStudent(student);

          // Update the fee record with the recalculated amount and status
          existingFee.amount = updatedFee;
          existingFee.accommodation = student.accommodation;
          existingFee.transport = student.transport;

          await existingFee.save();
        }
      }
    }
  } catch (error) {
    console.error("Error while adding or updating monthly fees:", error.message);
  }
};

// Schedule the cron job to run every 10 seconds
cron.schedule("* * * * * *", async () => {
  try {
    await addOrUpdateMonthlyFees();
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});

