import nodemailer from 'nodemailer';

// Khởi tạo transporter với Brevo (Sendinblue) SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // SMTP host của Brevo
  port: 587, // Sử dụng port 587 cho kết nối không bảo mật, 465 cho bảo mật
  secure: false, // Đặt thành true nếu sử dụng port 465
  auth: {
    user: process.env.SENDINBLUE_USER, // Địa chỉ email Brevo của bạn
    pass: process.env.SENDINBLUE_API_KEY, // API key của Brevo (hoặc mật khẩu SMTP)
  },
});

// Hàm gửi email
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: "davidduongxu1@gmail.com", // Địa chỉ email đã xác minh trên Brevo
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
