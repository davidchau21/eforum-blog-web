import { mailConfig } from "../config/mail.js";

export default (name, otp) => {
  const logoUrl = `${mailConfig.clientUrl}/logo.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Account Verification OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
    }
    td {
      vertical-align: top;
    }
    .wrapper {
      background-color: #f8fafc;
      padding: 40px 20px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      border: 1px solid #f1f5f9;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .logo-img {
      height: 40px;
      width: auto;
      margin-right: 12px;
      vertical-align: middle;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      vertical-align: middle;
      display: inline-block;
      margin: 0;
    }
    .subtitle {
      color: #d1fae5;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 5px;
    }
    .content {
      padding: 40px 30px;
      color: #334155;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 15px;
    }
    p {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 15px;
      color: #475569;
    }
    .otp-wrapper {
      text-align: center;
      margin: 30px 0;
    }
    .otp-box {
      display: inline-block;
      background-color: #f0fdf4;
      color: #059669;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      padding: 16px 36px 16px 44px; /* extra left padding offset to center letter spacing */
      border-radius: 12px;
      border: 1px solid #bbf7d0;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    }
    .note {
      font-size: 13px;
      color: #64748b;
      background-color: #f8fafc;
      border-left: 3px solid #10b981;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 25px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 0 0 10px 0;
    }
    .footer a {
      color: #059669;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <img class="logo-img" src="${logoUrl}" alt="EForum Logo">
          <h1 class="logo-text">EForum</h1>
        </div>
        <div class="subtitle">Account Verification</div>
      </div>
      <div class="content">
        <h1>Hi ${name},</h1>
        <p>Thank you for signing up on EForum! To complete your registration and activate your account, please use the One-Time Password (OTP) below:</p>
        
        <div class="otp-wrapper">
          <div class="otp-box">${otp}</div>
        </div>
        
        <div class="note">
          <strong>Security Note:</strong> This OTP is valid for the next 10 minutes. Please do not share this code with anyone for security purposes.
        </div>
        
        <p>If you did not request this verification, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>Need help? Contact our support team at <a href="mailto:support@edublog.com">support@edublog.com</a></p>
        <p>&copy; 2026 EForum. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
