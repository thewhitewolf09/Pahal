import mongoose from "mongoose";

const FeesSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    payment_date: {
      type: Date,
      default: null,
    },
    accommodation: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of student_id and due_date
FeesSchema.index({ student_id: 1, due_date: 1 }, { unique: true });

const Fees = mongoose.model("Fees", FeesSchema);

export default Fees;
