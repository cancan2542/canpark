FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS dev
RUN pnpm exec playwright install --with-deps chromium
COPY . .
EXPOSE 4321
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "4321"]

FROM deps AS builder
COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.30.4-alpine@sha256:9b87ad3dd9f431c733f19dfb278c7eb3dba9dca381942c79818bb42f1a566a83 AS runner
USER root
RUN apk upgrade --no-cache
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:8080/"]
