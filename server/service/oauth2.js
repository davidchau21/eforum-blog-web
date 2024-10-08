import nodemailer from "nodemailer";
import { google } from "googleapis";

// Cấu hình OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID, // CLIENT_ID từ biến môi trường
  process.env.OAUTH_CLIENT_SECRET, // CLIENT_SECRET từ biến môi trường
  "https://developers.google.com/oauthplayground" // Redirect URL
);

// Set refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN, // REFRESH_TOKEN từ biến môi trường
});

// Hàm gửi email sử dụng OAuth2
const sendSEmail = async ({ to, subject, html, attachments }) => {
  try {
    // Lấy Access Token từ OAuth2 Client
    const accessToken = await oAuth2Client.getAccessToken();

    // Khởi tạo transporter với OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "davidduongxu1@gmail.com", // Email từ biến môi trường
        clientId: process.env.OAUTH_CLIENT_ID, // CLIENT_ID từ biến môi trường
        clientSecret: process.env.OAUTH_CLIENT_SECRET, // CLIENT_SECRET từ biến môi trường
        refreshToken: process.env.OAUTH_REFRESH_TOKEN, // REFRESH_TOKEN từ biến môi trường
        accessToken: accessToken, // Access token mới lấy được
      },
    });

    // Cấu hình email
    const mailOptions = {
      from: "davidduongxu1@gmail.com", // Email người gửi
      to,
      subject,
      html,
      attachments,
    };

    // Gửi email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result);
    return result;

  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Export default toàn bộ service
const mailService = {
  sendEmail: async (args) => {
    return sendSEmail(args);
  },
};

export default mailService;
