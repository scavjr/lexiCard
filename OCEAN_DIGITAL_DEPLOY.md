# 🚀 Deploy LexiCard no OceanDigital App Platform

## Pré-requisitos

- ✅ GitHub account (com repositório privado/público)
- ✅ OceanDigital account
- ✅ Dockerfile pronto (já criado ✅)
- ✅ docker-compose.yml (para testes locais, não necessário em produção)

---

## 📋 Passo-a-Passo (15 min)

### 1️⃣ **Push do código para GitHub**

```bash
# Se ainda não tem repositório
git init
git add .
git commit -m "feat: LexiCard MVP - PWA com Supabase"
git branch -M main
git remote add origin https://github.com/seu-usuario/lexicard.git
git push -u origin main
```

### 2️⃣ **Criar App no OceanDigital App Platform**

1. **Ir para:** https://cloud.digitalocean.com/apps
2. **Clicar:** "Create App"
3. **Selecionar:**
   - Source: GitHub
   - Repository: seu-usuario/lexicard
   - Branch: main

4. **Configurar serviço:**
   - **Name:** lexicard-web
   - **Source:** /Dockerfile
   - **Build Command:** (deixar em branco - usa Dockerfile)
   - **Run Command:** (deixar em branco - usa ENTRYPOINT do Dockerfile)
   - **HTTP Port:** 80
   - **Health Check:**
     - Path: `/manifest.json`
     - Interval: 30s
     - Timeout: 3s

### 3️⃣ **Configurar Variáveis de Ambiente**

Na aba "Environment" no App Platform:

```
REACT_APP_SUPABASE_URL=https://vmyhvjpnwqmhwqkcbvuk.supabase.co
REACT_APP_SUPABASE_KEY=seu-anon-key-de-producao
REACT_APP_DICTIONARYAPI_URL=https://api.dictionaryapi.dev/api/v2
NODE_ENV=production
```

### 4️⃣ **Configurar Recursos**

- **Instance Type:** Basic ($6/mo) ou Standard ($12/mo)
- **Instance Count:** 1
- **Storage:** Não necessário
- **Database:** Não necessário (usando Supabase)

### 5️⃣ **Adicionar Domínio (Opcional)**

1. Se tiver domínio próprio:
   - Clicar "Create Domain"
   - Adicionar seu domínio
   - Configurar DNS na sua registradora

2. Se não tiver:
   - OceanDigital fornece automaticamente: `lexicard-web-xxx.ondigitalocean.app`

### 6️⃣ **Deploy Automático (já configurado!)**

Quando fizer push no main:

```bash
git push origin main
```

OceanDigital:

- ✅ Detecta mudança no GitHub
- ✅ Faz build com Dockerfile
- ✅ Deploy automático
- ✅ Restart automático

---

## 🔐 Segurança & SSL

✅ **Automático no OceanDigital App Platform:**

- ✅ HTTPS automático (Let's Encrypt)
- ✅ Certificado renovado automaticamente
- ✅ Redireciona HTTP → HTTPS
- ✅ Headers de segurança configurados

---

## 📊 Monitoramento

### Logs em Tempo Real

```
No App Platform:
1. Ir para "Logs"
2. Ver build e deployment em tempo real
3. Ver erros de runtime
```

### Métricas

```
No App Platform:
1. Ir para "Metrics"
2. Ver CPU, Memória, Banda
3. Ver requisições por segundo
```

---

## ✅ Checklist de Deploy

| Item                       | Status     |
| -------------------------- | ---------- |
| Código no GitHub           | ⏳ A fazer |
| App Platform criado        | ⏳ A fazer |
| Variáveis de ambiente      | ⏳ A fazer |
| Domínio configurado        | ⏳ A fazer |
| First deploy bem-sucedido  | ⏳ A fazer |
| HTTPS funcionando          | ⏳ A fazer |
| Manifest.json acessível    | ⏳ A fazer |
| Service Worker funcionando | ⏳ A fazer |

---

## 🧪 Teste Após Deploy

### 1. Acessar a URL

```
https://lexicard-web-xxx.ondigitalocean.app
```

### 2. Validar PWA

```
Chrome DevTools → Application → Manifest
Deve aparecer metadados completos ✅
```

### 3. Testar Offline

```
DevTools → Network → Offline
F5 para refresh
Página deve carregar do cache ✅
```

### 4. Instalar App

```
Desktop: Ícone na address bar → Install
Mobile: Menu → Install app
Deve aparecer no app launcher ✅
```

---

## 🔄 Deploy Contínuo

Agora, toda vez que fizer push:

```bash
git add .
git commit -m "feat: melhorias"
git push origin main
```

OceanDigital automaticamente:

1. Detecta push
2. Faz build
3. Deploy
4. Reinicia app
5. Health check

**Sem fazer nada manualmente!** 🚀

---

## 💰 Custo Estimado

| Serviço              | Preço       |
| -------------------- | ----------- |
| App Platform (Basic) | $6/mês      |
| Supabase (Free tier) | $0/mês      |
| Domínio (opcional)   | $10-15/ano  |
| **Total**            | **~$6/mês** |

---

## 🆘 Troubleshooting

### Build falha

```
App Platform → Logs
Ver mensagem de erro exata
Geralmente: variável de ambiente faltando
```

### App não inicia

```
Verificar health check path: /manifest.json
Se retornar 404, há erro no Dockerfile
```

### Domínio não funciona

```
Verificar DNS: pode levar até 24h
App Platform mostra status em "Domains"
```

---

## 📚 Próximas Melhorias (Após Deploy)

### 1. **Analytics & Monitoring**

- Sentry para erros
- Plausible/Fathom para tracking
- UpTimeRobot para alertas

### 2. **Performance**

- Lighthouse audit
- Image optimization
- Code splitting

### 3. **Features**

- Dark mode
- Offline sync (background)
- Notificações push
- Lembretes de estudo

### 4. **Content**

- Mais palavras no banco
- Categorias de vocabulário
- Gamification (XP, badges)
- Leaderboard

### 5. **Multi-idioma**

- Português / English
- Outros idiomas
- i18n setup

---

## 🎓 O que Mostrar ao Recrutador

**Quando disser "Deploy no OceanDigital":**

✅ **Links:**

- Produção: https://lexicard-app.ondigitalocean.app
- GitHub: https://github.com/seu-usuario/lexicard
- Demo: PWA funciona offline, instala como app

✅ **Frase resumida:**

> "App PWA em React Native/Expo com Supabase multi-tenant, deploy automático com Docker no OceanDigital App Platform, autenticação real, feedback & scoring funcional, offline-first com service worker."

✅ **Pontos a destacar:**

- ✅ Full-stack completo
- ✅ Produção real (não localhost)
- ✅ Database relacional com autenticação
- ✅ PWA / Offline support
- ✅ DevOps (Docker, deploy automático)
- ✅ Multi-tenant (organization isolation)

---

## 🚀 Próximo Passo

**Quando avisado:**

1. Fazer push no GitHub
2. Ir para OceanDigital e criar App
3. Deixar fazer deploy automático (15 min)
4. Testar: app funciona online e offline ✅

**Tempo total:** ~30 min (maioria é OceanDigital processando) ⏱️
