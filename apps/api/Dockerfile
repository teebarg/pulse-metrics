FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

COPY .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . ./

EXPOSE 8787

CMD ["pnpm", "dev"]
