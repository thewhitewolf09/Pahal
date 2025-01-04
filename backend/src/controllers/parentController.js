import Parent from "../models/parent.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/student.js";
import twilio from "twilio";
import Fees from "../models/fees.js";
import Payment from "../models/payment.js";
import dotenv from "dotenv";
dotenv.config();

// Twilio credentials (store these in environment variables for security)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Add a Parent
export const addParent = async (req, res) => {
  const { name, phone, whatsapp, children_ids } = req.body;

  try {
    const existingParent = await Parent.findOne({ phone });
    if (existingParent) {
      return res.status(400).json({
        message: "A parent with this phone number already exists.",
      });
    }

    const parent = new Parent({ name, phone, whatsapp, children_ids });
    await parent.save();

    res.status(201).json({
      message: "Parent added successfully",
      parent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add parent", error: error.message });
  }
};

// Login Parent
export const loginParent = async (req, res) => {
  const { phone } = req.body;

  try {
    const parent = await Parent.findOne({ phone }).populate(
      "children_ids",
      "name class"
    );

    if (!parent) {
      return res.status(404).json({ message: "Parent not found." });
    }

    // Generate a token
    const token = jwt.sign(
      { id: parent._id, role: parent.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d", // Token valid for 7 days
      }
    );

    res.status(200).json({
      message: "Parent logged in successfully",
      token,
      parent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to login parent", error: error.message });
  }
};

// Get All Parents
export const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().populate("children_ids", "name class");
    res.status(200).json({
      message: "Parents retrieved successfully",
      parents,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch parents", error: error.message });
  }
};

// Get Parent by ID
export const getParentById = async (req, res) => {
  const { id } = req.params;

  try {
    const parent = await Parent.findById(id).populate(
      "children_ids",
      "name class"
    );
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.status(200).json({
      message: "Parent retrieved successfully",
      parent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch parent", error: error.message });
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
      return res.status(404).json({ message: "Parent not found" });
    }

    res.status(200).json({
      message: "Parent updated successfully",
      parent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update parent", error: error.message });
  }
};

// Delete Parent and associated Students
export const deleteParent = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the parent by ID
    const parent = await Parent.findById(id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Retrieve the IDs of the parent's children
    const childrenIds = parent.children_ids;

    if (childrenIds && childrenIds.length > 0) {
      // Delete fees records associated with the parent's children
      await Fees.deleteMany({ student_id: { $in: childrenIds } });

      // Delete the students associated with the parent
      await Student.deleteMany({ _id: { $in: childrenIds } });
    }

    // Now delete the parent
    await Parent.findByIdAndDelete(id);

    res.status(200).json({
      message: "Parent, associated students, and their fees deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete parent", error: error.message });
  }
};

// Helper function to calculate due fees
export const calculateDueFees = async (parentId) => {
  try {
    // Fetch all students of the parent
    const students = await Student.find({ parent_id: parentId });
    if (!students || students.length === 0) {
      return 0;
    }

    let totalDueAmount = 0;

    // For each student, fetch their fees
    for (let student of students) {
      const fees = await Fees.find({ student_id: student._id });
      let totalFees = 0;
      let totalPayments = 0;

      // Calculate the total fees for this student
      fees.forEach((fee) => {
        totalFees += fee.amount;
      });

      // Calculate total payments made by this parent for this student
      const payments = await Payment.find({ parent_id: parentId });
      payments.forEach((payment) => {
        totalPayments += payment.amount_paid;
      });

      // Due fees for the student = total fees - total payments
      totalDueAmount += totalFees - totalPayments;
    }

    return totalDueAmount;
  } catch (error) {
    throw new Error("Error calculating due fees: " + error.message);
  }
};

// Send reminder
export const sendReminder = async (req, res) => {
  const { parentId } = req.body;

  try {
    // Calculate due fees
    const dueAmount = await calculateDueFees(parentId);

    // Get the parent details
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Hardcoded reminder message in Hindi with due fees
    const reminderMessage = `नमस्ते, आपके बच्चे का कुल बकाया ₹${dueAmount} है। कृपया इसे जल्द से जल्द चुकता करें।`;

    let whatsappSid, smsSid;

    // Check if the parent has a WhatsApp number
    // if (parent.whatsapp) {
    //   // Send WhatsApp message if WhatsApp number exists
    //   const whatsappMessage = await client.messages.create({
    //     body: reminderMessage,
    //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE_NUMBER}`,
    //     to: `whatsapp:+91${parent.whatsapp}`,
    //   });
    //   whatsappSid = whatsappMessage.sid;
    // }

    // Send SMS message (if WhatsApp is not available or after WhatsApp)
    const smsMessage = await client.messages.create({
      body: reminderMessage,
      from: process.env.TWILIO_SMS_PHONE_NUMBER,
      to: `+91${parent.phone}`,
    });
    smsSid = smsMessage.sid;

    res.status(200).json({
      message: "Reminder sent successfully!",
      reminder: {
        parentId: parent._id,
        whatsappSid: whatsappSid || "No WhatsApp sent",
        smsSid: smsSid,
      },
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res
      .status(500)
      .json({ message: "Failed to send reminder", error: error.message });
  }
};

// Send to All reminder
// Notify all parents with due amount > 500
export const notifyAllParents = async (req, res) => {
  try {
    const parents = await Parent.find();

    let reminderResults = [];

    for (const parent of parents) {
      // Calculate the due amount
      const dueAmount = await calculateDueFees(parent._id);

      // Skip parents with due amount <= 500
      if (dueAmount <= 500) {
        reminderResults.push({
          parentId: parent._id,
          message: "Skipped due to low due amount (<= ₹500)",
        });
        continue;
      }

      // Reminder message
      const reminderMessage = `नमस्ते, आपके बच्चे का कुल बकाया ₹${dueAmount} है। कृपया इसे जल्द से जल्द चुकता करें।`;

      let whatsappSid = null;
      let smsSid = null;

      try {
        // if (parent.whatsapp) {
        //   // Send WhatsApp message
        //   const whatsappMessage = await client.messages.create({
        //     body: reminderMessage,
        //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE_NUMBER}`,
        //     to: `whatsapp:+91${parent.whatsapp}`,
        //   });
        //   whatsappSid = whatsappMessage.sid;
        // }

        // Send SMS message
        const smsMessage = await client.messages.create({
          body: reminderMessage,
          from: process.env.TWILIO_SMS_PHONE_NUMBER,
          to: `+91${parent.phone}`,
        });
        smsSid = smsMessage.sid;

        reminderResults.push({
          parentId: parent._id,
          whatsappSid: whatsappSid || "No WhatsApp sent",
          smsSid: smsSid,
        });
      } catch (error) {
        console.error(
          `Error sending message to parent ${parent._id}:`,
          error.message
        );
        reminderResults.push({
          parentId: parent._id,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Notifications sent to parents with due amounts > ₹500.",
      results: reminderResults,
    });
  } catch (error) {
    console.error("Error notifying parents:", error);
    res
      .status(500)
      .json({ message: "Failed to notify parents", error: error.message });
  }
};
