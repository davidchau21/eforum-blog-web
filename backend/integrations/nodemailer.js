import nodemailer from "nodemailer";
import { mailConfig, smtpConfig } from "../config/mail.js";

const transporter = nodemailer.createTransport(smtpConfig.gmail);

const sendSEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: mailConfig.user,
      to,
      subject,
      html,
      attachments,
    };

    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

const mailService = {
  sendEmail: async (args) => {
    if (mailConfig.isDevelopment) {
      return Promise.resolve();
    }

    return sendSEmail(args);
  },
};

export default mailService;
