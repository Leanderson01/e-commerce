import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: ["./src/server/db/src/schema/**/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  tablesFilter: ["e-commerce_*"],
} satisfies Config;
