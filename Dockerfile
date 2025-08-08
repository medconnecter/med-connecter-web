# Development mode Dockerfile - uses npm run dev
FROM node:23-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install ALL dependencies (including dev dependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Expose port 80 (will be mapped from Vite's default 5173)
EXPOSE 80

# Start development server on port 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"] 