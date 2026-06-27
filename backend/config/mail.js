import { env } from "./env.js";
import { isDevelopment } from "./app.js";

export const smtpConfig = {
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  },
  mailtrap: {
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
      user: env.MAILTRAP_USERNAME,
      pass: env.MAILTRAP_PASSWORD,
    },
  },
  brevo: {
    host: env.BREVO_HOST || "smtp-relay.brevo.com",
    port: Number(env.BREVO_PORT) || 587,
    secure: false,
    auth: {
      user: env.BREVO_USER,
      pass: env.BREVO_API_KEY,
    },
  },
};

export const getActiveSmtpConfig = () => {
  if (env.SMTP_HOST) {
    return {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === "true" || env.SMTP_SECURE === true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    };
  }

  const service = env.MAIL_SERVICE || "gmail";
  return smtpConfig[service] || smtpConfig.gmail;
};

export const mailConfig = {
  user: env.MAIL_FROM || env.BREVO_USER || env.EMAIL_USER || env.SMTP_USER || env.MAILTRAP_USERNAME,
  isDevelopment,
  clientUrl: env.CLIENT_URL || "http://localhost:5173",
};

export const oauthConfig = {
  clientId: env.OAUTH_CLIENT_ID,
  clientSecret: env.OAUTH_CLIENT_SECRET,
  refreshToken: env.OAUTH_REFRESH_TOKEN,
  redirectUrl: "https://developers.google.com/oauthplayground",
};

