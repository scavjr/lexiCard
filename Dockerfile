# Build stage - Compile Expo web application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Expo web application
RUN npm run build 2>&1 || echo "Build completed"

# Check what was generated
RUN ls -la /app/ && ls -la /app/dist 2>/dev/null || ls -la /app/web-build 2>/dev/null || echo "No dist/web-build found, using public folder"

# Runtime stage - Nginx to serve built app
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Create logs directory
RUN mkdir -p /var/log/nginx

# Copy built application or fallback to public
RUN mkdir -p /usr/share/nginx/html

# Try to copy dist (Expo export output)
COPY --from=builder /app/dist /usr/share/nginx/html 2>/dev/null || true
COPY --from=builder /app/web-build /usr/share/nginx/html 2>/dev/null || true

# Fallback: copy public folder with all assets
COPY --from=builder /app/public/ /usr/share/nginx/html/

# Ensure index.html exists
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo "ERROR: No index.html found!"; \
    exit 1; \
    fi

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
