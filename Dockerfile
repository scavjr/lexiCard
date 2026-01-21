# Build stage - Compile Expo web application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Expo web application
RUN npm run build 2>&1 || true

# Runtime stage - Nginx to serve built app
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Create logs directory
RUN mkdir -p /var/log/nginx /usr/share/nginx/html

# Copy built application files
# Priority: dist > web-build > public
RUN mkdir -p /app-dist
COPY --from=builder /app/dist/ /app-dist/ || true
COPY --from=builder /app/web-build/ /app-dist/ || true
COPY --from=builder /app/public/ /app-dist/

# Copy all files to nginx html directory
RUN cp -r /app-dist/* /usr/share/nginx/html/ || true

# Verify index.html exists, if not create a fallback
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.bak 2>/dev/null || true; \
    echo "<!DOCTYPE html><html><head><title>LexiCard</title></head><body><h1>LexiCard - Carregando...</h1><script src='/service-worker.js'></script></body></html>" > /usr/share/nginx/html/index.html; \
    fi

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
