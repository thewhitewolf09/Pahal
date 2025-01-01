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
  },
  {
    timestamps: true,
  }
);

const Fees = mongoose.model("Fees", FeesSchema);

export default Fees;
