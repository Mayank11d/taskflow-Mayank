import dotenv from "dotenv";

if (!process.env.DATABASE_URL) {
  dotenv.config();
}

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000"),
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12"),
  DATABASE_URL: process.env.DATABASE_URL || "",
};