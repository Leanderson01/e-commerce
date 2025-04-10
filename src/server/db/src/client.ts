import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema/index"

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set")
}
const connectionString = process.env.POSTGRES_URL

const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })
export type DBClient = typeof db
