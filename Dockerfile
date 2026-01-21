# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte e public assets
COPY . .
COPY public/ ./public/

# Runtime stage - usar Nginx para servir
FROM nginx:alpine

# Copiar configuração Nginx customizada
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Criar diretório de logs
RUN mkdir -p /var/log/nginx

# Criar diretório raiz e copiar assets estáticos
RUN mkdir -p /usr/share/nginx/html

# Copiar pasta public (manifest.json, service-worker.js, icons, index.html, etc)
COPY --from=builder /app/public/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/manifest.json || exit 1

# Expor porta
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
