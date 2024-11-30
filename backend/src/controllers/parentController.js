import Parent from "../models/parent.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Student from "../models/student.js";


// Add a Parent
export const addParent = async (req, res) => {
  const { name, phone, whatsapp, children_ids } = req.body;

  try {
    const existingParent = await Parent.findOne({ phone });
    if (existingParent) {
      return res.status(400).json({
        message: 'A parent with this phone number already exists.',
      });
    }

    const parent = new Parent({ name, phone, whatsapp, children_ids });
    await parent.save();

    res.status(201).json({
      message: 'Parent added successfully',
      parent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add parent', error: error.message });
  }
};

// Login Parent
export const loginParent = async (req, res) => {
    const { phone } = req.body;
  
    try {
      const parent = await Parent.findOne({ phone });
  
      if (!parent) {
        return res.status(404).json({ message: 'Parent not found.' });
      }
  
      // Generate a token
      const token = jwt.sign({ id: parent._id, role: parent.role }, process.env.JWT_SECRET_KEY, {
        expiresIn: '7d', // Token valid for 7 days
      });
  
      res.status(200).json({
        message: 'Parent logged in successfully',
        token,
        parent
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to login parent', error: error.message });
    }
  };

// Get All Parents
export const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().populate('children_ids', 'name class');
    res.status(200).json({
      message: 'Parents retrieved successfully',
      parents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch parents', error: error.message });
  }
};

// Get Parent by ID
export const getParentById = async (req, res) => {
  const { id } = req.params;

  try {
    const parent = await Parent.findById(id).populate('children_ids', 'name class');
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json({
      message: 'Parent retrieved successfully',
      parent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch parent', error: error.message });
  }
};

// Update Parent
export const updateParent = async (req, res) => {
  const { id } = req.params;
  const { name, phone, whatsapp, children_ids } = req.body;

  try {
    const parent = await Parent.findByIdAndUpdate(
      id,
      { name, phone, whatsapp, children_ids },
      { new: true }
    );

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json({
      message: 'Parent updated successfully',
      parent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update parent', error: error.message });
  }
};

// Delete Parent and associated Students
export const deleteParent = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the parent by ID
    const parent = await Parent.findById(id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Delete associated students
    await Student.deleteMany({ parent_id: parent._id });

    // Now delete the parent
    await Parent.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Parent and associated students deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete parent', error: error.message });
  }
};

