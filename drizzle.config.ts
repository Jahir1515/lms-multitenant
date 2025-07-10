import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: process.env.NODE_ENV === "production"? 
    {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.DATABASE_ID!,
      token: process.env.CLOUDFLARE_API_TOKEN!,
    } 
    : 
    {
      url: "file:./dev.db",
    },
} satisfies Config;
