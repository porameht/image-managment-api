# Use the official Bun image as base
FROM oven/bun:1.0 as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application (if needed)
RUN bun run build

# Start a new stage for a smaller final image
FROM oven/bun:1.0

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src

# Set environment variables
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]