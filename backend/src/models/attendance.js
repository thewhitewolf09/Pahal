import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true, 
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', 
      required: true, 
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'], 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', AttendanceSchema);

export default Attendance;
 