import { Hono } from "@hono/hono";
import postgres from "postgres";
import { Redis } from "npm:ioredis";

const app = new Hono();
const sql = postgres({
  host: Deno.env.get("POSTGRES_HOST"),
  port: Number(Deno.env.get("POSTGRES_PORT") ?? "5432"),
  database: Deno.env.get("POSTGRES_DB"),
  user: Deno.env.get("POSTGRES_USER"),
  password: Deno.env.get("POSTGRES_PASSWORD"),
});

let redis;
if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}

let consume_enabled = false;

app.get("/api/status", async (c) => {
  const submissionCount = await redis.llen("submissions");
  return c.json({queue_size: submissionCount, consume_enabled: consume_enabled});
});

app.post("/api/consume/enable", async (c) => {
  consume_enabled = true;
  gradeSubmissions();
  return c.json({consume_enabled: consume_enabled});
});

app.post("/api/consume/disable", async (c) => {
  consume_enabled = false;
  return c.json({consume_enabled: consume_enabled});
});

const gradeSubmissions = async () => {
  while (consume_enabled) {
    const queueSize = await redis.llen("submissions");

    if (queueSize === 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      continue;
    }

    // get one item from the queue
    const submissionId = await redis.rpop("submissions");

    // 1. update grading status to "processing"
    await sql`
      UPDATE exercise_submissions
      SET grading_status = 'processing'
      WHERE id = ${submissionId}
    `;

    // 2. sleep random time between 1-3 sec
    const sleepTime = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 3. udpate grading status to "graded"
    const grade = Math.floor(Math.random() * 101);
    await sql`
      UPDATE exercise_submissions
      SET grading_status = 'graded', grade = ${grade}
      WHERE id = ${submissionId}
    `;
  }
};


export default app;