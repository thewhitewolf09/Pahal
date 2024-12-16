import Attendance from "../models/attendance.js";

// Add Attendance
export const addAttendance = async (req, res) => {
  const { date, attendance } = req.body;

  try {
    const formattedDate = new Date(
      date.split("-").reverse().join("-") // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
    );

    // Iterate through attendance object and process each student's record
    const attendanceResults = await Promise.all(
      Object.entries(attendance).map(async ([student_id, status]) => {
        const existingRecord = await Attendance.findOne({
          date: formattedDate,
          student_id,
        });

        if (existingRecord) {
          // Update existing record if it already exists
          existingRecord.status = status;
          return existingRecord.save();
        } else {
          // Create a new attendance record
          const newAttendance = new Attendance({
            date: formattedDate,
            student_id,
            status,
          });
          return newAttendance.save();
        }
      })
    );

    // Populate student details for the response
    const populatedAttendance = await Attendance.find({ date: formattedDate })
      .populate("student_id", "name class") // Populate student details
      .exec();

    res.status(201).json({
      message: "Attendance records added/updated successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process attendance",
      error: error.message,
    });
  }
};

// Get Attendance by Date
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.params;

  try {
    // Convert "DD-MM-YYYY" to "YYYY-MM-DD" and create a Date object
    const formattedDate = new Date(date.split("-").reverse().join("-"));

    // Ensure only the date part is compared (ignoring time)
    const startOfDay = new Date(
      formattedDate.getFullYear(),
      formattedDate.getMonth(),
      formattedDate.getDate()
    );
    const endOfDay = new Date(
      formattedDate.getFullYear(),
      formattedDate.getMonth(),
      formattedDate.getDate() + 1
    );

    // Query for records within the specific day range
    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).populate("student_id", "name class");

    res.status(200).json({
      message: "Attendance retrieved successfully",
      attendance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

// Get Attendance by Student
export const getAttendanceByStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const attendance = await Attendance.find({ student_id }).sort({ date: -1 });
    res.status(200).json({
      message: "Attendance retrieved successfully",
      attendance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  const { date, attendance } = req.body;

  try {
    const formattedDate = new Date(
      date.split("-").reverse().join("-") // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
    );

    // Iterate through the attendance object and update records
    const updatePromises = Object.entries(attendance).map(
      async ([student_id, status]) => {
        const existingRecord = await Attendance.findOne({
          date: formattedDate,
          student_id,
        });

        if (existingRecord) {
          // Update the status of the existing record
          existingRecord.status = status;
          return existingRecord.save();
        } else {
          // If no record exists, create a new one
          const newAttendance = new Attendance({
            date: formattedDate,
            student_id,
            status,
          });
          return newAttendance.save();
        }
      }
    );

    // Resolve all update promises
    const updatedAttendance = await Promise.all(updatePromises);

    res.status(200).json({
      message: "Attendance updated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete attendance", error: error.message });
  }
};
