import cron from "node-cron";
import twilio from "twilio";
import { calculateDueFees } from "../controllers/parentController.js";
import Parent from "../models/parent.js";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Send reminder based on the parent’s due fees
const sendAutoReminder = async () => {
  try {
    // Get all parents who need to be reminded (you can adjust the filter as needed)
    const parents = await Parent.find();

    for (const parent of parents) {
      // Calculate the due amount
      const dueAmount = await calculateDueFees(parent._id);

      if (dueAmount > 0) {
        // Create reminder message
        const reminderMessage = `आपका बकाया शुल्क ₹${dueAmount} है। कृपया शीघ्र भुगतान करें।`;

        // Check if the parent has a WhatsApp number
        // if (parent.whatsapp) {
        //   // Send WhatsApp message if WhatsApp number exists
        //   await client.messages.create({
        //     body: reminderMessage,
        //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE_NUMBER}`,
        //     to: `whatsapp:+91${parent.whatsapp}`,
        //   });
        // }

        // Send SMS message (if WhatsApp is not available or after WhatsApp)
        const sms = await client.messages.create({
          body: reminderMessage,
          from: process.env.TWILIO_SMS_PHONE_NUMBER,
          to: `+91${parent.phone}`,
        });
        console.log("Auto reminder task executed successfully.");
      }
    }
  } catch (error) {
    console.error("Error during the auto reminder task:", error);
  }
};

// Set up cron job to run daily at 9:00 AM
//cron.schedule("0 9 * * *", sendAutoReminder);

