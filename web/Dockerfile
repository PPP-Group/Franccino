# syntax=docker/dockerfile:1
# Site Next.js para staging e preview (EasyPanel ou docker compose). Contexto do build: raiz do repositório
# (workspace pnpm). O build do Next roda ao iniciar, com a API no ar: ver web/docker/start.sh.
FROM node:24-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1 \
    HUSKY=0 \
    CI=true
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json web/
RUN pnpm install --frozen-lockfile

COPY web web
RUN chmod +x web/docker/start.sh

ENV NODE_ENV=production \
    PORT=3000
EXPOSE 3000
CMD ["sh", "web/docker/start.sh"]
