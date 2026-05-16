import { betterAuth } from "better-auth";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

const dialect = new PostgresJSDialect({
  postgres: postgres({
    host: Deno.env.get("POSTGRES_HOST"),
    port: Number(Deno.env.get("POSTGRES_PORT") ?? "5432"),
    database: Deno.env.get("POSTGRES_DB"),
    user: Deno.env.get("POSTGRES_USER"),
    password: Deno.env.get("POSTGRES_PASSWORD"),
  }),
});

export const auth = betterAuth({
  database: {
    dialect: dialect,
    type: "postgresql",
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "app_user",
  },
});