import nodemailer from "nodemailer";
import { google } from "googleapis";
import { oauthConfig } from "../config/mail.js";

const oAuth2Client = new google.auth.OAuth2(
  oauthConfig.clientId,
  oauthConfig.clientSecret,
  oauthConfig.redirectUrl
);

oAuth2Client.setCredentials({
  refresh_token: oauthConfig.refreshToken,
});

const sendSEmail = async ({ to, subject, html, attachments }) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "davidduongxu1@gmail.com",
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        refreshToken: oauthConfig.refreshToken,
        accessToken,
      },
    });

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
    throw error;
  }
};

const mailService = {
  sendEmail: async (args) => sendSEmail(args),
};

export default mailService;
