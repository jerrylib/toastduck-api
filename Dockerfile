FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 9000

# Health check - check if port 9000 is listening
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 CMD nc -z localhost 9000 || exit 1

CMD ["node", "./build/index.js"]
