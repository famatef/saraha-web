import { config } from "dotenv";
import { resolve } from "node:path";
const NODE_ENV = process.env.NODE_ENV || "development";
const envPath = { development: ".env.development", production: ".env.production" };
config({ path: resolve(`./config/${envPath[NODE_ENV] || envPath.development}`) });
const secret = (name, developmentFallback) => {
  if (NODE_ENV === "production" && !process.env[name]) {
    throw new Error(`${name} must be configured in production`);
  }
  return process.env[name] || developmentFallback;
};
export const PORT = Number(process.env.PORT || 3000);
export const DB_URI = process.env.DB_URI;
export const REDIS_URL = process.env.REDIS_URL;
export const DB_URL_ONLINE = process.env.DB_URL_ONLINE;
export const ACCESS_TOKEN_SECRET = secret("ACCESS_TOKEN_SECRET", "fam1");
export const REFRESH_TOKEN_SECRET = secret("REFRESH_TOKEN_SECRET", "fam123");
export const ENCRYPTION_KEY = secret("ENCRYPTION_KEY", "727e6e6f646973676d6170692e636f6d");
if (Buffer.byteLength(ENCRYPTION_KEY, "utf8") !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 bytes");
}
