# 🚀 Getting Started - LexiCard

## ⚡ Quick Start (5 min)

### 1. Clone & Install

```bash
git clone https://github.com/seu-usuario/lexicard.git
cd lexicard
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves Supabase
```

**Chaves necessárias:**

```
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_KEY=seu-anon-key-aqui
```

### 3. Start Development Server

```bash
npm start
```

Abre em: `http://localhost:8081`

### 4. Test App

```
1. Signup com email/senha
2. Escolha organização
3. Clique em flashcard
4. Clique pronúncia (áudio)
5. Clique "Acertei" ou "Errei"
6. Veja progresso no Dashboard
```

### 5. Testar Offline (Opcional)

```
F12 → Network → Offline → F5
App carrega do cache ✅
```

---

## 🐳 Docker (Opcional)

### Build Localmente

```bash
docker build -t lexicard:latest .
docker-compose up -d
```

Acessa em: `http://localhost:3000`

---

## 📚 Documentação

- **[README.md](README.md)** - Visão geral completa
- **[RECRUITER_GUIDE.md](RECRUITER_GUIDE.md)** - Para impressionar 👔
- **[OCEAN_DIGITAL_DEPLOY.md](OCEAN_DIGITAL_DEPLOY.md)** - Deploy em produção
- **[PWA_TESTING_GUIDE.md](PWA_TESTING_GUIDE.md)** - Validar PWA

---

## 🧪 Commands

```bash
npm start          # Dev server
npm run type-check # TypeScript validation
npm run lint       # ESLint
npm run format     # Prettier
npm run generate-icons # Gerar ícones PNG
npm run web        # Expo web
```

---

## 🎯 Next Steps

1. **Para Desenvolvimento:**
   - Ler [SETUP.md](SETUP.md)
   - Ler [prd.md](prd.md)

2. **Para Deploy:**
   - Ler [OCEAN_DIGITAL_DEPLOY.md](OCEAN_DIGITAL_DEPLOY.md)
   - Fazer push no GitHub
   - Criar app no OceanDigital

3. **Para Apresentação:**
   - Ler [RECRUITER_GUIDE.md](RECRUITER_GUIDE.md)
   - Preparar demo de 3 min

---

**Tempo total setup:** ~5 minutos ⏱️

Dúvidas? Veja a documentação ou abra uma issue! 💡
