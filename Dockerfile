FROM node:24-alpine AS deps

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci \
    && node -e "const fs = require('node:fs'); const p = 'node_modules/nuxt/package.json'; if (!fs.statSync(p).size) throw new Error('Empty dependency: ' + p); JSON.parse(fs.readFileSync(p, 'utf8'))" \
    && npm cache clean --force

FROM node:24-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
    && node -e "const fs = require('node:fs'); for (const p of ['.output/server/index.mjs', '.output/server/chunks/nitro/nitro.mjs', '.output/server/package.json']) { if (!fs.statSync(p).size) throw new Error('Empty build artifact: ' + p) }"

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=build /app/.output ./.output

RUN node -e "const fs = require('node:fs'); for (const p of ['.output/server/index.mjs', '.output/server/chunks/nitro/nitro.mjs', '.output/server/package.json']) { if (!fs.statSync(p).size) throw new Error('Empty runtime file: ' + p) }"

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
