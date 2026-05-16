import { Hono } from "@hono/hono";
import { streamSSE } from "@hono/hono/streaming";
import { cache } from "@hono/hono/cache";
import postgres from "postgres";
import { Redis } from "npm:ioredis";
import { auth } from "./auth.js";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const requireAuth = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  return next();
};

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return next();
  }

  c.set("user", session.user.name);
  return next();
});


const sql = postgres({
  host: Deno.env.get("POSTGRES_HOST"),
  port: Number(Deno.env.get("POSTGRES_PORT") ?? "5432"),
  database: Deno.env.get("POSTGRES_DB"),
  user: Deno.env.get("POSTGRES_USER"),
  password: Deno.env.get("POSTGRES_PASSWORD"),
} );


let redis;
if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}


app.post("/users", async (c) => {
  const { name } = await c.req.json();
   await redis.lpush("users", JSON.stringify({ name }));
  c.status(202);
  return c.body("Accepted");
});

app.get(
  "/api/languages",
  cache({
    cacheName: "languages-cache",
    wait: true,
  }),
);

app.get("/api/languages", async (c) => {
  const languages = await sql`
    SELECT id, name
    FROM languages
    ORDER BY id
  `;

  return c.json(languages);
});

app.get(
  "/api/languages/*",
  cache({
    cacheName: "exercises-cache",
    wait: true,
  }),
);

app.get("/api/languages/:id/exercises", async (c) => {
  const languageId = c.req.param("id");

  const exercises = await sql`
    SELECT id, title, description
    FROM exercises
    WHERE language_id = ${languageId}
    ORDER BY id
  `;

  return c.json(exercises);
});

app.use("/api/exercises/:id/submissions", requireAuth);
app.use("/api/submissions/:id/status", requireAuth);


app.post("/api/exercises/:id/submissions", async (c) => {
  const exerciseId = c.req.param("id");
  const { source_code } = await c.req.json();

  const [submission] = await sql`
    INSERT INTO exercise_submissions (exercise_id, source_code)
    VALUES (${exerciseId}, ${source_code})
    RETURNING id
  `;

  await redis.lpush("submissions", submission.id);

  return c.json({ id: submission.id });
});

app.get("/api/exercises/:id", async (c) => {
  const exerciseId = c.req.param("id");

  const [exercise] = await sql`
    SELECT id, title, description
    FROM exercises
    WHERE id = ${exerciseId}
  `;

  if (!exercise) {
    return c.body(null, 404);
  }

  return c.json(exercise);
});

app.get("/api/submissions/:id/status", async (c) => {
  const submissionId = c.req.param("id");

  const [submission] = await sql`
    SELECT grading_status, grade
    FROM exercise_submissions
    WHERE id = ${submissionId}
  `;

  if (!submission) {
    return c.body(null, 404);
  }

  return c.json(submission);

});

const streams = new Set();

const notifyActiveUsers = async () => {
  const users = streams.size;
  for (const stream of streams) {
    stream.writeSSE({ data: `Active users: ${users}` });
  }
};

app.get("/api/stats/sse-active-users", (c) => {
  return streamSSE(c, async (stream) => {
    streams.add(stream);
    await notifyActiveUsers();

    while (!stream.aborted && !stream.closed) {
      await stream.sleep(1000);
    }

    streams.delete(stream);
    await notifyActiveUsers();
  });
});

app.get("/api/lgtm-test", (c) => {
  console.log("Hello log collection :)");
  return c.json({ message: "Hello, world!" });
});

export default app;