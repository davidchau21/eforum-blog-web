import nodemailer from 'nodemailer';

// Khởi tạo transporter với Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io', // SMTP host của Mailtrap
  port: 587, // Cổng mặc định cho Mailtrap (có thể dùng 2525 hoặc 465 cho bảo mật)
  secure: false, // True cho port 465, false cho các port khác
  auth: {
    user: process.env.MAILTRAP_USERNAME, // Username từ Mailtrap
    pass: process.env.MAILTRAP_PASSWORD, // Password từ Mailtrap
  },
});

// Hàm gửi email
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: "davidduongxu1@gmail.com", // Địa chỉ email dùng để gửi (nên là một địa chỉ hợp lệ)
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
    console.error('Error sending email:', error);
  }
};

// Export default service
const mailService = {
  sendEmail: async (args) => {
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve(); // Trong môi trường development, không gửi email thật
    } else {
      return sendEmail(args);
    }
  },
};

export default mailService;
