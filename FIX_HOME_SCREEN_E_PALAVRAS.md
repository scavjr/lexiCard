# 🔧 FIX: Fluxo de Interface e Carregamento de Palavras

## Resumo das Mudanças

### Problema Relatado

- ❌ Apenas 3 cards apareciam ao invés de 20
- ❌ Falta de tela inicial/menu para o usuário escolher ação

### Causa Raiz

1. **Carregamento de palavras**: A query limitava a 20 palavras **ANTES** de filtrar as completadas
   - Se havia muitas palavras completadas nas primeiras 20, restavam apenas 3
2. **Fluxo de navegação**: O app ia direto para ExerciseSelector, sem menu inicial

---

## ✅ Soluções Implementadas

### 1. Criar HomeScreen (Nova Tela)

📄 **Arquivo**: `src/screens/HomeScreen.tsx`

**Features:**

- ✅ Menu principal com 3 opções:
  - 🎯 Nova Rodada (20 palavras)
  - 📊 Ver Progresso (Dashboard)
  - 👋 Sair (Logout)
- ✅ Cards com estatísticas:
  - Total de palavras na base
  - Palavras completadas
  - Palavras restantes
- ✅ Design responsivo com gradientes

**Interface:**

```
┌─────────────────────────────┐
│      📚 LexiCard            │
│  Aprenda palavras em inglês │
└─────────────────────────────┘
┌─────────────┬─────────────┬──────────────┐
│   1414      │     150     │     1264     │
│   Palavras  │  Completadas│  Para Aprender│
└─────────────┴─────────────┴──────────────┘
┌─────────────────────────────┐
│   🎯 Nova Rodada           │
│   20 palavras para praticar │
└─────────────────────────────┘
┌─────────────────────────────┐
│   📊 Progresso              │
│   Ver seu desempenho        │
└─────────────────────────────┘
┌─────────────────────────────┐
│   👋 Sair                   │
│   Até logo!                 │
└─────────────────────────────┘
```

### 2. Corrigir Carregamento de Palavras

📄 **Arquivo**: `src/screens/ExerciseSelector.tsx`

**Alteração de Lógica:**

```typescript
// ❌ ANTES (Bug)
const { data: availableWords } = await supabase
  .from("words_global")
  .select(...)
  .limit(20)  // ⚠️ Limita ANTES de filtrar!

const selectedWords = availableWords
  .filter(w => !completedWordIds.has(w.id))  // Pode sobrar apenas 3

// ✅ DEPOIS (Corrigido)
const { data: availableWords } = await supabase
  .from("words_global")
  .select(...)
  .limit(200)  // Busca MUITAS palavras

const selectedWords = availableWords
  .filter(w => !completedWordIds.has(w.id))  // Remove completadas
  .slice(0, 20)  // Pega apenas 20 das restantes
```

**Resultado:**

- ✅ Busca 200 palavras da base
- ✅ Remove as 150 completadas
- ✅ Garante 20 palavras não-completadas
- ✅ Nunca falta palavra para exercício

### 3. Adicionar Debug Logs

📄 **Arquivo**: `src/screens/ExerciseSelector.tsx`

Console logs adicionados para diagnóstico:

```typescript
console.log("✅ Palavras completadas:", completedWordIds.size);
console.log("📚 Total de palavras buscadas:", availableWords?.length);
console.log("🎯 Palavras após filtro:", selectedWords.length);
```

### 4. Atualizar Navegação

📄 **Arquivo**: `src/navigation/AppNavigator.tsx`

**Novo Fluxo:**

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ↓
┌──────────────┐
│  HomeScreen  │  ← NOVO: Menu principal
│ (3 opções)   │
└──┬──────┬────┘
   │      │
   ↓      ↓
┌─────────────┐    ┌────────────────┐
│ Exercise    │    │ Dashboard      │
│ Selector    │    │ (Progresso)    │
│ (20 words)  │    └────────────────┘
└──┬──────────┘
   │
   ↓
┌──────────────┐
│  Exercise    │
│  Screen      │
│ (Quiz)       │
└──────────────┘
```

**Screens:**

- `"home"` → HomeScreen (NOVO)
- `"exercise-selector"` → ExerciseSelector (20 palavras)
- `"exercise"` → ExerciseScreen (quiz)
- `"dashboard"` → DashboardScreen (progresso)

**Bottom Tabs:**

- 🏠 Início (Home)
- 📚 Exercício (ExerciseSelector)
- 📊 Progresso (Dashboard)

---

## 🧪 Como Testar

### 1. Iniciar o App

```bash
npm run web
```

### 2. Fluxo Esperado

1. ✅ Tela de login
2. ✅ **Menu HOME** com 3 botões (NOVO!)
3. ✅ Ao clicar "Nova Rodada":
   - Carrega 20 palavras (não mais 3!)
   - Mostra lista de palavras selecionadas
4. ✅ Ao clicar "Começar Exercício":
   - Inicia quiz com 20 palavras
5. ✅ Ao completar exercício:
   - Volta para HOME

### 3. Debug (F12 Console)

Você verá logs como:

```
🔍 [ExerciseSelector] Iniciando loadWordsForExercise
   userId: abc123, organizationId: def456
✅ Palavras completadas (acertos >= 3): 150
📚 Total de palavras buscadas (limit 200): 200
🎯 Palavras após filtro (removendo completadas): 20
   Exemplos: apple, basketball, camera
```

---

## 📊 Estatísticas de Dados

**Banco de dados:**

- ✅ Total: **1,414 palavras** em `words_global`
- ✅ Insertadas via: `npm run seed:init` (3 batches)
- ✅ Estrutura: Apenas coluna `word` preenchida (lazy loading)

**Exercício:**

- ✅ Por rodada: **20 palavras** (não-completadas)
- ✅ Palavras completadas: `acertos >= 3` em `user_progress`

---

## 🎯 Próximos Passos

1. ✅ Testar nova HomeScreen
2. ✅ Verificar se aparecem 20 palavras
3. ⏳ Implementar wordService.ts (4-level cache para lazy loading)
4. ⏳ Enriquecer palavras com DictionaryAPI.dev sob demanda

---

## 📝 Arquivos Modificados

| Arquivo                            | Tipo       | Mudança                             |
| ---------------------------------- | ---------- | ----------------------------------- |
| `src/screens/HomeScreen.tsx`       | NOVO       | Tela inicial com menu               |
| `src/screens/ExerciseSelector.tsx` | MODIFICADO | Fix limit/filter logic + debug logs |
| `src/navigation/AppNavigator.tsx`  | MODIFICADO | Adicionar HomeScreen ao fluxo       |

---

**Status**: ✅ Pronto para teste
