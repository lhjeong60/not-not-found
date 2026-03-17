FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@8.5.1 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Build shared package
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @not-not-found/shared build

# Build API
COPY apps/api/ ./apps/api/
RUN pnpm --filter @not-not-found/api build

# Production image
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@8.5.1 --activate

# Puppeteer dependencies
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
