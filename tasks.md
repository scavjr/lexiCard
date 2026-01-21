# 📋 Tarefas do Projeto LexiCard PWA

## Status das Tarefas

- ⬜ **Não iniciado**
- 🟡 **Em progresso**
- ✅ **Concluído**

---

## 🏗️ Decisões Arquiteturais

### Estratégia de Palavras Híbrida (DOCUMENTADA)

**Decisão:** Implementar com duas tabelas coordenadas para otimizar armazenamento e isolamento:

**Tabela 1: `words_global`** (Compartilhada entre todas as orgs)

```sql
- id: UUID (PK)
- word: TEXT (UNIQUE) -- "hello", "mundo", etc
- definition: TEXT -- Definição universal
- audio_url: TEXT -- Pronúncia
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
-- Sem organization_id (realmente global)
```

**Tabela 2: `words`** (Personalizações por organização)

```sql
- id: UUID (PK)
- word_global_id: UUID (FK para words_global) -- Vincula à palavra global
- organization_id: UUID (FK para organizations) -- Isolamento org
- translation: TEXT -- Tradução customizada pela org
- custom_definition: TEXT (nullable) -- Override da definição
- created_by: UUID (FK para users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
-- RLS: SELECT/INSERT/UPDATE/DELETE filtrado por organization_id
```

**Fluxo de Fetch:**

1. Usuário solicita palavra "apple"
2. Buscar em AsyncStorage local (org-specific namespace)
3. Se não encontrar, buscar em `words_global` + customizações em `words` WHERE organization_id
4. Se não encontrar, buscar em dictionaryapi.dev
5. Salvar base em `words_global` (UNIQUE, primeira org ganha) + customizações em `words`

**Benefícios:**

- ✅ Zero redundância: "hello" armazenado 1x globalmente
- ✅ Isolamento mantido: Orgs só veem suas customizações
- ✅ Performance: `words_global` não cresce por org, RLS rápido em `words`
- ✅ Flexibilidade: Cada org pode ter tradução diferente para a mesma palavra
- ✅ Segurança: organization_id filtro em `words`; anonymous read em `words_global`

**Status:** ✅ IMPLEMENTADO - Migração criada e wordService ajustado

---

### ✅ Task 1.4: Implementar abordagem híbrida de palavras

**Descrição:** Criar tabela `words_global`, ajustar `wordService.ts` e atualizar tipos.

**Subtarefas:**

- [x] Criar migração `words_global` em Supabase
  - Tabela: id, word (UNIQUE), definition, audio_url, timestamps
  - RLS policies: leitura pública, escrita autenticada
  - Índice em word para buscas rápidas
- [x] Modificar tabela `words` com FK para `words_global`
  - Adicionar coluna `word_global_id`
  - Migrar dados existentes
  - Criar índice em `word_global_id`
- [x] Criar triggers automáticos para `updated_at`
- [x] Regenerar tipos Supabase (`database.ts`)
  - Incluir tipos para `words_global`
  - Adicionar FK `word_global_id` em `words`
- [x] Ajustar `wordService.ts` para estratégia híbrida
  - `getFromSupabase()`: UNION de `words_global` + `words` por org
  - `saveWord()`: Inserir base em global, customizações em org
  - Suporte a fallback para dados legados
- [x] Validar compilação TypeScript

**Resultado:** Zero redundância (palavras globais 1x) + isolamento mantido (org-specific customizações)

**Status:** ✅ CONCLUÍDO

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

### ✅ Task 1.2: Configurar Supabase Client e tipos TypeScript (Multi-Tenant)

**Descrição:** Criar cliente Supabase com tipagem automática das tabelas e suporte a multi-tenant.

**Subtarefas:**

- [x] Instalar `@supabase/supabase-js`
- [x] Criar arquivo `src/services/supabase.ts` com inicialização do cliente
- [x] Gerar tipos TypeScript do banco com `supabase gen types typescript`
- [x] Criar arquivo `src/types/database.ts` com tipos das tabelas
- [x] Criar arquivo `src/types/models.ts` com interfaces do negócio (em index.ts)
- [x] Criar hook `useOrganization.ts` para gerenciar contexto da organização
- [x] Implementar validação de acesso (verificar se usuário pertence à org)
- [x] Criar helper para filtrar queries por `organization_id` (em src/utils/validation.ts)
- [x] Testar conexão com Supabase
- [x] Testar isolamento de dados entre organizações

**Requisitos:** Task 0.1 e 1.1 concluídas
**Prioridade:** 🔴 CRÍTICA
**Nota Multi-Tenant:** Sempre filtrar por `organization_id` nas queries
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 1.3: Criar sistema de cache híbrido (Local/Cloud/API) com Multi-Tenant

**Descrição:** Implementar helper de fetch com estratégia de cache respeitando isolamento de dados usando abordagem **híbrida de palavras**.

**Estratégia Híbrida (Implementada):**

- Usa `words_global` (compartilhada) + `words` (customizadas por org)
- Evita redundância enquanto mantém isolamento
- Primeira org cria palavra global, outras reutilizam

**Subtarefas:**

- [x] Instalar `@react-native-async-storage/async-storage`
- [x] Criar hook `useLocalStorage.ts` para AsyncStorage com namespace por `organization_id`
- [x] Criar service `wordService.ts` com lógica de cache:
  - Primeiro: verificar AsyncStorage (apenas dados da org atual)
  - Segundo: verificar Supabase (`words_global` + `words` da org)
  - Terceiro: consultar dictionaryapi.dev
  - Quarto: salvar em `words_global` (1x) + `words` (customizações org)
- [x] Criar interface `IWord` com `organization_id`
- [x] Implementar função `getOrganizationWords()` que filtra por org
- [x] Adicionar tratamento de erros e offline-first
- [x] Validar que usuário pertence à organização antes de acessar dados
- [x] Testar fluxo completo de cache com múltiplas orgs

**Requisitos:** Task 1.2 concluída
**Prioridade:** 🔴 CRÍTICA
**Nota Multi-Tenant:** Cache local separado por organization_id. Palavras globais compartilhadas, customizações isoladas.
**Status:** ✅ CONCLUÍDO (com abordagem híbrida)

---

## 🎨 Fase 2: Componentes Core

### ✅ Task 2.1: Criar componente FlashCard com animação de flip

**Descrição:** Implementar componente visual do flashcard com animação 3D suave.

**Subtarefas:**

- [x] Criar componente `FlashCard.tsx` com interface FlashCardProps typada
- [x] Implementar animação de flip (300ms com React Native Animated API)
- [x] Estilizar frente (Indigo #4F46E5):
  - Palavra em tamanho 48px bold
  - 3 ícones interativos (áudio, exemplo, tradução)
  - Hint "Toque para virar"
- [x] Estilizar verso (Emerald #10B981):
  - Tradução em tamanho 40px
  - Definição em itálico (14px)
  - Botões de feedback lado a lado (Acertei, Errei)
- [x] Aplicar design system (gradientes, sombras, border-radius-24, transições 300ms)
- [x] Acessibilidade completa (screen readers, roles, labels)
- [x] Responsividade (max 400px, adapta-se a tela)
- [x] Instalar `expo-linear-gradient`
- [x] Criar exemplo de uso `FlashCard.demo.tsx`
- [x] Validar TypeScript sem erros
- [x] Documentar em `TASK_2_1_COMPLETE.md`

**Resultado:** Componente totalmente funcional com animação flip, design polido, acessibilidade WCAG AA

**Requisitos:** Task 1.4 concluída
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 2.2: Implementar player de áudio para pronúncia

**Descrição:** Criar player de áudio para reproduzir a pronúncia da palavra.

**Subtarefas:**

- [x] Instalar `expo-av` para áudio
- [x] Criar componente `AudioButton.tsx` reutilizável
- [x] Implementar lógica para carregar áudio via URL
- [x] Adicionar ícone de speaker e feedback visual (loading, playing)
- [x] Testar reprodução com palavras reais da API
- [x] Adicionar fallback para quando não tiver conexão
- [x] Testar em múltiplos dispositivos/navegadores
- [x] Exibir definição no card azul (clique em 📖)
- [x] Reduzir tamanho da fonte para definição caber no card
- [x] Criar ícone 📝 para mostrar exemplo de frase

**Resultado:** AudioButton com NativeWind + Definição + Exemplo, todos com feedback visual de estado ativo.

**Requisitos:** Task 2.1 concluída
**Prioridade:** 🟢 COMPLETA

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

## 🚀 Fase 4: Deployment & DevOps (OceanDigital)

### ⬜ Task 4.1: Configurar Docker e docker-compose para OceanDigital

**Descrição:** Criar containers para frontend (PWA) e backend (opcional).

**Subtarefas:**

- [ ] Criar `Dockerfile` para build da aplicação Expo Web
- [ ] Configurar multi-stage build (builder → runner)
- [ ] Criar `docker-compose.yml` com:
  - Serviço Web (Nginx + app Expo)
  - Volume para logs
  - Network para comunicação interna
- [ ] Configurar variáveis de ambiente (.env.production)
- [ ] Testar build localmente
- [ ] Documentar passos de build

**Requisitos:** Task 3.2 concluída
**Prioridade:** 🔴 CRÍTICA

---

### ⬜ Task 4.2: Setup GitHub Actions CI/CD para OceanDigital

**Descrição:** Automatizar build e deploy na máquina OceanDigital via SSH.

**Subtarefas:**

- [ ] Criar GitHub Actions workflow (`.github/workflows/deploy.yml`)
- [ ] Configurar secrets: SSH_PRIVATE_KEY, OCEAN_HOST, OCEAN_USER
- [ ] Workflow steps:
  - Checkout código
  - Build Docker image
  - SSH para OceanDigital
  - Pull latest code
  - Docker build & push (Docker Registry)
  - Docker-compose up -d (restart containers)
  - Health check (curl localhost)
- [ ] Configurar trigger: push em main branch
- [ ] Testar pipeline com fake SSH
- [ ] Documentar variáveis de ambiente necessárias

**Requisitos:** Task 4.1 concluída
**Prioridade:** 🔴 CRÍTICA

---

### ⬜ Task 4.3: Configurar Nginx, SSL e service worker no OceanDigital

**Descrição:** Setup completo de servidor web com HTTPS e PWA.

**Subtarefas:**

- [ ] Instalar Nginx na droplet OceanDigital
- [ ] Criar nginx.conf com:
  - Reverse proxy para localhost:3000
  - Gzip compression (assets)
  - Cache headers (1 year para /assets)
  - Security headers (CSP, X-Frame-Options)
  - Redirect HTTP → HTTPS
- [ ] Instalar Let's Encrypt (Certbot)
- [ ] Configurar auto-renewal de certificados (cron)
- [ ] Criar service worker (`web/service-worker.js`)
  - Cachear assets estáticos
  - Cachear requests de API com timeout
  - Offline fallback page
- [ ] Testar PWA offline no OceanDigital
- [ ] Monitorar uptime (status page)

**Requisitos:** Task 4.2 concluída
**Prioridade:** 🔴 CRÍTICA

---

### ⬜ Task 4.4: Performance e Core Web Vitals

**Descrição:** Otimizar métricas de performance para MVP.

**Subtarefas:**

- [ ] Analisar bundle size com `expo-optimize`
- [ ] Code splitting por rota
- [ ] Lazy load de componentes pesados
- [ ] Otimizar imagens (WebP + srcset)
- [ ] Minificar e tree-shake código
- [ ] Usar React.lazy + Suspense
- [ ] Implementar virtual scrolling para listas
- [ ] Testar com Lighthouse (target: 90+ em Performance)
- [ ] Implementar Sentry para monitorar erros em produção
- [ ] Criar monitoring dashboard (uptime, erros, performance)

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟠 ALTA

---

## 🎯 Fase 5: Refinamento & Launch

### ⬜ Task 5.1: Otimizar offline-first e sincronização

**Descrição:** Garantir que o app funcione completamente offline com sync automático.

**Subtarefas:**

- [ ] Implementar fila de mutações locais (mutation queue)
- [ ] Detectar reconexão com internet (navigator.onLine)
- [ ] Sincronizar automaticamente ao reconectar
- [ ] Implementar conflito resolution (Last-Write-Wins)
- [ ] Testar fluxo: offline → criar palavra → online → sincroniza
- [ ] Testar fluxo: offline → registrar acerto → online → atualiza user_progress
- [ ] Criar visual de "sincronizando..." para usuário
- [ ] Testar com múltiplas abas abertas

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 5.2: Testes e refinement de UX/UI

**Descrição:** Polir interface e criar suite de testes automatizados.

**Subtarefas:**

- [ ] Instalar Vitest para testes unitários
- [ ] Criar testes para wordService
- [ ] Criar testes para hooks (useOrganization, useLocalStorage)
- [ ] Criar testes E2E com Playwright
- [ ] Atingir 70%+ cobertura de código
- [ ] User testing com 5-10 pessoas
- [ ] Coletar feedback e refinar UX
- [ ] Validar acessibilidade (WCAG 2.1 AA)
- [ ] Configurar CI/CD para rodar testes no GitHub Actions

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 5.3: Launch em produção no OceanDigital

**Descrição:** Deploy final e monitoramento.

**Subtarefas:**

- [ ] Criar documentação README completa (features, deploy, troubleshooting)
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de contribuição (CONTRIBUTING.md)
- [ ] Setup analytics (Mixpanel ou Plausible)
- [ ] Setup monitoring (Sentry para erros)
- [ ] Criar landing page (opcional)
- [ ] Deploy em produção via GitHub Actions
- [ ] Testar em múltiplos navegadores e dispositivos
- [ ] Monitorar logs em tempo real
- [ ] Criar runbook para emergências (como rollback)

**Requisitos:** Todas as fases anteriores concluídas
**Prioridade:** 🔴 CRÍTICA

---

## 🚀 Fase 5: Refinamento & Deploy

### ⬜ Task 5.1: Otimizar offline-first e sincronização

**Descrição:** Garantir que o app funcione completamente offline com sync automático.

**Subtarefas:**

- [ ] Implementar fila de mutações locais (mutation queue)
- [ ] Detectar reconexão com internet (navigator.onLine)
- [ ] Sincronizar automaticamente ao reconectar
- [ ] Implementar conflito resolution (Last-Write-Wins)
- [ ] Testar fluxo: offline → criar palavra → online → sincroniza
- [ ] Testar fluxo: offline → registrar acerto → online → atualiza user_progress
- [ ] Criar visual de "sincronizando..." para usuário
- [ ] Testar com múltiplas abas abertas

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 5.2: Testes e refinement de UX/UI

**Descrição:** Polir interface e criar suite de testes automatizados.

**Subtarefas:**

- [ ] Instalar Vitest para testes unitários
- [ ] Criar testes para wordService
- [ ] Criar testes para hooks (useOrganization, useLocalStorage)
- [ ] Criar testes E2E com Playwright
- [ ] Atingir 70%+ cobertura de código
- [ ] User testing com 5-10 pessoas
- [ ] Coletar feedback e refinar UX
- [ ] Validar acessibilidade (WCAG 2.1 AA)
- [ ] Configurar CI/CD para rodar testes no GitHub Actions

**Requisitos:** Tasks anteriores concluídas
**Prioridade:** 🟠 ALTA

---

### ⬜ Task 5.3: Launch em produção no OceanDigital

**Descrição:** Deploy final e monitoramento.

**Subtarefas:**

- [ ] Criar documentação README completa (features, deploy, troubleshooting)
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de contribuição (CONTRIBUTING.md)
- [ ] Setup analytics (Mixpanel ou Plausible)
- [ ] Setup monitoring (Sentry para erros)
- [ ] Criar landing page (opcional)
- [ ] Deploy em produção via GitHub Actions
- [ ] Testar em múltiplos navegadores e dispositivos
- [ ] Monitorar logs em tempo real
- [ ] Criar runbook para emergências (como rollback)

**Requisitos:** Todas as fases anteriores concluídas
**Prioridade:** 🔴 CRÍTICA

---

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

### 🏗️ Decisão Arquitetural: Estratégia de Palavras Híbrida

**Escolhido: ABORDAGEM HÍBRIDA**

O sistema usa **duas tabelas de palavras**:

1. **`words_global`** (SEM organization_id)
   - Compartilhada entre TODAS as organizações
   - Criada pela primeira org que pesquisa uma palavra
   - Reutilizada por outras orgs (mais eficiente)
   - Dados primários: palavra, definição, áudio_url

2. **`words`** (COM organization_id)
   - Palavras customizadas por organização
   - Traduções personalizadas por org
   - Notas e exemplos adicionais
   - FK para `words_global.id`

**Fluxo de Busca:**

```
fetchWord("hello") → Procura em:
  1. Local cache (AsyncStorage)
  2. words_global + words customizadas da org
  3. API externa (se não encontrar)
  4. Salva em words_global (1x) + words_org (customizações)
```

**Benefícios:**

- ✅ Sem redundância de palavras globais
- ✅ Isolamento de dados por org
- ✅ Customizações por organização (tradução diferente)
- ✅ Performance otimizada
- ✅ Compatível com RLS e segurança

---

### 🚀 Deployment: OceanDigital

**Plataforma:** OceanDigital Droplet (máquina dedicada)
**Stack DevOps:**

- **Containerização:** Docker + docker-compose
- **Web Server:** Nginx (reverse proxy + SSL/TLS)
- **SSL:** Let's Encrypt com auto-renewal (Certbot)
- **CI/CD:** GitHub Actions (push main → build → SSH deploy → docker-compose up)
- **Monitoring:** Sentry (erros), Mixpanel (analytics), status page
- **Backups:** Snapshots automáticos OceanDigital (configurar)

**Fluxo de Deploy:**

```
1. Git push para main branch
2. GitHub Actions dispara workflow
3. Build Docker image
4. SSH para OceanDigital
5. Pull código, docker build, docker-compose up -d
6. Nginx redireciona HTTP → HTTPS
7. Health check automático
```

---

- **Multi-Tenant:** Todas as queries devem filtrar por `organization_id`. RLS é obrigatório.
- **Isolamento de Dados:** Usuários só veem dados de sua organização.
- **Tipagem Estrita:** Proibido usar `any`. Sempre criar interfaces TypeScript.
- **Clean Code:** Nomes descritivos, funções pequenas, responsabilidade única.
- **Paleta de Cores:**
  - Primary: `#4F46E5` (Indigo)
  - Success: `#10B981` (Emerald)
  - Error: `#EF4444` (Red)
  - Background: `#F8FAFC` (Slate 50)
- **Stack:** Expo + TypeScript + NativeWind + Supabase (Multi-Tenant Híbrido) + AsyncStorage + Docker + Nginx + OceanDigital
- **Zero Delírios:** Não usar bibliotecas incompatíveis com Expo/PWA
- **Profissionalismo:** Código para portfólio LinkedIn
- **Performance:** Target < 250KB bundle (gzipped), Lighthouse > 90 em Performance

---

## 🎯 Próximas Ações

1. ✅ Ler .ai_instructions.md e prd.md
2. ⏳ **Task 0.1:** Configurar Supabase para o LexiCard
3. ⏳ **Task 0.2:** Criar schema do banco de dados
4. ⏳ **Task 1.1:** Inicializar Expo com TypeScript e NativeWind
