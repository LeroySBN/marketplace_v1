FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
