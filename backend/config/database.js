// Database configuration
export const dbConfig = {
  database:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/projectnova",
  pool: {
    min: 2,
    max: 10,
  },
};
