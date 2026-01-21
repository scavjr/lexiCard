# 📋 Checklist Diário - Seed de Palavras (10 Dias)

## 🎯 Meta Final: 10.000 palavras em words_global

---

## Dia 1 ✅

**Data:** [Data aqui]
**Meta:** 1.000 palavras (ou 86 inicialmente)
**Status:** ✅ CONCLUÍDO

### Executado:

- [x] Criar script `seed-1k-words.js`
- [x] Implementar UPSERT via Supabase
- [x] Adicionar migration (cefr_level, frequency_score)
- [x] Desabilitar RLS
- [x] Executar: `npm run seed:1k:day1`
- [x] Validação: 86 palavras inseridas

### Resultado:

```
Total: 86 palavras
Duplicatas: 0
Status: ✅ Sucesso
```

### Total Acumulado: **86 / 10.000** (0.86%)

---

## Dia 2 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Expandir `seeds/words-1k.json` para 1.000+ palavras
- [ ] Modificar script para carregar de JSON (if needed)
- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar resultado

### Como Executar:

```bash
# 1. (Se aplicável) Expandir palavra list em seeds/words-1k.json
# 2. Executar:
npm run seed:1k:day1

# 3. Validar:
# SELECT COUNT(*) FROM words_global; → Deve estar > 86
```

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 3 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 4 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 5 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 6 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 7 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 8 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 9 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (novo batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) > anterior

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000**

---

## Dia 10 ⏳

**Data:** [Preencher quando executar]
**Meta:** 1.000 palavras (último batch)
**Status:** ⏳ NÃO INICIADO

### Planejado:

- [ ] Executar: `npm run seed:1k:day1`
- [ ] Validar: COUNT(\*) = ~10.000
- [ ] ⚠️ Re-habilitar RLS: `ALTER TABLE words_global ENABLE ROW LEVEL SECURITY;`
- [ ] Testar app com RLS habilitado

### Resultado:

```
Total: _____ palavras
Duplicatas: _____
RLS: ⚠️ RE-HABILITADO
Status: ⏳ Aguardando
```

### Total Acumulado: **\_\_\_\_ / 10.000** ✅

---

## 📊 Resumo Visual do Progresso

```
┌─────────────────────────────────────────────────────────────┐
│         PROGRESSO GERAL - SEED DE PALAVRAS                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Dia 1:   ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  86/10.000│
│ Dia 2:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 3:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 4:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 5:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 6:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 7:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 8:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 9:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│ Dia 10:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/10.000│
│                                                             │
│ TOTAL: 0.86% ████░░░░░░░░░░░░░░░░░░░░░░░░░░░  86/10.000│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Comandos Rápidos

### Executar Seed

```bash
npm run seed:1k:day1
```

### Verificar Contagem

```sql
-- No Supabase SQL Editor:
SELECT COUNT(*) FROM words_global;

-- Distribuição por CEFR:
SELECT cefr_level, COUNT(*) as qtd
FROM words_global
GROUP BY cefr_level;

-- Verificar últimas inseridas:
SELECT word, definition, cefr_level
FROM words_global
ORDER BY created_at DESC
LIMIT 10;
```

### Se der Erro

1. Checar `.env.local` tem credenciais
2. Checar migration foi aplicada
3. Checar RLS status (deve estar disabled)
4. Ver [SEED_TECHNICAL_DOCS.md#tratamento-de-erros](SEED_TECHNICAL_DOCS.md)

---

## 🔑 Pontos-Chave

- **NÃO esquecer de:** Re-habilitar RLS no Dia 10
- **Arquivo de palavras:** `seeds/words-1k.json`
- **Script:** `scripts/seed-1k-words.js`
- **Comando:** `npm run seed:1k:day1`
- **Limite por dia:** Recomendado ~1.000 por batch

---

## 📌 Referências

- [SEED_STATUS.md](SEED_STATUS.md) - Status atual
- [GUIDE_EXPAND_WORDS.md](GUIDE_EXPAND_WORDS.md) - Como expandir
- [SEED_TECHNICAL_DOCS.md](SEED_TECHNICAL_DOCS.md) - Documentação técnica
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Resumo da sessão

---

**Última atualização:** Dia 1
**Status Geral:** 🟡 EM PROGRESSO (0.86% concluído)
**Próxima Ação:** Expandir para 1.000 e executar Dia 2
