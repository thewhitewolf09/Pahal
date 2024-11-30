import Attendance from "../models/attendance.js";

// Add Attendance
export const addAttendance = async (req, res) => {
  const { date, student_id, status } = req.body;

  try {
    const existingRecord = await Attendance.findOne({ date, student_id });
    if (existingRecord) {
      return res.status(400).json({
        message: 'Attendance already marked for this student on the given date.',
      });
    }

    const attendance = new Attendance({ date, student_id, status });
    await attendance.save();

    res.status(201).json({
      message: 'Attendance added successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add attendance', error: error.message });
  }
};

// Get Attendance by Date
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const attendance = await Attendance.find({ date }).populate('student_id', 'name class');
    res.status(200).json({
      message: 'Attendance retrieved successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get Attendance by Student
export const getAttendanceByStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const attendance = await Attendance.find({ student_id }).sort({ date: -1 });
    res.status(200).json({
      message: 'Attendance retrieved successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({
      message: 'Attendance deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete attendance', error: error.message });
  }
};
