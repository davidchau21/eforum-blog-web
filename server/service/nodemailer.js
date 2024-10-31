import nodemailer from "nodemailer";

// Khởi tạo transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Lấy email từ biến môi trường
    pass: process.env.EMAIL_PASS, // Lấy mật khẩu từ biến môi trường
  },
});

// Hàm gửi email
const sendSEmail = async ({ to, subject, html, attachments }) => {
  try {
    // Cấu hình email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Lấy email từ biến môi trường
      to,
      subject,
      html,
      attachments,
    };

    // Gửi email
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

// Export default toàn bộ service
const mailService = {
  sendEmail: async (args) => {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve(); // Trong môi trường development, không gửi email thật
    } else {
      return sendSEmail(args);
    }
  },
};

export default mailService;
