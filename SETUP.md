# 📚 LexiCard - Aprenda Vocabulário com Flashcards

Um micro-SaaS de educação focado na memorização de vocabulário através de flashcards interativos. Com suporte **Offline-First**, você estuda mesmo sem internet e sincroniza com a nuvem quando conectado.

## 🚀 Stack Tecnológica

- **Framework:** Expo (React Native for Web) - PWA, Android, iOS
- **Linguagem:** TypeScript (Tipagem estrita)
- **Estilização:** NativeWind (Tailwind CSS para React Native)
- **Banco de Dados:** Supabase (PostgreSQL + Auth)
- **Persistência Local:** AsyncStorage
- **API Externa:** dictionaryapi.dev

## 📋 Estrutura do Projeto

```
lexicard/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── services/        # API e Supabase
│   ├── hooks/           # Lógica customizada
│   ├── store/           # Estado global e persistência
│   ├── types/           # Interfaces TypeScript
│   ├── screens/         # Telas principais
│   └── utils/           # Funções utilitárias
├── assets/              # Imagens, fontes, ícones
├── app.json             # Configuração Expo + PWA
├── tailwind.config.js   # Cores customizadas
├── tsconfig.json        # TypeScript config com path aliases
└── .env.local           # Variáveis de ambiente
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_REF=your-project-ref
EXPO_PUBLIC_DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en/
```

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar modo desenvolvimento
npm start

# Modo web
npm run web

# Verificar tipos TypeScript
npm run type-check
```

## 🎨 Paleta de Cores

- **Primary:** `#4F46E5` (Indigo)
- **Success:** `#10B981` (Emerald)
- **Error:** `#EF4444` (Red)
- **Background:** `#F8FAFC` (Slate 50)

## 📚 Funcionalidades Principais

### Flashcard

- Palavra em Inglês na frente
- Áudio de pronúncia (via URL)
- Exemplos e definições
- Tradução em Português no verso
- Feedback de acerto/erro

### Progresso

- Contagem de acertos (3 = Mastered)
- Nível CEFR (A1 até C2)
- Dashboard de estatísticas
- Histórico de sessões

### Offline-First

- Funciona sem internet
- Cache híbrido: Local → Cloud → API
- Sincronização automática

## 🔒 Segurança

- Row Level Security (RLS) no Supabase
- Isolamento de dados por organização (Multi-Tenant)
- Autenticação com Supabase Auth
- Tipagem estrita em TypeScript (sem `any`)

## 📝 Convenções de Código

- **Componentes:** PascalCase (`FlashCard.tsx`)
- **Variáveis:** camelCase (`wordData`, `isLoading`)
- **Funções:** camelCase (`fetchWords()`, `updateProgress()`)
- **Tipos:** PascalCase com `I` prefix (`IWord`, `IUser`)

## 🗓️ Roadmap

- ✅ **Fase 0:** Infraestrutura (Supabase, Database Schema)
- 🔄 **Fase 1:** Setup & Estrutura (Expo, TypeScript, NativeWind)
- ⏳ **Fase 2:** Componentes Core (Flashcard, Áudio, Feedback)
- ⏳ **Fase 3:** Dashboard & PWA (Estatísticas, Deploy)
- ⏳ **Fase 4:** Refinamento & Testes

## 📖 Referências

- [Expo Documentation](https://docs.expo.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Supabase](https://supabase.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📧 Autor

Desenvolvido por **scavjr** para portfólio LinkedIn.

---

**Desenvolvido com ❤️ usando Expo + TypeScript + NativeWind**
