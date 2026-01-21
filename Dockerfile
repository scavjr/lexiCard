# Runtime stage - Nginx to serve application
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Create directories
RUN mkdir -p /var/log/nginx /usr/share/nginx/html

# Copy public folder (landing page, service worker, manifest, icons)
COPY public/ /usr/share/nginx/html/

# Ensure index.html exists
RUN test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found" && exit 1)

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
