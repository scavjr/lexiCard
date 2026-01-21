# Build stage - gera bundle web Expo
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build (recebem variáveis do DigitalOcean - DEVEM estar marcadas como Build Time)
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY

# Converte ARG para ENV (necessário para o script inject-env.js)
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY

# Dependências
COPY package*.json ./
RUN npm ci

# Código-fonte
COPY . .

# Debug: mostrar se as variáveis existem (sem mostrar valores)
RUN echo "=== Build Environment Check ===" && \
    echo "SUPABASE_URL set: $(test -n \"$EXPO_PUBLIC_SUPABASE_URL\" && echo 'YES' || echo 'NO')" && \
    echo "SUPABASE_ANON_KEY set: $(test -n \"$EXPO_PUBLIC_SUPABASE_ANON_KEY\" && echo 'YES' || echo 'NO')"

# Build Expo Web (npm run build já roda inject-env primeiro)
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
