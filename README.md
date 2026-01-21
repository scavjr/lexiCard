# 📚 LexiCard - Aprenda Vocabulário em Inglês

> **PWA moderna para aprendizado de vocabulário com flashcards, progresso CEFR, e suporte offline.**

[![Live Demo](https://img.shields.io/badge/Demo-Ao%20Vivo-blue?style=for-the-badge)](https://lexicard-web-xxx.ondigitalocean.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/seu-usuario/lexicard)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## ✨ Features Principais

### 🎓 **Aprendizado**

- ✅ Flashcards interativas com 3D flip animation
- ✅ Pronúncia de áudio integrada (dicionário API)
- ✅ Definições e exemplos de uso
- ✅ Feedback imediato (acertou/errou)

### 📊 **Progresso & Analytics**

- ✅ Dashboard com estatísticas de progresso
- ✅ Nível CEFR (A1 até C2) calculado automaticamente
- ✅ "3 acertos = Dominado" rule
- ✅ Histórico de sessões
- ✅ Taxa de acertos em tempo real

### 🔐 **Multi-Tenant & Autenticação**

- ✅ Login com email + senha (Supabase Auth)
- ✅ Signup com seleção de organização
- ✅ Persistência de sessão automática
- ✅ Logout com limpeza de dados locais

### 📱 **PWA & Offline**

- ✅ Funciona completamente offline
- ✅ Service Worker com cache strategies
- ✅ Instalação como app nativo (Android/iOS/Web)
- ✅ Sincronização automática quando online

### 🎨 **Design & UX**

- ✅ Interface moderna com Tailwind CSS
- ✅ Paleta de cores Indigo/Gradientes
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Toast notifications para feedback

---

## 🏗️ Stack Técnico

| Categoria    | Tecnologia                         |
| ------------ | ---------------------------------- |
| **Frontend** | React Native (Expo) + TypeScript   |
| **Styling**  | Tailwind CSS                       |
| **Database** | Supabase PostgreSQL                |
| **Auth**     | Supabase Auth (email/password)     |
| **Backend**  | Edge Functions (Supabase)          |
| **Storage**  | AsyncStorage (persistência local)  |
| **DevOps**   | Docker + OceanDigital App Platform |
| **PWA**      | Service Worker + Web App Manifest  |

---

## 🚀 Getting Started

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
Git
```

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/lexicard.git
cd lexicard

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves Supabase

# 4. Inicie servidor de desenvolvimento
npm start

# 5. Abra no navegador
http://localhost:8081
```

### Testes Locais

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Gerar ícones PWA
npm run generate-icons

# Build com docker-compose
docker-compose up -d
```

---

## 📖 Documentação Importante

- **[OCEAN_DIGITAL_DEPLOY.md](OCEAN_DIGITAL_DEPLOY.md)** - Deploy em produção (15 min)
- **[PWA_TESTING_GUIDE.md](PWA_TESTING_GUIDE.md)** - Testes completos da PWA
- **[QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md)** - Testes rápidos (5 min)
- **[DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)** - Docker local
- **[SETUP.md](SETUP.md)** - Setup inicial do projeto

---

## 📊 Arquitetura

### Database Schema (Supabase)

```
auth.users (Supabase Auth)
├── id (UUID)
├── email
└── password (hashed)

organizations
├── id (UUID)
├── name
├── created_at
└── updated_at

user_organizations (N:N relationship)
├── user_id (FK → auth.users)
├── organization_id (FK → organizations)
└── created_at

user_progress
├── id (UUID)
├── user_id (FK → auth.users)
├── word_id (FK → words_global)
├── organization_id (FK → organizations)
├── acertos (0-3: corretos)
├── erros (total incorretos)
└── created_at

words_global
├── id (UUID)
├── word
├── definition
├── example
├── pronunciation_url
├── cefr_level (A1-C2)
└── created_at

flashcard_sessions
├── id (UUID)
├── user_id (FK → auth.users)
├── organization_id (FK → organizations)
├── words_studied (array)
├── total_correct (int)
├── duration_seconds (int)
└── created_at
```

### Componentes React

```
App.tsx
├── AuthProvider
├── App Content
│   ├── Loading spinner
│   ├── LoginScreen
│   ├── SignUpScreen
│   └── AppNavigator
│       ├── FlashCard.demo (Learn)
│       ├── DashboardScreen (Progress)
│       └── Logout

Components:
├── FlashCard.tsx (3D flip animation)
├── Toast.tsx (notifications)
└── [Other UI components]

Hooks:
├── useAuth (AuthContext)
├── useFlashcardProgress (scoring)
├── useLocalStorage
└── useOrganization

Services:
├── supabase.ts (client setup)
├── wordService.ts (API integration)
└── [Business logic]
```

---

## 🔒 Segurança

- ✅ Senhas hashed com Supabase Auth
- ✅ RLS (Row Level Security) - desabilitado para MVP
- ✅ Environment variables para secrets
- ✅ HTTPS automático (OceanDigital)
- ✅ Headers de segurança (Nginx)

**Nota:** RLS será habilitado em produção após testes completos.

---

## 📈 Progresso CEFR

Níveis calculados automaticamente:

| CEFR | Palavras Aprendidas | Descrição              |
| ---- | ------------------- | ---------------------- |
| A1   | 0-50                | Iniciante              |
| A2   | 50-250              | Elementar              |
| B1   | 250-1000            | Intermediário          |
| B2   | 1000-3000           | Intermediário-avançado |
| C1   | 3000-8000           | Avançado               |
| C2   | 8000+               | Proficiente            |

---

## 🎯 Roadmap

### ✅ **MVP (Concluído)**

- Flashcards com áudio
- Feedback & scoring
- Dashboard com CEFR
- Autenticação multi-tenant
- PWA & offline support

### 🔄 **Phase 2 (Planejado)**

- [ ] Dark mode
- [ ] Categorias de palavras
- [ ] Lembretes push
- [ ] Sincronização offline ↔ online
- [ ] Leaderboard/Gamification

### 🚀 **Phase 3 (Futuro)**

- [ ] Mobile app nativo (React Native)
- [ ] Sugestões baseadas em IA
- [ ] Planos de estudo personalizados
- [ ] Premium features
- [ ] Multi-idioma

---

## 🤝 Como Contribuir

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ como MVP full-stack.

**Stack:** React Native + Expo + Supabase + Docker + OceanDigital

---

## 🙏 Agradecimentos

- [Expo](https://expo.dev) - React Native framework
- [Supabase](https://supabase.com) - Backend & Database
- [Dictionary API](https://dictionaryapi.dev) - Pronunciação e definições
- [TailwindCSS](https://tailwindcss.com) - Styling
- [OceanDigital](https://www.digitalocean.com) - Hosting

---

## 📞 Contato

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu-email@example.com
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)

---

**Desenvolvido com entusiasmo para demonstrar full-stack development skills.** 🚀
