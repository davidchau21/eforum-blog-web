import nodemailer from "nodemailer";
import { mailConfig, smtpConfig } from "../config/mail.js";

const transporter = nodemailer.createTransport(smtpConfig.brevo);

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: "davidduongxu1@gmail.com",
      to,
      subject,
      html,
      attachments,
    };

    return await transporter.sendMail(mailOptions);
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
