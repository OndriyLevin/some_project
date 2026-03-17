FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install all dependencies
RUN npm install

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build the client
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
