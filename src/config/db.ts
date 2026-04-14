import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  require("dotenv").config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
});

export default pool;