FROM oven/bun:1

WORKDIR /app

# Install dependencies first (better caching)
COPY bun.lock bunfig.toml package.json ./
RUN bun install --frozen-lockfile

# Copy source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]

