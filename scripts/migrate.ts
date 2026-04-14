import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";


if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
});

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(maxAttempts = 5) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Retrying DB connection (${attempt}/${maxAttempts})...`);
      }
      return await pool.connect();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await wait(2000 * attempt);
      }
    }
  }

  throw lastError;
}

async function runMigrations(): Promise<void> {
  let client;

  try {
    client = await connectWithRetry();

    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        ran_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".up.sql"))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        "SELECT 1 FROM migrations WHERE filename = $1",
        [file]
      );

      if (rows.length > 0) {
        console.log(`Skipping (already ran): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
      await client.query(sql);
      await client.query(
        "INSERT INTO migrations (filename) VALUES ($1)",
        [file]
      );
      console.log(` Ran migration: ${file}`);
    }

    console.log(" All migrations complete.");
  } catch (err) {
    console.error(" Migration failed:", err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(" Fatal migration error:", err);
  process.exit(1);
});