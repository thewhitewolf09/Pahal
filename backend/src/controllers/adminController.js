import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    // Check if the phone number already exists
    const existingAdmin = await Admin.findOne({ phone });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "phone number already registered." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new admin
    const newAdmin = new Admin({
      name,
      phone,
      password: hashedPassword,
      role,
    });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin.", error });
  }
};

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    


    // Find admin by phone
    const admin = await Admin.findOne({ phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful.", admin, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error });
  }
};

// Get admin details
export const getAdminDetails = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id); // Use middleware to set req.admin
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin details.", error });
  }
};
