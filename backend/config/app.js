// Application configuration
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-key",
    expiry: process.env.JWT_EXPIRY || "7d",
  },
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
