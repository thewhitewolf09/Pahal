import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0, 
    },
    transaction_id: {
      type: String,
      default: null, 
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
