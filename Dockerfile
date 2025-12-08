# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first for better cache
COPY package.json package-lock.json* ./

# Optimize npm: increase timeout, retry
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Next.js app: disable Turbopack, use webpack for stability
RUN NODE_OPTIONS=--max_old_space_size=4096 NEXT_TURBOPACK_DISABLED=1 npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Copy environment files (will be mounted by docker run if needed)
COPY .env.production.local* .env.local* ./

# Create data directory (will be mounted as volume)
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
