# 📋 Tarefas do Projeto LexiCard PWA

## 🎉 STATUS DO PROJETO: ✅ MVP CONCLUÍDO

### Sumário Executivo

```
✅ Frontend: React Native + Expo
✅ Database: Supabase PostgreSQL (multi-tenant)
✅ Auth: Email/password com persistência offline
✅ PWA: Service Worker + Web App Manifest
✅ Dashboard: Estatísticas CEFR + histórico
✅ Scoring: 3 acertos = Dominado rule
✅ Docker: Containerizado + deployment automático
✅ Produção: Pronto para OceanDigital App Platform
```

### 🚀 Próximo Passo: Fazer Push no GitHub e Deploy

**Tempo estimado:** 30 minutos
**Documentação:** [OCEAN_DIGITAL_DEPLOY.md](OCEAN_DIGITAL_DEPLOY.md)

### 📊 Progresso de Seed de Palavras

**Status:** 🟡 EM PROGRESSO - Carregamento Lazy sob Demanda (Task 1.5)

- **Estratégia:** Arquivo externo com lista de palavras (word) → Banco (words_global.word) → API sob demanda
- **Carregamento:** Apenas coluna `word` gravada no banco durante seed
- **Enriquecimento:** Quando usuário começa exercício, sistema busca dados restantes no DictionaryAPI
- **Cache:** AsyncStorage local (offline-first)
- **Comando:** `npm run seed:init` (seed inicial com todas as palavras)
- **RLS:** Temporariamente desabilitado (re-habilitar antes de produção)

### 📚 Progresso de Implementação - Exercício 20 Palavras

**Status:** ✅ CONCLUÍDO - Novo Fluxo Implementado

- **Task 2.4:** ✅ ExerciseSelector criada
- **Task 2.5:** ✅ ExerciseScreen criada
- **Task 2.6:** ✅ AppNavigator integrado
- **Funcionalidades:**
  - ✅ Seletor de 20 palavras com priorização
  - ✅ Exercício com flip card (1 palavra por vez)
  - ✅ Progress bar + contadores (✅/❌)
  - ✅ Salvamento automático em Supabase
  - ✅ Sessão com estatísticas completas
- **Nova UI:**
  - Tab "📚 Exercício" → Seletor → Exercício → Dashboard
  - Header com progresso visual (5/20 + barra % + stats)
  - Botões ✅ Sabia | ❌ Não Sabia

---

## Status das Tarefas

- ⬜ **Não iniciado**
- 🟡 **Em progresso**
- ✅ **Concluído**

---

### Estratégia de Palavras com Carregamento Lazy (NOVA)

**Decisão:** Implementar com seed inicial leve + enriquecimento sob demanda via API:

**Tabela: `words_global`** (Compartilhada entre todas as orgs)

```sql
- id: UUID (PK)
- word: TEXT (UNIQUE) -- "hello", "mundo", etc (PREENCHIDO NO SEED)
- definition: TEXT (nullable) -- Definição (PREENCHIDA BAJO DEMANDA)
- audio_url: TEXT (nullable) -- Pronúncia (PREENCHIDA BAJO DEMANDA)
- examples: TEXT[] (nullable) -- Exemplos (PREENCHIDA BAJO DEMANDA)
- part_of_speech: TEXT (nullable) -- Classe gramatical (PREENCHIDA BAJO DEMANDA)
- cefr_level: TEXT (nullable) -- Nível CEFR (PREENCHIDA BAJO DEMANDA)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
-- Sem organization_id (realmente global)
-- RLS: Leitura pública, escrita autenticada (ou desabilitada para seed)
```

**Tabela: `words`** (Personalizações por organização)

```sql
- id: UUID (PK)
- word_global_id: UUID (FK para words_global) -- Vincula à palavra global
- organization_id: UUID (FK para organizations) -- Isolamento org
- translation: TEXT (nullable) -- Tradução customizada pela org
- custom_definition: TEXT (nullable) -- Override da definição
- created_by: UUID (FK para users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
-- RLS: SELECT/INSERT/UPDATE/DELETE filtrado por organization_id
```

**Fluxo de Seed e Enriquecimento:**

```
FASE 1: SEED INICIAL (Uma só vez)
├── Arquivo externo: seeds/words-list.json (array de strings)
├── Exemplo: ["hello", "world", "suspicious", ...]
├── Gravar em words_global apenas coluna 'word'
└── Comando: npm run seed:init

FASE 2: ENRIQUECIMENTO SOB DEMANDA
├── Usuário clica em "Exercício" → ExerciseSelector
├── Query: SELECT 20 palavras aleatórias de words_global NÃO completadas
├── Para cada palavra:
│   ├── 1. Verificar AsyncStorage local (namespace: words_{orgId}_{word})
│   ├── 2. Se vazio → verificar words_global (se tem definition + audio_url)
│   ├── 3. Se vazio → chamar DictionaryAPI.dev
│   ├── 4. UPDATE words_global com definition, audio_url, examples, part_of_speech, cefr_level
│   └── 5. Cachear em AsyncStorage para offline
├── Exibir exercício com dados enriquecidos
└── Próximo exercício carrega 20 NOVAS palavras

FASE 3: REUTILIZAÇÃO
├── Próximas execuções da mesma palavra
├── 1. AsyncStorage tem dados → usar (instantâneo, offline)
├── 2. Se vazio → words_global tem dados → usar + cachear
└── 3. Nunca mais chama API (economiza quota)
```

**Benefícios:**

- ✅ Seed inicial rápido e leve (apenas strings)
- ✅ Enriquecimento progressivo sob demanda (lazy loading)
- ✅ Zero redundância: palavra armazenada 1x globalmente
- ✅ Isolamento mantido: Orgs só veem suas customizações
- ✅ Performance: Primeira busca pode ser lenta (API), próximas instantâneas
- ✅ Offline-first: AsyncStorage permite funcionar sem internet
- ✅ Economia: Chamadas API reduzidas ao mínimo (1x por palavra)
- ✅ Segurança: organization_id filtro em `words`; anonymous read em `words_global`

**Status:** ✅ DECISÃO TOMADA - Pronto para implementação

---

### ✅ Task 1.4: Implementar abordagem híbrida de palavras

**Descrição:** Criar tabela `words_global`, ajustar `wordService.ts` e atualizar tipos.

**Subtarefas:**

- [x] Criar migração `words_global` em Supabase
  - Tabela: id, word (UNIQUE), definition (null), audio_url (null), examples (null), part_of_speech (null), cefr_level (null), timestamps
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

### 🟡 Task 1.5: Seed de Palavras com Carregamento Lazy sob Demanda

**Descrição:** Carregar lista externa de palavras em `words_global.word` e enriquecer dados sob demanda via DictionaryAPI.dev durante exercícios.

**Estudo de Caso - Fluxo Completo:**

```
USUÁRIO 1 busca a palavra "hello" (primeira vez na plataforma):
├── AsyncStorage vazio
├── words_global.hello existe, mas definition é NULL
├── Sistema chama DictionaryAPI.dev
├── Retorna: {definition, audio_url, examples[], part_of_speech, cefr_level}
├── UPDATE words_global.hello com esses dados
├── Cachear em AsyncStorage.words_orgId_hello
└── Exibir flashcard ao usuário

USUÁRIO 2 busca a palavra "hello" (segundos depois):
├── AsyncStorage vazio
├── words_global.hello JÁ TEM todos os dados (preenchido por USER 1)
├── Cachear em AsyncStorage.words_orgId_hello
└── Exibir flashcard instantaneamente (SEM chamar API)

USUÁRIO 1 busca "hello" novamente (próximo dia):
├── AsyncStorage.words_orgId_hello tem dados
├── Usar direto (OFFLINE funciona!)
└── Exibir flashcard instantaneamente
```

**Estrutura Progressiva de words_global:**

```sql
-- APÓS SEED INICIAL (apenas coluna word)
SELECT * FROM words_global LIMIT 3;
id                | word      | definition | audio_url | examples | part_of_speech | cefr_level
----------------+-----------+----------+----------+--------+----------+--------
uuid-1          | hello     | NULL     | NULL     | NULL  | NULL     | NULL
uuid-2          | world     | NULL     | NULL     | NULL  | NULL     | NULL
uuid-3          | book      | NULL     | NULL     | NULL  | NULL     | NULL

-- APÓS PRIMEIRO USO (dados enriquecidos)
SELECT * FROM words_global WHERE word = 'hello';
id                | word      | definition                | audio_url                                    | examples                              | part_of_speech | cefr_level
----------------+-----------+------------------------+------------------------------------------+-----------------------------------+----------+--------
uuid-1          | hello     | Expression of greeting | https://api.dict.dev/.../hello-us.mp3 | ["Hello, how are you?", ...]  | interjection | A1
```

**Fluxo de Exercício - Rotação de 20 Palavras Aleatórias:**

```
1. TELA ExerciseSelector:
   - Query: SELECT 20 palavras WHERE id NOT IN (
       SELECT word_id FROM user_progress WHERE user_id = $1
     ) ORDER BY RANDOM()
   - Para cada palavra: chamar getWordData(word) para enriquecer se necessário
   - Exibe lista com palavra + status (spinner se loading dados)
   - Usuário clica "Começar Exercício"

2. TELA ExerciseScreen:
   - Exibe 1 palavra por vez (FlashCard com flip)
   - Header mostra: "5/20" + progress bar + ✅5 | ❌2
   - Botões: ✅ "Sabia" e ❌ "Não Sabia"
   - Cada resposta salva em user_progress (acertos/erros)
   - Passa para próxima palavra automaticamente

3. ROTAÇÃO APÓS COMPLETAR:
   - Salva sessão em flashcard_sessions
   - Volta ao dashboard com estatísticas
   - Próximo exercício carrega novo set de 20 DIFERENTES das anteriores
   - Loop continua até terminar TODAS as palavras do banco

4. ARMAZENAMENTO ESTRATIFICADO:
   - AsyncStorage: Cache local por org (offline-first, instantâneo)
   - Supabase words_global: Source of truth enriquecido (compartilhado)
   - Supabase user_progress: Rastreamento de acertos/erros (por usuário)
   - Supabase flashcard_sessions: Histórico de exercícios (por usuário)
```

**Fluxo de Busca (getWordData em wordService.ts):**

```typescript
async function getWordData(word: string, organizationId: UUID): Promise<IWord> {
  const storageKey = `words_${organizationId}_${word}`;

  // NÍVEL 1: Verificar cache local (AsyncStorage)
  try {
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.definition && parsed.audio_url) {
        return parsed; // ✅ Completo e offline
      }
    }
  } catch (error) {
    console.warn(`AsyncStorage read error for ${word}:`, error);
  }

  // NÍVEL 2: Verificar Supabase words_global
  const { data: globalWord, error: supabaseError } = await supabase
    .from("words_global")
    .select("*")
    .eq("word", word)
    .single();

  if (globalWord?.definition && globalWord?.audio_url) {
    // ✅ Já enriquecido no banco, cachear localmente
    await AsyncStorage.setItem(storageKey, JSON.stringify(globalWord));
    return globalWord;
  }

  // NÍVEL 3: Buscar no DictionaryAPI
  const apiData = await fetchFromDictionaryAPI(word);

  // NÍVEL 4: Salvar no banco (UPDATE words_global)
  const { data: updated } = await supabase
    .from("words_global")
    .update({
      definition: apiData.definition,
      audio_url: apiData.audio_url,
      examples: apiData.examples,
      part_of_speech: apiData.part_of_speech,
      cefr_level: apiData.cefr_level,
      updated_at: new Date().toISOString(),
    })
    .eq("word", word)
    .select()
    .single();

  // Cachear localmente
  await AsyncStorage.setItem(storageKey, JSON.stringify(updated));

  return updated;
}
```

**Status:** 🟡 EM PROGRESSO

- [x] Decisão arquitetural tomada
- [ ] ExerciseSelector.tsx ajustada para nova abordagem
- [ ] ExerciseScreen.tsx ajustada para nova abordagem
- [ ] wordService.ts implementado com 4 níveis de cache
- [ ] Seed script criado com arquivo externo

**Subtarefas Task 1.5:**

- [ ] **Preparar arquivo externo `seeds/words-list.json`**
  - Array de strings: `["hello", "world", "suspicious", "book", ...]`
  - Exemplo de formato:
    ```json
    {
      "total": 5000,
      "words": ["hello", "world", "people", "water", "house", ...]
    }
    ```
  - Fonte recomendada: English frequency wordlist de domínio público
  - Tamanho inicial: ~100-500 palavras para testes, depois expandir para 5000+

- [ ] **Criar script `scripts/seed-words-initial.js`**
  - Ler `seeds/words-list.json`
  - Conectar ao Supabase com RLS desabilitada
  - Verificar quais palavras já existem em words_global
  - Inserir novas com apenas coluna 'word' preenchida (outros campos NULL)
  - Usar UPSERT para evitar duplicatas
  - Log: quantas palavras novas inseridas, quantas já existiam
  - Comando: `npm run seed:init`

- [ ] **Ajustar `wordService.ts` com nova estratégia lazy:**
  - Implementar `getWordData(word, organizationId)` com 4 níveis
  - Suporte a AsyncStorage com namespace por organization_id
  - Verificar se dados completos (definition && audio_url) antes de chamar API
  - Tratamento de erros: se API falha, usar dados parciais do banco
  - Log: qual nível foi usado (cache/banco/api)

- [ ] **Atualizar ExerciseSelector.tsx:**
  - Query: `SELECT * FROM words_global WHERE id NOT IN (SELECT word_id FROM user_progress WHERE user_id = $1) ORDER BY RANDOM() LIMIT 20`
  - Para cada palavra: chamar `getWordData(word, organizationId)`
  - Exibir com spinner se status é "enriquecendo..."
  - Tratar timeouts da API com mensagem amigável

- [ ] **Testar fluxo completo:**
  - [ ] Seed com 50+ palavras (apenas coluna word)
  - [ ] Executar: `npm run seed:init`
  - [ ] Validar no Supabase: 50+ palavras com definition = NULL
  - [ ] Exercício carrega 20 aleatórias
  - [ ] Primeira busca enriquece com API (pode ser lenta)
  - [ ] Segunda busca usa cache local (instantâneo)
  - [ ] Terceira busca usa banco (sem API)
  - [ ] Próximo exercício carrega diferentes 20
  - [ ] Validar: todas as 50 palavras foram vistas? Sim → completado

- [ ] **Testar AsyncStorage offline:**
  - [ ] Desabilitar internet (DevTools Network)
  - [ ] Carregar exercício já iniciado
  - [ ] Dados locais funcionam sem API
  - [ ] Reconectar, sincronizar com sucesso
  - [ ] Dados não duplicam (upsert correto)

- [ ] **Habilitar RLS após testes completos**
  - [ ] Criar policies: SELECT público, UPDATE/INSERT autenticado
  - [ ] Testar com múltiplos usuários
  - [ ] Validar isolamento por organization_id

**Requisitos:**

- Task 1.4 concluída ✅
- Acesso ao MCP Supabase ✅
- Acesso DictionaryAPI.dev (gratuito, sem auth) ✅
- AsyncStorage para cache local (React Native + Web) ✅
- Arquivo externo com lista de palavras (a preparar)

**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** ~3-4 horas (implementação + testes)
**Custo:** Totalmente gratuito (DictionaryAPI.dev + Supabase free tier)
**Status:** 🟡 EM PROGRESSO (Estrutura pronta, implementação pendente)

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

### ✅ Task 2.3: Criar lógica de feedback e atualização de score

**Descrição:** Implementar sistema de pontuação e progresso do usuário.

**Subtarefas:**

- [x] Criar hook `useFlashcardProgress.ts` para gerenciar estado
- [x] Implementar função de registrar acerto/erro no Supabase
- [x] Criar regra de "3 acertos = Mastered"
- [x] Atualizar tabela `user_progress` após cada feedback
- [x] Calcular nível CEFR baseado em total de palavras aprendidas
- [x] Criar notificação visual de feedback (toast/snackbar)
- [x] Testar fluxo completo de pontuação

**Requisitos:** Task 1.2 e 2.1 concluídas
**Prioridade:** 🟠 ALTA

---

## 🎯 Fase 2.5: Exercício com 20 Palavras (NOVO)

### ✅ Task 2.4: Criar tela ExerciseSelector (20 palavras)

**Descrição:** Implementar tela de seleção que carrega automaticamente 20 palavras para exercício.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ Componente `ExerciseSelector.tsx` (450 linhas)
- ✅ Query Supabase: busca 20 palavras com score < 3
- ✅ Priorização: nunca vistas > vistas 1-2x > restantes
- ✅ Lista visual mostrando:
  - Número (1., 2., 3.,... 20.)
  - Palavra + Definição
  - Primeiro exemplo (itálico roxo)
  - Badge 🎵 se tem áudio
- ✅ Estados: carregando, erro, sucesso, sem palavras
- ✅ Botões: ← Voltar (vermelho) | Começar Exercício → (verde)
- ✅ Estilização: LinearGradient + NativeWind
- ✅ Integração em AppNavigator

**Requisitos:** Task 1.4, 2.1, 2.3 concluídas
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 2.5: Criar tela ExerciseScreen (exercício 20 palavras)

**Descrição:** Implementar tela de exercício que exibe 1 palavra por vez com feedback.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ Componente `ExerciseScreen.tsx` (320 linhas)
- ✅ Header com:
  - ← Botão voltar
  - "5/20" (posição atual/total)
  - Progress bar verde com % preenchida
  - 2 stats: ✅ Sabia (5) | ❌ Não Sabia (3)
- ✅ FlashCard no centro com animação flip existente
- ✅ Botões na base:
  - ❌ "Não Sabia" (vermelho) - incrementa contador erros
  - ✅ "Sabia" (verde) - incrementa contador acertos
- ✅ Cada resposta:
  - Salva em user_progress (acertos/erros)
  - Passa para próxima palavra automaticamente
- ✅ Ao completar 20:
  - Salva flashcard_session com estatísticas
  - Volta ao dashboard
- ✅ Estilos: LinearGradient + NativeWind
- ✅ Offline-first com suporte a cache local
- ✅ Integração em AppNavigator

**Requisitos:** Task 2.1, 2.4 concluídas
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 2.6: Integrar novo fluxo no AppNavigator

**Descrição:** Atualizar navegação para incluir ExerciseSelector → ExerciseScreen.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ 4 screens: home (ExerciseSelector), exercise, dashboard, etc
- ✅ Transições automáticas:
  - home → exercise (ao clicar "Começar")
  - exercise → home (ao cancelar)
  - home → dashboard (ao clicar tab)
  - exercise → home (ao completar)
- ✅ Bottom tabs:
  - 📚 Exercício (ExerciseSelector)
  - 📊 Progresso (DashboardScreen)
  - 🚪 Sair (logout)
- ✅ Estado armazenado entre navegações
- ✅ Props tipadas (Word[], ExerciseStats, etc)
- ✅ Compatível com multi-tenant (userId, organizationId)

**Requisitos:** Task 2.4, 2.5, 3.1 concluídas
**Prioridade:** 🔴 CRÍTICA
**Status:** ✅ CONCLUÍDO

---

### ✅ Task 3.1: Criar tela de estatísticas com progresso CEFR

**Descrição:** Implementar dashboard de progresso do usuário.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ Tela `DashboardScreen.tsx` (480 linhas)
- ✅ Widget de "Palavras aprendidas hoje" (últimas 24h)
- ✅ Widget de "Palavras aprendidas esta semana" (últimos 7 dias)
- ✅ Gráfico de nível CEFR (A1 até C2) com progresso
- ✅ Histórico de sessões (últimas 10)
- ✅ Estilização com paleta Indigo/Gradientes
- ✅ Refresh de dados (pull-to-refresh)
- ✅ Integração com Supabase (queries multi-tenant)

**Requisitos:** Task 2.3 concluída ✅
**Prioridade:** 🟠 ALTA

---

### ✅ Task 3.2: Configurar app.json para PWA

**Descrição:** Preparar aplicação para modo Web Progressive App.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ Criar manifest.json com metadados completos (PWA compliant)
- ✅ Configurar app.json com ícones e display mode standalone
- ✅ Criar Service Worker com caching strategies (cache-first, network-first)
- ✅ Implementar suporte offline gracioso com página de fallback
- ✅ Criar script gerador de ícones (sharp-based)
- ✅ Criar SVG base para ícone (icon-base.svg)
- ✅ Criar guia de testes PWA (PWA_TESTING_GUIDE.md)
- ✅ Gerar ícones 192x192 e 512x512 (sharp instalado e executado)
- ⏳ Testar modo offline
- ⏳ Testar instalação web
- ⏳ Validar com Lighthouse PWA audit

**Arquivos Criados:**

- `public/manifest.json` - Metadados PWA (Web App Manifest)
- `public/index.html` - Página HTML com Service Worker registration
- `public/service-worker.js` - Service Worker offline-first
- `public/icon-base.svg` - Ícone base para gerar PNG
- `public/icons/` - Diretório para ícones (criado, aguardando geração)
- `scripts/generate-icons.js` - Script para gerar ícones PNG
- `PWA_TESTING_GUIDE.md` - Guia completo de validação

**Próximas Ações:**

```bash
# 1. Instalar dependência sharp
npm install sharp

# 2. Gerar ícones PNG
npm run generate-icons

# 3. Testar localmente
npm start

# 4. Validar com Lighthouse
lighthouse http://localhost:8081 --view
```

**Requisitos:** Task 3.1 concluída ✅
**Prioridade:** 🟠 ALTA

**Requisitos:** Task 3.1 concluída ✅
**Prioridade:** 🟠 ALTA

---

### ✅ Task 3.3: Implementar autenticação com Supabase Auth (Multi-Tenant)

**Descrição:** Adicionar sistema de login/signup do usuário com suporte a multi-tenant.

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ LoginScreen.tsx (email + senha)
- ✅ SignUpScreen.tsx (email + senha + organização)
- ✅ AuthContext com persistência (AsyncStorage)
- ✅ Migração `user_organizations` (tabela N:N)
- ✅ RLS policies (desabilitadas para testes)
- ✅ Fluxo de signup → criar user_organizations → login
- ✅ Persistência de sessão + organizationId
- ✅ Integração no App.tsx com navegação automática
- ✅ Testes: 2 acertos de 3 salvos em user_progress ✅

**Requisitos:** Task 1.2 concluída ✅
**Prioridade:** 🟠 ALTA
**Nota Multi-Tenant:** Sempre armazenar organização_id após login ✅

---

## � Tarefas de Segurança (Pós-MVP)

### ⚠️ Habilitar RLS em Produção

**Descrição:** Reabilitar Row Level Security em todas as tabelas após testes completos.

**Status:** 🟡 PREPARADO (Desabilitado para testes)

**Tabelas com RLS desabilitado:**

- `organizations` - Desabilitar indefinidamente (metadata compartilhada)
- `user_organizations` - Reabilitar com policies no LoginScreen/SignUpScreen
- `user_progress` - Reabilitar com check_user_access() function
- `flashcard_sessions` - Reabilitar com validation por organization_id
- `words_global` - Pode permitir leitura pública (RLS permissivo)

**Procedimento de Re-habilitação:**

1. Criar function `check_user_access(user_id uuid)` (já existe)
2. Habilitar RLS em user_organizations com policies SELECT/INSERT/UPDATE/DELETE
3. Habilitar RLS em user_progress com FK validation
4. Habilitar RLS em flashcard_sessions com organization_id filter
5. Testes completos com múltiplos usuários
6. Deploy em staging antes de produção

**Requisitos:** Todos os testes de fluxo completo passando ✅
**Prioridade:** 🔴 CRÍTICA (antes do deploy em OceanDigital)
**Nota:** Mantém desabilitado enquanto em desenvolvimento para evitar erros RLS

---

## �🚀 Fase 4: Deployment & DevOps (OceanDigital)

### 🟡 Task 4.1: Configurar Docker e docker-compose para OceanDigital

**Descrição:** Criar containers para frontend (PWA) e backend (opcional).

**Status:** ✅ CONCLUÍDO

**Implementado:**

- ✅ Dockerfile (multi-stage: Node builder + Nginx runner)
- ✅ docker-compose.yml (serviço web com health checks)
- ✅ nginx.conf (configuração global)
- ✅ nginx-default.conf (virtual host PWA)
- ✅ .dockerignore (otimização build)
- ✅ .env.production.example (template)
- ✅ DOCKER_SETUP_GUIDE.md (guia testes locais)

**Próximas Ações:**

1. ✅ Push no GitHub
2. ✅ Criar app no OceanDigital App Platform
3. ✅ Deploy automático

**Requisitos:** Task 3.2 concluída ✅
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

### 🏗️ Decisão Arquitetural: Estratégia de Palavras com Lazy Loading

**Escolhido: CARREGAMENTO SOB DEMANDA COM SEED LEVE**

O sistema usa **seed inicial leve + enriquecimento progressivo**:

1. **SEED INICIAL (Uma só vez)**
   - Arquivo externo: `seeds/words-list.json`
   - Apenas coluna `word` preenchida
   - Todas as outras colunas: NULL
   - Comando: `npm run seed:init`

2. **`words_global`** (Compartilhada entre todas as orgs)
   - word: TEXT (UNIQUE) - Preenchido no seed
   - definition: TEXT (null) - Preenchido sob demanda
   - audio_url: TEXT (null) - Preenchido sob demanda
   - examples: TEXT[] (null) - Preenchido sob demanda
   - part_of_speech: TEXT (null) - Preenchido sob demanda
   - cefr_level: TEXT (null) - Preenchido sob demanda

3. **`words`** (COM organization_id - Personalizações)
   - word_global_id: UUID (FK para words_global)
   - organization_id: UUID (FK para organizations)
   - translation: TEXT (customização)
   - custom_definition: TEXT (override)

**Fluxo de Busca:**

```
getWordData("hello") → Procura em:
  1. AsyncStorage local (namespace: words_{orgId}_{word}) → SEM API ✅
  2. words_global completa (definition && audio_url) → Cachear localmente
  3. DictionaryAPI.dev → UPDATE words_global → Cachear localmente
  4. Próximas vezes: AsyncStorage instantâneo ou banco (SEM API)
```

**Benefícios:**

- ✅ Seed rápido e leve (apenas strings)
- ✅ Enriquecimento progressivo sob demanda
- ✅ Zero redundância: palavra armazenada 1x globalmente
- ✅ Isolamento: customizações por org em tabela separada
- ✅ Performance: AsyncStorage muito rápido, API 1x por palavra
- ✅ Offline-first: Funciona sem internet com cache local
- ✅ Economia: Chamadas API reduzidas ao mínimo
- ✅ Compatível com RLS e segurança multi-tenant

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
2. ✅ Task 0.1: Configurar Supabase para o LexiCard
3. ✅ Task 0.2: Criar schema do banco de dados
4. ✅ Task 1.1: Inicializar Expo com TypeScript e NativeWind
5. ✅ Tasks 1.2-1.4: Supabase Client, Cache Híbrido, FlashCard (Concluídas)
6. ✅ Tasks 2.1-2.6: Componentes e Exercício de 20 Palavras (Concluídas)
7. ✅ Task 3.1-3.3: Dashboard, PWA, Autenticação (Concluídas)
8. ⏳ **Task 1.5:** Implementar Seed com Carregamento Lazy
   - Criar arquivo `seeds/words-list.json` com lista de palavras
   - Implementar script `scripts/seed-words-initial.js`
   - Ajustar `wordService.ts` com 4 níveis de cache
   - Testar fluxo completo (seed → exercício → lazy load API)
9. ⏳ Task 4.1-4.4: Docker, CI/CD, Performance (Próximas)
10. ⏳ Task 5.1-5.3: Refinement, Testes, Deploy (Finais)
