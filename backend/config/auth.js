import { env } from "./env.js";

export const accessTokenSecret = env.SECRET_ACCESS_KEY || env.JWT_SECRET;
export const refreshTokenSecret = env.REFRESH_TOKEN_SECRET || env.JWT_SECRET;
export const verificationTokenSecret = env.JWT_SECRET || accessTokenSecret;
