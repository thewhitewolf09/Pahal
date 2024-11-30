import mongoose from 'mongoose';

const ParentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50, 
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/, 
    },
    whatsapp: {
      type: String,
      match: /^[0-9]{10}$/, 
      default: null,
    },
    role: {
      type: String,
      default: 'parent', 
    },
    children_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
      },
    ],
  },
  {
    timestamps: true, 
  }
);


const Parent = mongoose.model('Parent', ParentSchema);

export default Parent;
