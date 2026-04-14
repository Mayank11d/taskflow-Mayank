import pool from "../config/db";

const dbLoader = async (): Promise<void> => {
  const client = await pool.connect();
  client.release();
  console.log("Database connected");
};

export default dbLoader;
