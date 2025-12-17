import { Pool } from "pg";

declare global {
  var __pool: Pool | undefined;
}

export const pool =
  global.__pool || new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  global.__pool = pool;
}
