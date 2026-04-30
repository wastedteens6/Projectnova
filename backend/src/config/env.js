import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

export function loadEnv() {
  const envFile =
    process.env.NODE_ENV === "production" ? ".env" : ".env.development";
  const primaryPath = path.join(backendRoot, envFile);
  const fallbackPath = path.join(backendRoot, ".env");

  if (fs.existsSync(primaryPath)) {
    dotenv.config({ path: primaryPath });
    return primaryPath;
  }

  dotenv.config({ path: fallbackPath });
  return fallbackPath;
}

export function getDatabaseConfig() {
  const hasDiscreteConfig =
    process.env.DB_USER ||
    process.env.DB_PASSWORD ||
    process.env.DB_HOST ||
    process.env.DB_PORT ||
    process.env.DB_NAME;

  if (hasDiscreteConfig) {
    return {
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "admin123",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "projectnova",
    };
  }

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  return {
    user: "postgres",
    password: "admin123",
    host: "localhost",
    port: 5432,
    database: "projectnova",
  };
}

loadEnv();
