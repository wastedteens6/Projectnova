import pkg from "pg";
const { Client } = pkg;

async function createDatabase() {
  const client = new Client({
    user: "postgres",
    password: "admin123",
    host: "localhost",
    port: 5432,
    database: "postgres", // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL system database.");

    const dbName = "projectnova";
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
