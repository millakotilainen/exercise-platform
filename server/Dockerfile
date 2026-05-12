FROM denoland/deno:alpine-2.0.6

WORKDIR /app

COPY deno.json ./
RUN DENO_FUTURE=1 deno install
COPY . .

CMD ["deno", "task", "dev"]
