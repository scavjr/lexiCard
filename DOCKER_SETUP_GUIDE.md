# 🐳 Task 4.1: Docker Configuration - Testing Guide

## Configuração Criada

```
✅ Dockerfile - Multi-stage build (Node builder + Nginx runner)
✅ docker-compose.yml - Serviço web com volumes e health checks
✅ nginx.conf - Configuração global Nginx
✅ nginx-default.conf - Virtual host com PWA support
✅ .dockerignore - Otimizar build size
✅ .env.production.example - Variáveis de ambiente
```

## 🧪 Teste Local (5 min)

### 1. Verificar Docker instalado

```bash
docker --version
docker-compose --version
```

### 2. Build da imagem

```bash
cd d:\particular\computacao\Desenvolvimento\projetosTypescript\lexicard
docker build -t lexicard:latest .
```

**Esperado:**

- ✅ Build bem-sucedido
- ✅ Imagem criada (veja com `docker images`)

### 3. Iniciar container via docker-compose

```bash
# Copiar variáveis de ambiente
cp .env.production.example .env.production

# Editar .env.production com valores reais de Supabase

# Iniciar containers
docker-compose up -d
```

**Esperado:**

- ✅ Container inicia
- ✅ Porta 3000 mapeada para localhost

### 4. Testar acesso

```bash
# No navegador
http://localhost:3000

# Ou via curl
curl -I http://localhost:3000
```

**Esperado:**

```
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: no-cache, no-store, must-revalidate
```

### 5. Verificar logs

```bash
# Ver logs do container
docker-compose logs -f web

# Ou específico
docker logs lexicard-web
```

### 6. Verificar service worker

```bash
curl http://localhost:3000/service-worker.js
curl http://localhost:3000/manifest.json
```

**Esperado:**

- ✅ Ambos retornam 200 OK
- ✅ Sem cache headers (no-cache)

### 7. Parar containers

```bash
docker-compose down

# Se quiser remover volumes também
docker-compose down -v
```

## 📊 Checklist

| Item                           | Status      |
| ------------------------------ | ----------- |
| Dockerfile criado              | ✅          |
| docker-compose.yml criado      | ✅          |
| Nginx config criado            | ✅          |
| .env.production.example criado | ✅          |
| Build funciona localmente      | ⏳ A testar |
| Container inicia               | ⏳ A testar |
| Porta 3000 acessível           | ⏳ A testar |
| Service Worker servido         | ⏳ A testar |
| Health check passando          | ⏳ A testar |

## 🔧 Troubleshooting

### Build falha com "npm: not found"

- **Causa:** Node.js não instalado na imagem
- **Solução:** Verificar `FROM node:18-alpine` no Dockerfile

### Port 3000 já está em uso

```bash
# Mudar porta em docker-compose.yml
ports:
  - "3001:80"  # Mudar 3000 para 3001 (ou qualquer outra)
```

### Container não inicia

```bash
# Ver erro detalhado
docker-compose logs web

# Verificar health check
docker inspect --format='{{json .State.Health}}' lexicard-web | jq
```

### Service Worker não servido

- Verificar se `/etc/nginx/html/service-worker.js` existe
- Checar logs Nginx: `/var/log/nginx/error.log`

## 📚 Próximas Tarefas

1. ✅ Task 4.1: Docker Configuration (CONCLUÍDO)
2. ⏳ Task 4.2: GitHub Actions CI/CD
3. ⏳ Task 4.3: Nginx + SSL em OceanDigital

## 💡 Dicas

1. **Rebuild sem cache:** `docker build --no-cache -t lexicard:latest .`
2. **Ver imagens:** `docker images | grep lexicard`
3. **Remover imagem:** `docker rmi lexicard:latest`
4. **Exec em container:** `docker-compose exec web sh`
5. **Tamanho da imagem:** `docker images | grep lexicard` (coluna SIZE)

---

Após testar localmente com sucesso, partir para **Task 4.2: GitHub Actions CI/CD**
