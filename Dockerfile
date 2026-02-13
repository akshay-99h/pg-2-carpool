FROM node:20-slim

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

COPY . .

RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "--filter", "@carpool/web", "exec", "next", "dev", "--webpack", "-H", "0.0.0.0", "-p", "3000"]
