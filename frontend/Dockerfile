FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Development: hot reload via Next.js dev server ────────────────────────────
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Production: standalone output ─────────────────────────────────────────────
FROM base AS prod
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
