# --- STAGE 1: Build the React Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# 1. Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# 2. Copy source and build (Vite usually outputs to /dist)
COPY frontend/ ./
RUN npm run build

# --- STAGE 2: Setup the Node.js Backend ---
FROM node:18-alpine
WORKDIR /app

# 1. Copy backend package files and install production dependencies
COPY server/package*.json ./
RUN npm install --only=production

# 2. Copy the rest of the backend source code
COPY server/ ./

# 3. Copy the frontend build artifacts into the server's public folder
# Note: Stage 1 build output (dist) is moved to Stage 2's /app/public
COPY --from=frontend-builder /app/frontend/dist ./public

# 4. Set Environment Variables
ENV NODE_ENV=production
ENV PORT=8000

# 5. Open the port your server uses
EXPOSE 8000

# 6. Start the server using your specific entry point
CMD ["node", "src/server.js"]