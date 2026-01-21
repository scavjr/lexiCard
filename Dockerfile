# Build stage - gera bundle web Expo
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci

# Código-fonte
COPY . .

# Build Expo Web (gera dist/)
RUN npm run build

# Runtime stage - Nginx servindo dist
FROM nginx:alpine

# Config Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Diretórios necessários
RUN mkdir -p /var/log/nginx /usr/share/nginx/html

# Copia bundle gerado
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
