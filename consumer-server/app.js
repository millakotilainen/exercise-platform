import {Redis} from "ioredis";
import postgres from "postgres";

const sql = postgres({
  host: Deno.env.get("POSTGRES_HOST"),
  port: Number(Deno.env.get("POSTGRES_PORT") ?? "5432"),
  database: Deno.env.get("POSTGRES_DB"),
  user: Deno.env.get("POSTGRES_USER"),
  password: Deno.env.get("POSTGRES_PASSWORD"),
});

const redisConsumer = new Redis(6379, "redis");

const QUEUE_NAME = "users";

const consume = async () => {
  while (true) {
    const result = await redisConsumer.brpop(QUEUE_NAME, 0); 
    if (result) {
        const [queue, userData] = result;
        const user = JSON.parse(userData);
        await sql`INSERT INTO users (name) VALUES (${user.name})`;
    }
  }
};

consume();