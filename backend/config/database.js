import mongoose from "mongoose";
import { env } from "./env.js";

export const dbOptions = {
  autoIndex: true,
};

export const connectDatabase = () => mongoose.connect(env.DB_LOCATION, dbOptions);
