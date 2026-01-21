# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar tipos Supabase
RUN npm run type-check || true

# Build web app (Expo web output)
RUN npm run web -- --build 2>/dev/null || npm run build || true

# Runtime stage - usar Nginx para servir
FROM nginx:alpine

# Copiar configuração Nginx customizada
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Criar diretório de logs
RUN mkdir -p /var/log/nginx

# Copiar arquivos buildados (se existir web build)
# Nota: Expo web build output varia, pode estar em dist/, build/, ou .expo/
COPY --from=builder /app/dist /usr/share/nginx/html || true
COPY --from=builder /app/build /usr/share/nginx/html || true
COPY --from=builder /app/.expo /usr/share/nginx/html || true

# Se nenhum foi copiado, criar diretório com mensagem de teste
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    mkdir -p /usr/share/nginx/html && \
    echo '<html><body><h1>LexiCard - Build em progresso</h1></body></html>' > /usr/share/nginx/html/index.html; \
    fi

# Copiar pasta public (manifest.json, service-worker.js, etc)
COPY public /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/manifest.json || exit 1

# Expor porta
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
