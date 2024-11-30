import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50, 
    },
    class: {
      type: String,
      required: true,
      match: /^[0-9]{1,2}[A-Z]?$/, 
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent', 
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500, 
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

const Student = mongoose.model('Student', StudentSchema);

export default Student;
