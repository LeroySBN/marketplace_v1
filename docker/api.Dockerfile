# Build stage
FROM node:18-alpine AS builder

WORKDIR /data/api

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Create necessary directories with correct permissions
RUN mkdir -p /data/storage /data/api/node_modules && \
    chown -R node:node /data/storage /data/api

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies including devDependencies
RUN npm install --ignore-scripts

# Copy source code
COPY --chown=node:node . ./

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /data/api

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN apk add --no-cache python3 make g++ && \
    npm install --omit=dev --ignore-scripts && \
    apk del python3 make g++

# Copy built files from builder stage
COPY --from=builder /data/api/dist/ ./dist/

# Expose API port
EXPOSE 5010

# Start the application
CMD ["node", "dist/server.js"]
