import nodemailer from "nodemailer";
import { mailConfig, smtpConfig } from "../config/mail.js";

const transporter = nodemailer.createTransport(smtpConfig.mailtrap);

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: "davidduongxu1@gmail.com",
      to,
      subject,
      html,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const mailService = {
  sendEmail: async (args) => {
    if (mailConfig.isDevelopment) {
      return Promise.resolve();
    }

    return sendEmail(args);
  },
};

export default mailService;
