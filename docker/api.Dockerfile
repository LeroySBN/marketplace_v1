# Build stage
FROM node:22-alpine AS builder

WORKDIR /data/api

# Create necessary directories with correct permissions
RUN mkdir -p /data/storage /data/api/node_modules && \
    chown -R node:node /data/storage /data/api

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY --chown=node:node . ./

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /data/api

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /data/api/dist ./dist

# Expose API port
EXPOSE 5010

# Start the application
CMD ["npm", "start"]
