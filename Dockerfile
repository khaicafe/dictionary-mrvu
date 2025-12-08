# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies (prefer npm to avoid lock file conflicts)
RUN npm ci || npm install

# Copy source code
COPY . .

# Build the Next.js app with increased memory and minimal cache
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build -- --no-lint

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev || npm install --production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Create data directory (will be mounted as volume with database)
RUN mkdir -p /app/data

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["npm", "start"]
