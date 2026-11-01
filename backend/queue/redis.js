import "dotenv/config";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const isEnabled = process.env.REDIS_ENABLED === "true";

let redisClient = null;
let redisPubClient = null;
let redisSubClient = null;

if (isEnabled && redisUrl) {
  try {
    const redisOptions = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
    };

    redisClient = new Redis(redisUrl, redisOptions);
    redisPubClient = new Redis(redisUrl, redisOptions);
    redisSubClient = new Redis(redisUrl, redisOptions);

    redisClient.on("error", (err) => console.error("Redis Client Error:", err.message));
    redisClient.on("connect", () => console.log("Redis connected successfully!"));
    redisClient.on("ready", () => console.log("Redis client ready!"));

    redisPubClient.on("error", (err) => console.error("Redis Pub Error:", err.message));
    redisSubClient.on("error", (err) => console.error("Redis Sub Error:", err.message));
  } catch (err) {
    console.error("Failed to initialize Redis:", err.message);
  }
} else {
  console.log("Redis is currently disabled (REDIS_ENABLED=false). Running in fallback in-memory mode.");
}

export const isRedisEnabled = () => isEnabled && Boolean(redisClient);
export { redisClient, redisPubClient, redisSubClient, redisUrl };

