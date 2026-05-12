FROM denoland/deno:alpine-2.3.6

WORKDIR /app

COPY package.json ./
RUN DENO_FUTURE=1 deno install --allow-scripts --frozen=false

COPY . .

RUN deno cache "jsr:@std/http@1.0/file-server" "jsr:@std/path@1"
RUN deno task build
RUN deno cache dist/server/entry.mjs

ENV PORT=4321
ENV HOST=0.0.0.0

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "--allow-sys", "dist/server/entry.mjs"]
