FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Development: full deps + nodemon hot reload ──────────────────────────────
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ── Production: only prod deps, no devtools ───────────────────────────────────
FROM base AS prod
RUN npm ci --omit=dev
COPY src/ ./src/
EXPOSE 5000
CMD ["node", "src/index.js"]
