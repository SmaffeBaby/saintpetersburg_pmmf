FROM node:24-alpine AS deps

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

FROM node:24-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
