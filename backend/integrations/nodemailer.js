import nodemailer from "nodemailer";
import { mailConfig, getActiveSmtpConfig } from "../config/mail.js";

const transporter = nodemailer.createTransport(getActiveSmtpConfig());

const sendSEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: mailConfig.user,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Nodemailer send email error:", error);
  }
};

const mailService = {
  sendEmail: async (args) => {
    if (process.env.DISABLE_EMAIL === "true") {
      console.log("Email sending is disabled via DISABLE_EMAIL=true");
      return Promise.resolve();
    }

    return sendSEmail(args);
  },
};

export default mailService;

