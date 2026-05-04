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
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: env.SENDINBLUE_USER,
      pass: env.SENDINBLUE_API_KEY,
    },
  },
};

export const mailConfig = {
  user: env.EMAIL_USER,
  pass: env.EMAIL_PASS,
  isDevelopment,
};

export const oauthConfig = {
  clientId: env.OAUTH_CLIENT_ID,
  clientSecret: env.OAUTH_CLIENT_SECRET,
  refreshToken: env.OAUTH_REFRESH_TOKEN,
  redirectUrl: "https://developers.google.com/oauthplayground",
};
