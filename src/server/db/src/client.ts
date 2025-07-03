import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const connectionString = process.env.DATABASE_URL;

// Configure postgres client with timeout and retry settings
const client = postgres(connectionString, {
  prepare: false,
  connection: {
    connect_timeout: 10, // 10 seconds timeout for connection
    application_name: "e-commerce-app",
  },
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle(client, { schema });
export type DBClient = typeof db;
