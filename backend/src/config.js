import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
