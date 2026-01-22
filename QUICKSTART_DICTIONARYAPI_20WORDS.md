# 🚀 QUICK START - DictionaryAPI.dev + 20-Word System

## ⚡ TL;DR (Em 5 minutos)

Se você só quer executar tudo agora:

```bash
# 1. Aplicar migrations SQL no Supabase
#    → Abrir: SQL_MIGRATIONS_GUIDE.md
#    → Copiar + Executar 3 migrations

# 2. Testar script seed
npm run seed:1k:day1

# 3. Verificar dados
#    → Supabase Dashboard → words_global
#    → Deve ter exemplos e part_of_speech

# 4. Pronto! 20-word system funcionando
```

---

## 📊 O Que Mudou

### Antes (Hardcoded)

```javascript
const COMMON_WORDS = [
  { word: "hello", definition: "A greeting" }, // ❌ Hardcoded
  { word: "world", definition: "The earth" },
];
```

### Depois (API-Driven)

```javascript
const WORD_INDEX = ["hello", "world"]; // ✅ Apenas nomes
// Definições vêm do DictionaryAPI.dev
const data = await fetchFromDictionaryAPI("hello");
// { word, definition, examples[], audio_url, part_of_speech }
```

---

## 📁 Arquivos Criados/Modificados

| Arquivo                            | Status        | O Quê                            |
| ---------------------------------- | ------------- | -------------------------------- |
| `tasks.md`                         | ✅ Atualizado | Task 1.5 com DictionaryAPI.dev   |
| `scripts/seed-1k-words.js`         | ✅ Refatorado | API-driven, sem hardcoding       |
| `IMPLEMENTATION_20_WORDS.md`       | 📝 Novo       | Especificação completa (80 KB)   |
| `SUMMARY_DICTIONARYAPI_20WORDS.md` | 📝 Novo       | Resumo executivo                 |
| `SQL_MIGRATIONS_GUIDE.md`          | 📝 Novo       | Migrations prontas para executar |

---

## ✅ Passo 1: Executar Migrations SQL

### No Supabase Dashboard

1. Ir em: https://app.supabase.com/projects
2. Selecionar seu projeto
3. Menu esquerdo → **SQL Editor**
4. Clicar "New query"
5. Copiar da seção "Migration 1" de [SQL_MIGRATIONS_GUIDE.md](SQL_MIGRATIONS_GUIDE.md)
6. Clicar "Run"
7. Repetir para "Migration 2" e "Migration 3"

### Via CLI (Supabase)

```bash
# Se usar Supabase CLI
supabase db push

# Ou manualmente
psql -h db.project.supabase.co -U postgres -d postgres < migration.sql
```

### ✅ Validar

```sql
-- No SQL Editor, executar:
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'words_global';

-- Deve incluir: examples, part_of_speech
```

---

## ✅ Passo 2: Testar Script Seed

```bash
# Terminal do projeto

# 1. Instalar dependências (se não tiver)
npm install

# 2. Garantir .env.local está correto
cat .env.local
# Deve ter: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Executar seed
npm run seed:1k:day1

# Esperado:
# ═══════════════════════════════════════════
#   🌱 SEED COM DictionaryAPI.dev
#   📋 REGRA: NUNCA HARDCODE - Sempre API
# ═══════════════════════════════════════════
#
# 🌐 Buscando 38 palavras do DictionaryAPI.dev...
# ⏳ 38/38 (100%)
# ✅ Sucesso: 38 | ⚠️  Falhas: 0
#
# 📦 Total para inserir: 38
#
# 🚀 Populando 38 palavras no Supabase...
# ✓ Batch 1: 38 total
#
# ✅ SEED CONCLUÍDO!
```

---

## ✅ Passo 3: Validar Dados no Supabase

### Via Dashboard

1. Supabase → **Table Editor**
2. Selecionar **words_global**
3. Procurar por "hello" ou "world"
4. Clicar para expandir → Ver `examples` array
5. Deve mostrar:
   ```json
   {
     "word": "hello",
     "definition": "...",
     "examples": ["Hello there!", "Hello, how are you?"],
     "audio_url": "https://...",
     "part_of_speech": "interjection"
   }
   ```

### Via SQL

```sql
SELECT
  word,
  definition,
  examples,
  part_of_speech,
  audio_url
FROM words_global
ORDER BY word
LIMIT 10;
```

---

## 🎯 Agora Você Pode...

### 1. Expandir para 1.000 Palavras

```javascript
// Em scripts/seed-1k-words.js
const WORD_INDEX = [
  "hello", "world", "people", ... // 1.000 palavras
];

npm run seed:1k:day1
```

### 2. Implementar ExerciseScreen

Ver [IMPLEMENTATION_20_WORDS.md](IMPLEMENTATION_20_WORDS.md) - Seção "Implementação Frontend"

### 3. Testar 20-Word Logic

```javascript
// Pseudo-código para Dashboard
const userId = "user-123";
const exerciseWords = await loadExerciseSet(userId);

console.log(exerciseWords.length); // Deve ser 20
console.log(exerciseWords[0].examples); // Array com exemplos
```

---

## 🔍 Troubleshooting Rápido

### ❌ "Erro: fetchFromDictionaryAPI failed"

```
Causa: DictionaryAPI.dev timeout ou palavra não existe
Solução: Aumentar delay em script
```

```javascript
await new Promise((resolve) => setTimeout(resolve, 500)); // Aumentar delay
```

### ❌ "Erro: Column examples does not exist"

```
Causa: Migrations não foram executadas
Solução: Executar Migration 1 novamente
```

### ❌ "Erro: 20 palavras retornadas, score não < 3"

```
Causa: user_progress não inicializado
Solução: Criar entrada em user_progress para cada palavra com score = 0
```

```sql
-- Seed user_progress
INSERT INTO user_progress (user_id, word_id, score)
SELECT
  'user-uuid',
  id,
  0
FROM words_global
LIMIT 20
ON CONFLICT DO NOTHING;
```

---

## 📚 Documentos Referência

| Doc                                                                  | Usa Para                            |
| -------------------------------------------------------------------- | ----------------------------------- |
| [tasks.md](tasks.md)                                                 | Ver status Task 1.5                 |
| [IMPLEMENTATION_20_WORDS.md](IMPLEMENTATION_20_WORDS.md)             | Implementar ExerciseScreen frontend |
| [SQL_MIGRATIONS_GUIDE.md](SQL_MIGRATIONS_GUIDE.md)                   | Entender migrations SQL             |
| [SUMMARY_DICTIONARYAPI_20WORDS.md](SUMMARY_DICTIONARYAPI_20WORDS.md) | Visão geral do projeto              |
| [.ai_instructions.md](.ai_instructions.md)                           | Regras do projeto                   |

---

## 🎓 Conceitos Chave

### 1. Zero Hardcoding

- ❌ Nunca: `const words = ["hello", "world"]` com definições
- ✅ Sempre: Buscar de `DictionaryAPI.dev` ou `Supabase`

### 2. Examples são Críticos

```json
{
  "word": "suspicious",
  "examples": [
    // ⭐ NOVO! Mostram contexto real
    "His suspicious behaviour...",
    "She gave me a suspicious look."
  ]
}
```

### 3. 20-Word Exercise Flow

```
Start
  ↓
Load 20 words WHERE score < 3
  ↓
Study cada palavra
  ↓
Clique Acertei/Errei
  ↓
Score++ (se correto)
  ↓
Quando todas score >= 3
  ↓
Load novo set de 20
```

### 4. AsyncStorage Cache

```
Online → Supabase (source of truth)
Offline → AsyncStorage (cache local)
Reconectar → Sincronizar automaticamente
```

---

## 🚀 Próximo Sprint

- [ ] Executar migrations SQL
- [ ] Testar `npm run seed:1k:day1`
- [ ] Validar dados no Supabase
- [ ] Implementar `ExerciseScreen` (React Native)
- [ ] Testar fluxo de 20 palavras
- [ ] Expandir para 1.000 palavras
- [ ] Deploy para produção

---

## 💡 Dicas Produção

1. **Sempre fazer backup antes de migrations**

   ```bash
   pg_dump postgres > backup.sql
   ```

2. **Testar em staging primeiro**
   - Não ir direto para produção

3. **Monitorar performance**

   ```sql
   EXPLAIN ANALYZE SELECT ... WHERE score < 3;
   ```

4. **RLS policies são críticas**
   - User A não pode ver words_global de User B
   - Revertidas em [SQL_MIGRATIONS_GUIDE.md](SQL_MIGRATIONS_GUIDE.md)

---

## ✅ Sucesso!

Se você conseguiu executar tudo até aqui:

✅ Migrations aplicadas
✅ Seed script funcionando com DictionaryAPI.dev
✅ Dados com examples[] em Supabase
✅ Estrutura para 20-word system pronta
✅ Zero hardcoding implementado
✅ Conforme .ai_instructions.md

**Próximo**: Implementar ExerciseScreen frontend para realmente usar as 20 palavras.

---

**Status**: 🎉 Ready to Deploy
**Tempo**: ~15 minutos para executar tudo
**Dependências**: Nenhuma nova (usa libs existentes)
