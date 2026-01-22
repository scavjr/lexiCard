# 📚 Migração de vocal.txt para words_global

**Data:** 22 de janeiro de 2026  
**Status:** ✅ Pronto para executar  
**Total de palavras:** 1.414 (de vocal.txt)

---

## 🎯 O que foi feito

### 1. ✅ Arquivo JSON criado

- **Arquivo:** `seeds/words-list.json`
- **Total:** 1.414 palavras únicas
- **Formato:** JSON estruturado com source e metadata
- **Conteúdo:** Lista de palavras (todas lowercase)

### 2. ✅ Script de seed criado

- **Arquivo:** `scripts/seed-words-initial.js`
- **Função:** Migrar palavras de JSON para Supabase
- **Estratégia:** UPSERT (insere ou ignora duplicatas)
- **Batch:** 500 palavras por vez

### 3. ✅ npm script adicionado

- **Comando:** `npm run seed:init`
- **Função:** Executar migração

---

## 🚀 Como executar

### Pré-requisito

Certifique-se de que `.env.local` tem as credenciais:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Executar seed

```bash
npm run seed:init
```

### Saída esperada

```
🚀 Iniciando seed de palavras para words_global...

📂 Carrendoing seeds/words-list.json...
📊 Total de palavras: 1414

🔍 Verificando palavras existentes...
✅ Palavras existentes: 0
✨ Palavras novas para inserir: 1414

🔄 Inserindo em batches de 500...

   Batch 1/3: ✅ 500 palavras
   Batch 2/3: ✅ 500 palavras
   Batch 3/3: ✅ 414 palavras

==================================================
📊 RESUMO DA EXECUÇÃO:
==================================================
✅ Inseridas: 1414
❌ Erros: 0
💾 Tabela: words_global
📝 Colunas preenchidas: word
⏳ Colunas vazias: definition, audio_url, examples, part_of_speech, cefr_level
📌 Próximo: Enriquecimento sob demanda via DictionaryAPI.dev
==================================================
```

---

## 📊 Estrutura criada em words_global

### Após o seed

```sql
SELECT * FROM words_global LIMIT 5;

id                | word          | definition | audio_url | examples | part_of_speech | cefr_level
------------------+---------------+------------|-----------|----------|----------------|----------
uuid-1            | a             | NULL       | NULL      | NULL     | NULL           | NULL
uuid-2            | a lot         | NULL       | NULL      | NULL     | NULL           | NULL
uuid-3            | a lot of      | NULL       | NULL      | NULL     | NULL           | NULL
uuid-4            | about         | NULL       | NULL      | NULL     | NULL           | NULL
uuid-5            | add           | NULL       | NULL      | NULL     | NULL           | NULL
...               | ...           | ...        | ...       | ...      | ...            | ...
```

### Após primeiro exercício (lazy loading)

```sql
SELECT * FROM words_global WHERE word = 'apple';

id                | word   | definition                  | audio_url                              | examples                           | part_of_speech | cefr_level
------------------+--------+-----------------------------+----------------------------------------+------------------------------------+----------------|-----------
uuid-19           | apple  | A round fruit with red...   | https://api.dict.dev/.../apple-us.mp3 | ["I like to eat an apple", ...]  | noun           | A1
```

---

## 🔄 Fluxo completo

### Fase 1: SEED (Agora!)

```
npm run seed:init
  ↓
1.414 palavras inseridas em words_global (coluna word)
  ↓
Todas as outras colunas: NULL
  ↓
⏱️  Tempo: ~5-10 segundos
```

### Fase 2: EXERCÍCIO (Lazy Loading)

```
Usuário clica "Exercício"
  ↓
Carrega 20 palavras aleatórias
  ↓
Para cada palavra:
  ├─ Verificar AsyncStorage (vazio)
  ├─ Verificar words_global (definition é NULL)
  ├─ Chamar DictionaryAPI.dev (UMA VEZ)
  ├─ UPDATE words_global com dados
  └─ Cachear em AsyncStorage
  ↓
Próximas vezes: Instantâneo (sem API)
```

---

## ✅ Próximos passos

1. **Executar:** `npm run seed:init`
2. **Verificar:** Supabase Dashboard → words_global → ver 1.414 palavras
3. **Testar:** Iniciar exercício e validar lazy loading
4. **Monitorar:** AsyncStorage cache funcionando

---

## 📝 Notas importantes

- ✅ **Deduplicação:** Script usa UPSERT, portanto palavras duplicadas são ignoradas
- ✅ **Lowercase:** Todas as palavras são convertidas para lowercase
- ✅ **Vazio seguro:** Se executar novamente, não duplica (UPSERT)
- ✅ **Offline:** AsyncStorage permite funcionar sem internet
- ⏳ **Enriquecimento:** Acontece sob demanda durante exercícios

---

## 🐛 Troubleshooting

### Erro: "EXPO_PUBLIC_SUPABASE_URL não configurado"

**Solução:** Adicionar em `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Erro: "Arquivo não encontrado"

**Solução:** Confirmar que `seeds/words-list.json` existe

### Erro: "words_global table does not exist"

**Solução:** Executar migrations Task 1.4 primeiro

### Lentidão no seed

- Normal: ~5-10 segundos para 1.414 palavras
- Se demorar muito: Verificar conexão internet

---

## 📊 Estatísticas

| Métrica                  | Valor                                                           |
| ------------------------ | --------------------------------------------------------------- |
| **Palavras**             | 1.414                                                           |
| **Arquivo JSON**         | ~45 KB                                                          |
| **Seed Time**            | ~5-10s                                                          |
| **Duplicatas removidas** | 0                                                               |
| **Colunas preenchidas**  | 1 (word)                                                        |
| **Colunas vazias**       | 5 (definition, audio_url, examples, part_of_speech, cefr_level) |

---

**Status:** ✅ Pronto para executar `npm run seed:init`
