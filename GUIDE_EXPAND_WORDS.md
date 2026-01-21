# 🚀 Guia Rápido: Próximos Passos Seed de Palavras

## Objetivo

Expandir de 86 para 1.000+ palavras para completar Dia 1

## Opção 1: Carregar Automaticamente de API Gratuita (Recomendado)

### Passo 1: Criar script `scripts/expand-word-list.js`

```javascript
#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");

const COMMON_WORDS = [
  // 86 palavras existentes (copy-paste de seed-1k-words.js)
  { word: "hello", definition: "A greeting", cefr: "A1", frequency: 9.8 },
  // ... (adicionar todas as 86 existentes aqui)
];

// Adicionar mais 900+ palavras manualmente do Open English Word Frequency List
const EXTENDED_WORDS = [
  {
    word: "abandon",
    definition: "To leave someone or something completely",
    cefr: "A2",
    frequency: 7.2,
  },
  {
    word: "ability",
    definition: "The power or skill to do something",
    cefr: "A2",
    frequency: 8.5,
  },
  {
    word: "able",
    definition: "Having the power, skill, or means to do something",
    cefr: "A1",
    frequency: 9.1,
  },
  // ... adicionar 900+ palavras
];

const allWords = [...COMMON_WORDS, ...EXTENDED_WORDS];
const jsonPath = path.join(__dirname, "../seeds/words-1k.json");

fs.writeFileSync(jsonPath, JSON.stringify(allWords, null, 2));
console.log(`✓ ${allWords.length} palavras salvas em seeds/words-1k.json`);
```

### Passo 2: Modificar `scripts/seed-1k-words.js`

Trocar:

```javascript
// DE ISTO:
const COMMON_WORDS = [
  { word: "hello", definition: "A greeting", cefr: "A1", frequency: 9.8 },
  // ... 86 hardcoded
];

// PARA ISTO:
const wordsPath = path.join(__dirname, "../seeds/words-1k.json");
const COMMON_WORDS = JSON.parse(fs.readFileSync(wordsPath, "utf-8"));
```

### Passo 3: Executar

```bash
npm run seed:1k:day1
# Resultado esperado: 1.000 palavras inseridas
```

---

## Opção 2: Usar Lista Curada Gratuita

### Recursos Recomendados:

1. **Open English Word List (1.000 palavras mais comuns)**
   - Arquivo: `data/google-10000-english-usa-sorted-by-frequency.txt`
   - Link: https://github.com/first20hours/google-10000-english

2. **Wiktionary Word Frequency List**
   - Link: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/English

3. **CEFR Wordlists**
   - Link: https://www.englishprofile.org/

### Integração:

```bash
# 1. Download da lista
curl -o top-1k-words.txt https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-sorted-by-frequency.txt

# 2. Converter para JSON (criar script converter.js)
# 3. Atualizar seeds/words-1k.json
# 4. Rodar npm run seed:1k:day1
```

---

## Opção 3: Manual Rápido (Hoje)

Se não quiser expandir automaticamente agora, basta:

1. Manter `scripts/seed-1k-words.js` como está (86 palavras)
2. Dia 2, Day 3, etc: Adicionar 100 palavras por dia até 1.000

```bash
# Dia 1: 86 ✅
npm run seed:1k:day1

# Dia 2: +100 = 186
# Editar scripts/seed-1k-words.js, adicionar 100 palavras
npm run seed:1k:day2

# Dia 3: +200 = 386
npm run seed:1k:day3

# ... e assim por diante
```

---

## ✨ Recomendação Final

**Fazer agora (5 minutos):**

1. Expandir `seeds/words-1k.json` com lista curada de 1.000 palavras
2. Modificar script para carregar de JSON
3. Executar uma vez: `npm run seed:1k:day1`
4. Verificar: 1.000+ palavras no Supabase

**Depois continuar:**

- Dias 2-10: Apenas rodar comando diário com novos batches

---

## 📚 Palavras para Copiar-Colar (Primeiras 50 adicionais)

```json
[
  {
    "word": "abandon",
    "definition": "To leave someone completely",
    "cefr": "A2",
    "frequency": 7.2
  },
  {
    "word": "ability",
    "definition": "The power to do something",
    "cefr": "A2",
    "frequency": 8.5
  },
  {
    "word": "able",
    "definition": "Having power to do something",
    "cefr": "A1",
    "frequency": 9.1
  },
  {
    "word": "about",
    "definition": "Concerning; on the subject of",
    "cefr": "A1",
    "frequency": 9.9
  },
  {
    "word": "above",
    "definition": "Higher than",
    "cefr": "A1",
    "frequency": 8.8
  },
  {
    "word": "abroad",
    "definition": "In or to a foreign country",
    "cefr": "A2",
    "frequency": 7.5
  },
  {
    "word": "absence",
    "definition": "The state of being away",
    "cefr": "B1",
    "frequency": 7.8
  },
  {
    "word": "absolute",
    "definition": "Total; complete",
    "cefr": "B2",
    "frequency": 7.2
  },
  {
    "word": "absolutely",
    "definition": "Completely; without doubt",
    "cefr": "B2",
    "frequency": 7.4
  },
  {
    "word": "absorb",
    "definition": "To take in or soak up",
    "cefr": "B2",
    "frequency": 7.1
  },
  {
    "word": "abstract",
    "definition": "Not concrete; theoretical",
    "cefr": "B2",
    "frequency": 7.3
  },
  {
    "word": "absurd",
    "definition": "Ridiculous; unreasonable",
    "cefr": "B2",
    "frequency": 6.9
  },
  {
    "word": "abundance",
    "definition": "A large amount; plenty",
    "cefr": "B1",
    "frequency": 7.6
  },
  {
    "word": "abundant",
    "definition": "Existing in large quantities",
    "cefr": "B1",
    "frequency": 7.5
  },
  {
    "word": "abuse",
    "definition": "To treat with cruelty",
    "cefr": "B1",
    "frequency": 7.3
  },
  {
    "word": "accept",
    "definition": "To agree to take something",
    "cefr": "A2",
    "frequency": 8.9
  },
  {
    "word": "access",
    "definition": "The way to approach something",
    "cefr": "B1",
    "frequency": 8.6
  },
  {
    "word": "accident",
    "definition": "An unexpected event",
    "cefr": "A2",
    "frequency": 8.7
  },
  {
    "word": "accidental",
    "definition": "Happening by chance",
    "cefr": "B1",
    "frequency": 7.4
  },
  {
    "word": "acclaim",
    "definition": "Praise or applause",
    "cefr": "B2",
    "frequency": 6.8
  }
]
```

(Adicionar mais 980 palavras seguindo este padrão)

---

## 🔄 Checklist

- [ ] Decidir entre Opção 1 (automática), 2 (curada), ou 3 (manual lenta)
- [ ] Se Opção 1: Criar script `expand-word-list.js`
- [ ] Se Opção 2: Download + converter lista curada
- [ ] Atualizar `seeds/words-1k.json` com 1.000+ palavras
- [ ] Modificar `seed-1k-words.js` para carregar de JSON
- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: 1.000+ no Supabase
- [ ] Commit: `git add seeds/ scripts/ && git commit -m "feat: expand word list to 1k"`

---

**Tempo estimado:** 30-60 minutos
**Prioridade:** 🔴 ALTA
**Next:** Expandir lista + executar seed + validar
