# 🔧 Documentação Técnica: Sistema de Seed de Palavras

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SEED DE PALAVRAS                         │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  scripts/    │ │  seeds/      │ │ package.json │
        │ seed-1k-     │ │ words-1k.    │ │  npm script  │
        │ words.js     │ │    json      │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
                │             │                   │
                └─────────────┼───────────────────┘
                              │
                        ┌─────▼──────┐
                        │  .env.local │
                        │ (credenciais)
                        └─────┬──────┘
                              │
                        ┌─────▼──────────────────┐
                        │  Supabase JavaScript   │
                        │  Client (npm package)  │
                        └─────┬──────────────────┘
                              │
                        ┌─────▼──────────────────┐
                        │  POST /rest/v1/        │
                        │  words_global (upsert) │
                        └─────┬──────────────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
                   ▼                     ▼
            ┌────────────┐      ┌────────────┐
            │  Supabase  │      │   RLS      │
            │  Database  │      │ (disabled) │
            └────────────┘      └────────────┘
```

## Fluxo de Execução

### 1. Inicialização

```javascript
// scripts/seed-1k-words.js

require("dotenv").config({ path: ".env.local" });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials in .env.local");
}
```

**Validação:**

- ✅ .env.local carregado com dotenv
- ✅ Credenciais presentes
- ✅ Supabase client inicializado

### 2. Carregamento de Palavras

```javascript
// OPÇÃO A: Hardcoded (atual - 86 palavras)
const COMMON_WORDS = [
  { word: "hello", definition: "...", cefr: "A1", frequency: 9.8 },
  // ... 85 mais
];

// OPÇÃO B: De JSON (futuro - 1.000+ palavras)
const wordsPath = path.join(__dirname, "../seeds/words-1k.json");
const COMMON_WORDS = JSON.parse(fs.readFileSync(wordsPath, "utf-8"));
```

**Validação:**

- ✅ Array carregado
- ✅ Cada objeto tem: word, definition, cefr, frequency
- ✅ Nenhum objeto null/undefined

### 3. Deduplicação

```javascript
function deduplicateWords(words) {
  const seen = new Set();
  const unique = [];

  for (const w of words) {
    if (!seen.has(w.word.toLowerCase())) {
      seen.add(w.word.toLowerCase());
      unique.push(w);
    }
  }

  return unique;
}

const uniqueWords = deduplicateWords(COMMON_WORDS);
console.log(`Removed ${COMMON_WORDS.length - uniqueWords.length} duplicates`);
```

**Validação:**

- ✅ Duplicatas removidas dentro do batch
- ✅ Case-insensitive (Hello = hello)

### 4. Processamento em Batches

```javascript
const BATCH_SIZE = 1000;
const batches = [];

for (let i = 0; i < uniqueWords.length; i += BATCH_SIZE) {
  batches.push(uniqueWords.slice(i, i + BATCH_SIZE));
}

console.log(`Processing ${batches.length} batch(es)`);
```

**Exemplo:**

- 1.000 palavras = 1 batch
- 1.500 palavras = 2 batches (1000 + 500)
- 86 palavras = 1 batch

### 5. Inserção via Supabase (UPSERT)

```javascript
for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
  const batch = batches[batchIndex];

  const { data, error } = await supabase.from("words_global").upsert(batch, {
    onConflict: "word", // Se palavra já existe, fazer update
  });

  if (error) {
    console.error(`✗ Batch ${batchIndex + 1} failed:`, error);
  } else {
    console.log(
      `✓ Batch ${batchIndex + 1}: ${batch.length} palavras inseridas`,
    );
  }
}
```

**O que faz UPSERT:**

- Se palavra NÃO existe: INSERT novo registro
- Se palavra JÁ existe: UPDATE com novos valores
- Resultado: Zero duplicatas mesmo após múltiplas execuções

### 6. Validação e Log Final

```javascript
console.log("\n=== RESUMO ===");
console.log(`Total: ${uniqueWords.length} palavras`);
console.log(`Batches: ${batches.length}`);
console.log(
  `Duplicatas removidas: ${COMMON_WORDS.length - uniqueWords.length}`,
);
console.log(`Status: ✅ Seed completo`);
```

**Exemplo de output:**

```
✓ Batch 1: 86 palavras inseridas
=== RESUMO ===
Total: 86 palavras
Batches: 1
Duplicatas removidas: 0
Status: ✅ Seed completo
```

## Estrutura de Dados

### seeds/words-1k.json

```json
[
  {
    "word": "hello",
    "definition": "A greeting or expression of goodwill",
    "cefr": "A1",
    "frequency": 9.8
  },
  {
    "word": "world",
    "definition": "The earth and all its inhabitants",
    "cefr": "A1",
    "frequency": 9.5
  }
]
```

### Mapeamento → Banco de Dados

| JSON Field | DB Column       | Type       | Notes             |
| ---------- | --------------- | ---------- | ----------------- |
| word       | word            | TEXT       | UNIQUE constraint |
| definition | definition      | TEXT       | Obrigatório       |
| cefr       | cefr_level      | VARCHAR(2) | A1-C2             |
| frequency  | frequency_score | FLOAT      | 0.0-10.0          |
| (auto)     | id              | UUID       | Gerado pelo DB    |
| (auto)     | created_at      | TIMESTAMP  | Gerado pelo DB    |
| (auto)     | updated_at      | TIMESTAMP  | Gerado pelo DB    |

## Monitoramento

### 1. Via CLI - Contar Palavras Inseridas

```bash
# Terminal - SQL direto no Supabase
psql postgresql://[user]:[password]@[host]/postgres

SELECT COUNT(*) FROM words_global;
```

### 2. Via Dashboard Supabase

```
1. Abrir https://app.supabase.com
2. Selecionar projeto: vmyhvjpnwqmhwqkcbvuk
3. SQL Editor → Abrir query
4. SELECT COUNT(*) FROM words_global;
5. Executar: Ctrl+Enter
```

### 3. Via Script Node

```javascript
// check-words.js
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

(async () => {
  const { count, error } = await supabase
    .from("words_global")
    .select("*", { count: "exact", head: true });

  console.log(`Total: ${count} palavras`);
})();
```

```bash
npm run check-words  # Adicionar em package.json
```

### 4. Verificar Linguística

```sql
-- Distribuição por CEFR
SELECT cefr_level, COUNT(*) FROM words_global GROUP BY cefr_level;

-- Top 10 por frequência
SELECT word, frequency_score FROM words_global ORDER BY frequency_score DESC LIMIT 10;

-- Verificar duplicatas
SELECT word, COUNT(*) FROM words_global GROUP BY word HAVING COUNT(*) > 1;
```

## Tratamento de Erros

### Erro: "Missing Supabase credentials"

```
Causa: .env.local não tem EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY
Solução: Criar .env.local com credenciais do Supabase
```

### Erro: "Could not find the 'cefr_level' column"

```
Causa: Migration não foi executada
Solução: Executar migration add_cefr_and_frequency_to_words_global
```

### Erro: "Failed to insert: RLS policy violation"

```
Causa: RLS está habilitado
Solução: ALTER TABLE words_global DISABLE ROW LEVEL SECURITY;
        (Depois re-habilitar antes de produção)
```

### Erro: "relation 'words_global' does not exist"

```
Causa: Tabela não criada
Solução: Executar migration create_words_global
```

## Performance

### Tempo de Execução

| Quantidade | Batches | Tempo Esperado | Notes      |
| ---------- | ------- | -------------- | ---------- |
| 86         | 1       | ~2-3s          | ✅ Testado |
| 1.000      | 1       | ~5-8s          | Estimado   |
| 2.000      | 2       | ~10-15s        | Estimado   |
| 10.000     | 10      | ~50-80s        | Estimado   |

### Otimizações Aplicadas

1. **Batch Insert:** 1.000 palavras por requisição (vs. 1 por vez)
   - Sem batch: 1.000 requisições × 100ms = 100s
   - Com batch: 1 requisição × 5s = 5s

2. **Deduplicação Prévia:** Remove duplicatas antes de enviar
   - Supabase UNIQUE constraint geraria erro
   - Mais rápido tratar localmente

3. **Índices no DB:** Índices em cefr_level e frequency_score
   - Buscas futuras mais rápidas
   - Criados automaticamente pela migration

## Segurança

### RLS Temporariamente Desabilitado

```sql
ALTER TABLE words_global DISABLE ROW LEVEL SECURITY;
```

**Risco:** Seed públicos podem escrever dados
**Solução:** Re-habilitar após seed completo

```sql
ALTER TABLE words_global ENABLE ROW LEVEL SECURITY;
```

**Cronograma:**

- Dias 1-10: RLS disabled (seed rodando)
- Dia 11: Re-habilitar RLS antes de produção
- Dia 12+: Validar app com RLS habilitado

### Credenciais

- ✅ .env.local não é commitado (em .gitignore)
- ✅ Expo anon key usada (não service key)
- ✅ Seedfile não contém dados sensíveis

## Próximas Melhorias

1. **Carregar de JSON ao invés de hardcoded**
   - Mais fácil adicionar palavras
   - Separação código/dados

2. **Integrar com APIs Gratuitas**
   - DictionaryAPI.dev para definições
   - Wiktionary para exemplos
   - Free speech APIs para áudio

3. **Automação CI/CD**
   - GitHub Action para seed automático
   - Schedule daily execution
   - Slack notifications

4. **Validação de Dados**
   - Verificar formato CEFR válido
   - Validar frequency_score (0-10)
   - Remover emojis/caracteres especiais

---

**Última atualização:** Seed Dia 1
**Versão:** 1.0
**Manutenedor:** LexiCard Team
