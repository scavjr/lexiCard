# 📋 Tarefas do Projeto LexiCard PWA

## Status das Tarefas

- ⬜ **Não iniciado**
- 🟡 **Em progresso**
- ✅ **Concluído**

---

## 🔧 Fase 0: Infraestrutura & Setup

### ✅ Task 0.1: Configurar Supabase para o LexiCard

**Descrição:** Criar novo projeto Supabase e banco de dados para o lexicard.

**Subtarefas:**

- [x] Criar novo projeto Supabase para lexicard
- [x] Obter credenciais do projeto (URL, anon key, project ref)
- [x] Atualizar arquivo `mcp.json` com as novas credenciais
- [x] Criar arquivo `.env.local` com variáveis de ambiente
- [x] Testar conexão com Supabase

**Requisitos:** Token de acesso Supabase válido
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 0.2: Criar schema do banco de dados (Multi-Tenant)

**Descrição:** Implementar as tabelas e políticas de segurança no PostgreSQL com suporte a multi-tenant.

**Subtarefas:**

- [x] Criar tabela `organizations` (id, name, plan_type, created_at)
- [x] Criar tabela `users` (id, email, organization_id, role, created_at) - FK para organizations
- [x] Criar tabela `words` (id, word, translation, definition, audio_url, organization_id, created_by, created_at) - FK para organizations
- [x] Criar tabela `user_progress` (id, user_id, word_id, organization_id, acertos, data_ultimo_acerto) - FKs para users/words/organizations
- [x] Criar tabela `flashcard_sessions` (id, user_id, organization_id, data_sessao, total_aprendidas) - FKs para users/organizations
- [x] Implementar RLS (Row Level Security) por organização:
  - Usuários só veem dados da sua organização
  - Usuários só veem suas próprias progressões
  - Admins da org veem todos os dados da org
- [x] Criar políticas de isolamento de dados entre tenants
- [x] Adicionar índices para otimização (organization_id, user_id, word_id)
- [x] Executar migrations no Supabase

**Requisitos:** Task 0.1 concluída
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO
**Nota Multi-Tenant:** Todas as tabelas devem ter `organization_id` para isolamento de dados

---

## 📦 Fase 1: Setup & Estrutura Base

### ✅ Task 1.1: Inicializar projeto Expo com TypeScript e NativeWind

**Descrição:** Configurar estrutura base do projeto com dependências necessárias.

**Subtarefas:**

- [x] Verificar se projeto Expo já existe (existente em workspace)
- [x] Instalar dependências: TypeScript, NativeWind, TailwindCSS
- [x] Configurar `tsconfig.json` com tipagem estrita
- [x] Configurar `tailwind.config.js` com cores customizadas (paleta LexiCard)
- [x] Criar estrutura de pastas (`/src/components`, `/src/services`, `/src/hooks`, `/src/store`, `/src/types`)
- [x] Configurar `app.json` para PWA (ícones, manifest, nome)

**Requisitos:** Projeto Node.js com npm/yarn
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ⬜ Task 1.2: Configurar Supabase Client e tipos TypeScript (Multi-Tenant)

**Descrição:** Criar cliente Supabase com tipagem automática das tabelas e suporte a multi-tenant.

**Subtarefas:**

- [ ] Instalar `@supabase/supabase-js`
- [ ] Criar arquivo `src/services/supabase.ts` com inicialização do cliente
- [ ] Gerar tipos TypeScript do banco com `supabase gen types typescript`
- [ ] Criar arquivo `src/types/database.ts` com tipos das tabelas
- [ ] Criar arquivo `src/types/models.ts` com interfaces do negócio
- [ ] Criar hook `useOrganization.ts` para gerenciar contexto da organização
- [ ] Implementar validação de acesso (verificar se usuário pertence à org)
- [ ] Criar helper para filtrar queries por `organization_id`
- [ ] Testar conexão com Supabase
- [ ] Testar isolamento de dados entre organizações

**Requisitos:** Task 0.1 e 1.1 concluídas
**Prioridade:** 🔴 CRÍTICA
**Nota Multi-Tenant:** Sempre filtrar por `organization_id` nas queries

---

### ⬜ Task 1.3: Criar sistema de cache híbrido (Local/Cloud/API) com Multi-Tenant

**Descrição:** Implementar helper de fetch com estratégia de cache respeitando isolamento de dados.

**Subtarefas:**

- [ ] Instalar `@react-native-async-storage/async-storage`
- [ ] Criar hook `useLocalStorage.ts` para AsyncStorage com namespace por `organization_id`
- [ ] Criar service `wordService.ts` com lógica de cache:
  - Primeiro: verificar AsyncStorage (apenas dados da org atual)
  - Segundo: verificar Supabase (filtrado por organization_id)
  - Terceiro: consultar dictionaryapi.dev
  - Quarto: salvar em Supabase (associado à org) + AsyncStorage (com org_id)
- [ ] Criar interface `IWord` com `organization_id`
- [ ] Implementar função `getOrganizationWords()` que filtra por org
- [ ] Adicionar tratamento de erros e offline-first
- [ ] Validar que usuário pertence à organização antes de acessar dados
- [ ] Testar fluxo completo de cache com múltiplas orgs

**Requisitos:** Task 1.2 concluída
**Prioridade:** 🔴 CRÍTICA
**Nota Multi-Tenant:** Cache local deve ser separado por organization_id

---

## 🎨 Fase 2: Componentes Core

### ⬜ Task 2.1: Criar componente Flashcard com animação de flip

**Descrição:** Implementar componente visual do flashcard com interações.

**Subtarefas:**

- [ ] Criar componente `FlashCard.tsx` (PascalCase)
- [ ] Implementar props TypeScript (word, onFeedback)
- [ ] Adicionar animação de flip com React Native Reanimated (ou CSS)
- [ ] Estilizar com NativeWind (cores da paleta, rounded-xl, sombras)
- [ ] Implementar frente do card:
  - Palavra em Inglês (destaque)
  - Ícone de áudio
  - Ícone de exemplo
  - Ícone de tradução
  - Clique central para flip
- [ ] Implementar verso do card:
  - Tradução em Português
  - Botões de feedback (Acerto/Erro)
- [ ] Testar interações e animações

**Requisitos:** Task 1.1 concluída
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 2.2: Implementar player de áudio para pronúncia

**Descrição:** Criar player de áudio para reproduzir a pronúncia da palavra.

**Subtarefas:**

- [ ] Instalar `expo-av` para áudio
- [ ] Criar componente `AudioButton.tsx` reutilizável
- [ ] Implementar lógica para carregar áudio via URL
- [ ] Adicionar ícone de speaker e feedback visual (loading, playing)
- [ ] Testar reprodução com palavras reais da API
- [ ] Adicionar fallback para quando não tiver conexão
- [ ] Testar em múltiplos dispositivos/navegadores

**Requisitos:** Task 2.1 concluída
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 2.3: Criar lógica de feedback e atualização de score

**Descrição:** Implementar sistema de pontuação e progresso do usuário.

**Subtarefas:**

- [ ] Criar hook `useFlashcardProgress.ts` para gerenciar estado
- [ ] Implementar função de registrar acerto/erro no Supabase
- [ ] Criar regra de "3 acertos = Mastered"
- [ ] Atualizar tabela `user_progress` após cada feedback
- [ ] Calcular nível CEFR baseado em total de palavras aprendidas
- [ ] Criar notificação visual de feedback (toast/snackbar)
- [ ] Testar fluxo completo de pontuação

**Requisitos:** Task 1.2 e 2.1 concluídas
**Prioridade:** 🟠 ALTA

---

## 📊 Fase 3: Dashboard & PWA

### ⬜ Task 3.1: Criar tela de estatísticas com progresso CEFR

**Descrição:** Implementar dashboard de progresso do usuário.

**Subtarefas:**

- [ ] Criar tela `DashboardScreen.tsx`
- [ ] Implementar widget de "Palavras aprendidas hoje"
- [ ] Implementar widget de "Palavras aprendidas esta semana"
- [ ] Criar gráfico de nível CEFR (A1 até C2)
- [ ] Adicionar histórico de sessões
- [ ] Estilizar com paleta de cores do projeto
- [ ] Implementar refresh de dados
- [ ] Testar com dados reais do Supabase

**Requisitos:** Task 2.3 concluída
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 3.2: Configurar app.json para PWA

**Descrição:** Preparar aplicação para modo Web Progressive App.

**Subtarefas:**

- [ ] Atualizar `app.json` com nome, descrição, ícones
- [ ] Criar ícones para PWA (192x192, 512x512)
- [ ] Configurar `web/favicon.ico`
- [ ] Criar arquivo `web/manifest.json` com metadados
- [ ] Testar modo offline com Service Worker
- [ ] Testar instalação como aplicativo web
- [ ] Validar PWA com Lighthouse
- [ ] Deploy e teste em dispositivos reais

**Requisitos:** Task 3.1 concluída
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 3.3: Implementar autenticação com Supabase Auth (Multi-Tenant)

**Descrição:** Adicionar sistema de login/signup do usuário com suporte a multi-tenant.

**Subtarefas:**

- [ ] Instalar `@supabase/auth-js`
- [ ] Criar tela de Login (email + senha)
- [ ] Criar tela de Sign Up (email + senha + confirmação + seleção de organização)
- [ ] Implementar verificação de email
- [ ] Criar contexto de autenticação (AuthContext) com organização
- [ ] Criar função `getUserOrganization()` ao fazer login
- [ ] Implementar validação: usuário deve estar associado à organização
- [ ] Implementar persistência de sessão + organização
- [ ] Criar função para "mudar de organização" (se usuário tiver múltiplas)
- [ ] Testar fluxo completo de auth com múltiplas orgs
- [ ] Adicionar proteção de rotas por organização

**Requisitos:** Task 1.2 concluída
**Prioridade:** 🟠 ALTA
**Nota Multi-Tenant:** Sempre armazenar organização_id após login

---

## 🚀 Fase 4: Refinamento & Deploy

### ⬜ Task 4.1: Otimizar performance e offline-first

**Descrição:** Garantir que o app funcione bem offline e tenha bom desempenho.

**Subtarefas:**

- [ ] Implementar sincronização de dados quando internet retorna
- [ ] Otimizar queries do Supabase
- [ ] Adicionar lazy loading de componentes
- [ ] Implementar cache de imagens
- [ ] Testar modo offline completo
- [ ] Usar React.memo para evitar re-renders
- [ ] Implementar pagination de flashcards

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟡 MÉDIA

---

### ⬜ Task 4.2: Testes unitários e de integração

**Descrição:** Criar suite de testes automatizados.

**Subtarefas:**

- [ ] Instalar Jest + React Native Testing Library
- [ ] Criar testes para componentes principais
- [ ] Criar testes para services (cache, API)
- [ ] Criar testes de integração com Supabase
- [ ] Atingir 70%+ cobertura de código
- [ ] Configurar CI/CD com testes

**Requisitos:** Projeto base funcional
**Prioridade:** 🟡 MÉDIA

---

### ⬜ Task 4.3: Deploy e documentação

**Descrição:** Publicar aplicação e documentar código.

**Subtarefas:**

- [ ] Deploy no Vercel ou Netlify para PWA
- [ ] Deploy no Expo GO para mobile
- [ ] Criar documentação README completa
- [ ] Documentar APIs e componentes
- [ ] Criar guia de contribuição
- [ ] Verificar SEO e otimizações web
- [ ] Monitorar erros com Sentry (opcional)

**Requisitos:** Todas as fases anteriores concluídas
**Prioridade:** 🟡 MÉDIA

---

## 📌 Notas Importantes

- **Multi-Tenant:** Todas as queries devem filtrar por `organization_id`. RLS é obrigatório.
- **Isolamento de Dados:** Usuários só veem dados de sua organização.
- **Tipagem Estrita:** Proibido usar `any`. Sempre criar interfaces TypeScript.
- **Clean Code:** Nomes descritivos, funções pequenas, responsabilidade única.
- **Paleta de Cores:**
  - Primary: `#4F46E5` (Indigo)
  - Success: `#10B981` (Emerald)
  - Error: `#EF4444` (Red)
  - Background: `#F8FAFC` (Slate 50)
- **Stack:** Expo + TypeScript + NativeWind + Supabase (Multi-Tenant) + AsyncStorage
- **Zero Delírios:** Não usar bibliotecas incompatíveis com Expo/PWA
- **Profissionalismo:** Código para portfólio LinkedIn

---

## 🎯 Próximas Ações

1. ✅ Ler .ai_instructions.md e prd.md
2. ⏳ **Task 0.1:** Configurar Supabase para o LexiCard
3. ⏳ **Task 0.2:** Criar schema do banco de dados
4. ⏳ **Task 1.1:** Inicializar Expo com TypeScript e NativeWind
