# 📋 Mudança de Modelo: Seed com Carregamento Lazy

**Data:** 22 de janeiro de 2026
**Status:** ✅ Documentado no tasks.md
**Impacto:** Task 1.5 completamente reformulada

---

## 🎯 Resumo da Mudança

**Anterior:** Seed completo com todas as colunas preenchidas via API (86 palavras em ~2h)
**Novo:** Seed leve apenas com coluna 'word' + enriquecimento lazy sob demanda

---

## 📊 Antes vs. Depois

### ANTES (Seed Completo)

```
SEED INICIAL:
├── Lê lista de 1000 palavras
├── Para CADA palavra: chama DictionaryAPI.dev
├── Preenche: definition, audio_url, examples[], part_of_speech, cefr_level
├── Insere TUDO em words_global em 1-2h
└── Resultado: 1000 palavras completas no banco

FLUXO DE EXERCÍCIO:
├── Carrega 20 palavras do banco (já tem tudo)
├── Exibe direto
└── Sem chamadas API adicionais
```

**Desvantagens:**

- ❌ Seed inicial lento (API rate limit)
- ❌ Alto custo computacional no início
- ❌ Problemas com timeouts/erros da API
- ❌ Difícil adicionar mais palavras depois

---

### DEPOIS (Seed Leve + Lazy Loading)

```
SEED INICIAL:
├── Lê lista de N palavras de arquivo externo
├── Insere APENAS na coluna 'word' (NULL nas outras)
├── Executa em segundos
└── Resultado: 10.000 palavras apenas como strings

ENRIQUECIMENTO SOB DEMANDA:
├── Usuário clica "Exercício"
├── Carrega 20 palavras aleatórias
├── Para CADA palavra:
│   ├── 1. Verificar AsyncStorage (offline-first)
│   ├── 2. Se vazio → verificar words_global (se completa)
│   ├── 3. Se vazio → chamar DictionaryAPI.dev (UMA SÓ VEZ)
│   └── 4. UPDATE words_global + cachear localmente
├── Próximas vezes: instantâneo (sem API)
└── Resultado: dados enriquecidos progressivamente
```

**Vantagens:**

- ✅ Seed inicial RÁPIDO (segundos)
- ✅ Sem problemas de rate limit
- ✅ Distribui carga ao longo do tempo
- ✅ Fácil adicionar mais palavras
- ✅ Offline-first funciona
- ✅ Economia de chamadas API (1x por palavra)
- ✅ Performance melhor para usuário (feedback rápido)

---

## 🔄 Fluxo Técnico Detalhado

### Fase 1: SEED INICIAL (npm run seed:init)

```bash
$ npm run seed:init

📂 Ler seeds/words-list.json
  └─ Exemplo: ["hello", "world", "suspicious", ...]

🔄 Para CADA palavra:
  └─ INSERT INTO words_global (word) VALUES ($1)

✅ Resultado:
  | id   | word      | definition | audio_url | examples |
  |------|-----------|------------|-----------|----------|
  | uuid | hello     | NULL       | NULL      | NULL     |
  | uuid | world     | NULL       | NULL      | NULL     |
  | uuid | suspicious| NULL       | NULL      | NULL     |

📊 Logs:
  ✅ 5000 palavras novas inseridas
  ℹ️  0 duplicatas evitadas
  ⏱️  Tempo: 2.3s
```

### Fase 2: EXERCÍCIO (Carregamento Lazy)

```bash
USUÁRIO CLICA "EXERCÍCIO"
  ↓
EXERCISESCREEN CARREGA 20 PALAVRAS
  ↓
SQL: SELECT * FROM words_global
     WHERE id NOT IN (SELECT word_id FROM user_progress WHERE user_id = $1)
     ORDER BY RANDOM() LIMIT 20
  ↓
PARA CADA UMA DAS 20:
  ├─ Chamar getWordData(word, organizationId)
  │
  ├─ NÍVEL 1: AsyncStorage (offline-first)
  │   AsyncStorage.getItem(`words_${orgId}_${word}`)
  │   ✅ Encontrou? → Usar direto (instantâneo, offline)
  │   ❌ Não encontrou? → Ir para nível 2
  │
  ├─ NÍVEL 2: words_global no banco
  │   SELECT * FROM words_global WHERE word = $1
  │   ✅ Tem definition && audio_url? → Cachear em AsyncStorage + usar
  │   ❌ Vazio/incompleto? → Ir para nível 3
  │
  ├─ NÍVEL 3: DictionaryAPI.dev
  │   fetch('https://api.dictionaryapi.dev/api/v2/entries/en/{word}')
  │   ✅ Retorna {definition, audio_url, examples, part_of_speech, cefr_level}
  │   ❌ Erro/timeout? → Usar parcial do banco
  │
  └─ NÍVEL 4: Sincronizar
      UPDATE words_global SET definition=$1, audio_url=$2, ...
      AsyncStorage.setItem(`words_${orgId}_${word}`, data)
      ✅ Pronto para próximas vezes (offline ou online)
```

### Fase 3: REUTILIZAÇÃO

```
EXERCÍCIO 1: "hello"
  └─ Primeira vez → DictionaryAPI.dev → UPDATE banco + AsyncStorage

EXERCÍCIO 2: "world"
  └─ Primeira vez → DictionaryAPI.dev → UPDATE banco + AsyncStorage

EXERCÍCIO 3: "hello" (novamente)
  ├─ AsyncStorage tem dados completos → Usar direto (instantâneo!)
  └─ Sem chamada API

USUÁRIO 2: "hello"
  ├─ AsyncStorage dele vazio
  ├─ words_global.hello já completo (USUÁRIO 1 preencheu)
  ├─ Cachear em seu AsyncStorage
  └─ Sem chamada API (banco já tem)

OFFLINE: USUÁRIO 3
  └─ Desconectar internet
      └─ AsyncStorage tem tudo
      └─ Exercício funciona perfeitamente!
```

---

## 📁 Arquivos a Criar/Modificar

### 1. Arquivo Externo (NOVO)

**Arquivo:** `seeds/words-list.json`

```json
{
  "total": 5000,
  "words": [
    "hello",
    "world",
    "people",
    "water",
    "house",
    "work",
    "school",
    "food",
    "book",
    ...
  ]
}
```

### 2. Script de Seed (NOVO)

**Arquivo:** `scripts/seed-words-initial.js`

```javascript
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedWordsInitial() {
  console.log("📂 Lendo seeds/words-list.json...");
  const data = JSON.parse(fs.readFileSync("seeds/words-list.json", "utf-8"));
  const words = data.words || data;

  console.log(`📊 Total de palavras: ${words.length}`);

  // Preparar batch (máx 1000 por vez)
  const BATCH_SIZE = 500;
  let inserted = 0;
  let duplicates = 0;
  let errors = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const records = batch.map((word) => ({ word: word.toLowerCase() }));

    console.log(
      `\n🔄 Inserindo batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(words.length / BATCH_SIZE)}...`,
    );

    const { data: result, error } = await supabase
      .from("words_global")
      .upsert(records, { onConflict: "word" });

    if (error) {
      console.error("❌ Erro:", error.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(`✅ ${batch.length} palavras processadas`);
    }
  }

  console.log(`\n📊 RESUMO:`);
  console.log(`✅ Inseridas: ${inserted}`);
  console.log(`ℹ️  Duplicatas evitadas: ${duplicates}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`⏱️  Comando: npm run seed:init`);
}

seedWordsInitial().catch(console.error);
```

**Adicionar ao package.json:**

```json
{
  "scripts": {
    "seed:init": "node scripts/seed-words-initial.js"
  }
}
```

### 3. Service de Palavras (MODIFICAR)

**Arquivo:** `src/services/wordService.ts`

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export async function getWordData(
  word: string,
  organizationId: string,
): Promise<IWord> {
  const storageKey = `words_${organizationId}_${word.toLowerCase()}`;

  try {
    // NÍVEL 1: AsyncStorage (offline-first)
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.definition && parsed.audio_url) {
        console.log(`✅ [Cache Local] ${word}`);
        return parsed;
      }
    }
  } catch (error) {
    console.warn(`AsyncStorage read error for ${word}:`, error);
  }

  try {
    // NÍVEL 2: Supabase words_global
    const { data: globalWord } = await supabase
      .from("words_global")
      .select("*")
      .eq("word", word.toLowerCase())
      .single();

    if (globalWord?.definition && globalWord?.audio_url) {
      console.log(`✅ [Banco Completo] ${word}`);
      await AsyncStorage.setItem(storageKey, JSON.stringify(globalWord));
      return globalWord;
    }
  } catch (error) {
    console.warn(`Supabase read error for ${word}:`, error);
  }

  try {
    // NÍVEL 3: DictionaryAPI.dev
    console.log(`🔄 [API] Buscando ${word}...`);
    const apiData = await fetchFromDictionaryAPI(word);

    // NÍVEL 4: Atualizar banco
    console.log(`💾 [Banco] Atualizando ${word}...`);
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
      .eq("word", word.toLowerCase())
      .select()
      .single();

    if (updated) {
      console.log(`✅ [Completo] ${word}`);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    }
  } catch (error) {
    console.error(`❌ Erro ao enriquecer ${word}:`, error);
    // Retornar dados parciais do banco
    const { data: partial } = await supabase
      .from("words_global")
      .select("*")
      .eq("word", word.toLowerCase())
      .single();
    return partial || { word };
  }
}

async function fetchFromDictionaryAPI(word: string): Promise<IWord> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.title === "No Definitions Found") {
    throw new Error(`Word not found: ${word}`);
  }

  const entry = data[0];
  const meaning = entry.meanings?.[0] || {};
  const phonetic = entry.phonetics?.[0] || {};

  return {
    word: entry.word,
    definition: meaning.definitions?.[0]?.definition || "",
    audio_url: phonetic.audio || "",
    examples: meaning.definitions?.[0]?.example
      ? [meaning.definitions[0].example]
      : [],
    part_of_speech: meaning.partOfSpeech || "",
    cefr_level: "A1", // TODO: Implementar lógica de CEFR
  };
}
```

---

## 🧪 Plano de Testes

### Teste 1: Seed Inicial

```bash
npm run seed:init
# Verificar: 5000 palavras em words_global com definition = NULL
# Tempo esperado: < 5 segundos
```

### Teste 2: Exercício (Primeira Vez)

```
Usuário clica "Exercício"
  ├─ Carrega 20 palavras aleatórias
  ├─ Primeira palavra: "hello"
  │   ├─ AsyncStorage vazio
  │   ├─ Banco vazio
  │   ├─ Chama API (lento ~1s)
  │   └─ Cacheia localmente
  ├─ Segunda palavra: "world"
  │   ├─ Mesmo fluxo
  │   └─ Total: ~20s para 20 palavras
  └─ Exercício começa com todos os dados
```

### Teste 3: Exercício (Segunda Vez)

```
Usuário clica "Exercício" novamente
  ├─ Carrega 20 novas palavras aleatórias
  ├─ Algumas que já fez:
  │   ├─ AsyncStorage tem dados
  │   └─ Instantâneo (~50ms)
  ├─ Novas palavras:
  │   ├─ Banco completo (outras orgs já usaram)
  │   └─ Copia para AsyncStorage (~100ms)
  └─ Total: ~5s (90% instantâneo!)
```

### Teste 4: Offline

```
Desabilitar internet
Carregue exercício JÁ INICIADO
  ├─ AsyncStorage funciona
  ├─ Exercício continua normalmente
  └─ Sincroniza quando reconectar
```

---

## 📋 Checklist de Implementação

- [ ] Criar arquivo `seeds/words-list.json` com 5000+ palavras
- [ ] Criar script `scripts/seed-words-initial.js`
- [ ] Adicionar npm script `seed:init` em package.json
- [ ] Modificar `wordService.ts` com 4 níveis
- [ ] Atualizar ExerciseSelector.tsx para chamar getWordData()
- [ ] Testar Seed Inicial (tempo < 5s)
- [ ] Testar Exercício 1x (com API)
- [ ] Testar Exercício 2x (sem API)
- [ ] Testar Offline (AsyncStorage)
- [ ] Validar Lighthouse (performance)
- [ ] Atualizar tasks.md (FEITO ✅)

---

## 💡 Insights & Benefícios

| Aspecto             | Antes        | Depois                    |
| ------------------- | ------------ | ------------------------- |
| **Seed Time**       | 1-2h         | ~5s                       |
| **API Calls**       | 5000         | ~200 (primeiro exercício) |
| **Memory Usage**    | Alto         | Muito Baixo               |
| **Escalabilidade**  | Limitada     | Ilimitada                 |
| **Offline**         | Não          | Sim (AsyncStorage)        |
| **User Experience** | Esperar seed | Feedback instantâneo      |
| **Maintenance**     | Difícil      | Fácil (arquivo JSON)      |

---

## 🚀 Próximos Passos

1. ✅ Documentar mudança (FEITO)
2. ⏳ Criar arquivo `seeds/words-list.json`
3. ⏳ Implementar script de seed
4. ⏳ Modificar `wordService.ts`
5. ⏳ Testar fluxo completo
6. ⏳ Deploy em produção

---

**Status:** 📝 Pronto para implementação
**Estimado:** ~4 horas (implementação + testes)
**Custo:** Gratuito (DictionaryAPI.dev + Supabase)
