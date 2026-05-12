# exercise-platform
A full-stack web application for browsing and submitting programming language exercises. Submissions are queued in Redis and processed asynchronously by a dedicated grader service, with real-time status polling on the frontend. The architecture uses Traefik as a reverse proxy routing traffic across multiple services, making it easy to scale individual components horizontally via Docker Compose replicas.

Stack: Astro · Svelte · Deno · Hono · PostgreSQL · Redis · Docker Compose · Traefik
