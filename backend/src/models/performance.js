import mongoose from 'mongoose';

const PerformanceSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', 
      required: true, 
    },
    test_date: {
      type: Date,
      required: true, 
    },
    subject: {
      type: String,
      required: true,
      maxlength: 100, 
      default: 'Mixed Sunday Test', 
    },
    marks: {
      type: Number,
      required: true,
      min: 0, 
      max: 100, 
    },
  },
  {
    timestamps: true, 
  }
);

const Performance = mongoose.model('Performance', PerformanceSchema);

export default Performance;
