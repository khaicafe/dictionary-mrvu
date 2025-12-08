# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install yarn
RUN npm install -g yarn

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js app with increased memory
RUN NODE_OPTIONS=--max_old_space_size=4096 yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and yarn for proper signal handling
RUN apk add --no-cache dumb-init && npm install -g yarn

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install only production dependencies with yarn
RUN yarn install --frozen-lockfile --production

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
