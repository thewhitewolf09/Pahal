import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/, 
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50, 
    },
    role: {
      type: String,
      default: 'admin', 
    },
  },
  {
    timestamps: true, 
  }
);

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
