import createApp from "./app";
import { ENV } from "./config/env";
import pool from "./config/db";

const start = async () => {
  const app = await createApp();

  const server = app.listen(ENV.PORT, () => {
    console.log(`TaskFlow API running on port ${ENV.PORT}`);
  });

  process.on("SIGTERM", async () => {
    console.log("SIGTERM — shutting down gracefully");
    server.close(async () => {
      await pool.end();
      console.log("DB pool closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
