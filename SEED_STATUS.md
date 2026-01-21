# 📊 Status do Seed de Palavras - LexiCard

## 🎯 Objetivo

Popular banco de dados `words_global` com 10.000 palavras em inglês

## ✅ Dia 1 - Completo

**Data:** Hoje
**Palavras Adicionadas:** 86/1.000
**Status:** ✅ Sucesso
**Erros:** 0
**Duplicatas:** 0

### O que foi feito:

1. ✅ Script criado: `scripts/seed-1k-words.js`
2. ✅ Migration aplicada (cefr_level + frequency_score)
3. ✅ RLS desabilitada temporariamente
4. ✅ 86 palavras curadas com estrutura completa
5. ✅ Comando npm configurado: `npm run seed:1k:day1`
6. ✅ Supabase upsert funcionando perfeitamente

### Arquivos Criados/Modificados:

| Arquivo                    | Status        | Propósito                                   |
| -------------------------- | ------------- | ------------------------------------------- |
| `scripts/seed-1k-words.js` | ✅ Criado     | Script principal de seed                    |
| `seeds/words-1k.json`      | ✅ Criado     | Template com 30 palavras (expandir para 1k) |
| `package.json`             | ✅ Atualizado | Script `seed:1k:day1` adicionado            |
| `.env.local`               | ✅ Existe     | Credenciais Supabase presentes              |
| `tasks.md`                 | ✅ Atualizado | Task 1.5 marcada com progresso              |

## 🔄 Próximos Passos (Dias 2-10)

### Fase 1: Expandir Lista de Palavras (Hoje/Amanhã)

```bash
# Opção 1: Usar gerador de API (recomendado)
npm run seed:1k:expand  # Adiciona 914 palavras para completar 1.000

# Opção 2: Manual - Editar seeds/words-1k.json
# Adicionar 970 palavras restantes (formato JSON já existe)
```

### Fase 2: Executar Seed Completo

```bash
npm run seed:1k:day1   # Insere 1.000 palavras
# Esperado: "✓ Batch 1: 1.000 palavras inseridas"
```

### Fase 3: Dias 2-10 (Automação)

```bash
# Repetir comando acima para cada dia
# Total esperado após 10 dias: 10.000 palavras
```

## 🛠️ Configuração Atual

### Estrutura de Palavra

```json
{
  "word": "string",
  "definition": "string",
  "audio_url": "null (por enquanto)",
  "cefr_level": "A1-C2",
  "frequency_score": "0.0-10.0"
}
```

### Banco de Dados

- **Tabela:** `words_global`
- **Colunas:** word (UNIQUE), definition, audio_url, cefr_level, frequency_score, timestamps
- **Índices:** idx_words_global_cefr, idx_words_global_frequency
- **RLS:** ❌ DESABILITADO (re-habilitar antes de produção)

### Script

```javascript
// Location: scripts/seed-1k-words.js
// Carrega: Array COMMON_WORDS com 86 palavras
// Processa: Deduplicação automática
// Insere: Via Supabase upsert (onConflict: "word")
// Log: Detalhado com quantidade e erros
```

## ⚠️ Importante: Segurança

### RLS Status: DESABILITADO

```sql
ALTER TABLE words_global DISABLE ROW LEVEL SECURITY;
```

**Ação necessária antes de produção:**

```sql
ALTER TABLE words_global ENABLE ROW LEVEL SECURITY;
```

## 📈 Progresso Geral

```
Dia 1:  86 palavras   ✅
Dia 2:  1.000 palavras ⏳
Dia 3:  2.000 palavras ⏳
Dia 4:  3.000 palavras ⏳
Dia 5:  4.000 palavras ⏳
Dia 6:  5.000 palavras ⏳
Dia 7:  6.000 palavras ⏳
Dia 8:  7.000 palavras ⏳
Dia 9:  8.000 palavras ⏳
Dia 10: 10.000 palavras ⏳

Total: 86/10.000 (0.86%) ✅
```

## 🔗 Referências

- **Task:** [Task 1.5 em tasks.md](tasks.md#-task-15-seed-de-10k-palavras-1000-por-dia)
- **Script:** [seed-1k-words.js](scripts/seed-1k-words.js)
- **Templates:** [seeds/words-1k.json](seeds/words-1k.json)
- **Dashboard Supabase:** https://app.supabase.com/

## 💡 Próximo Que Fazer

**Prioridade Máxima:**

1. Expandir `seeds/words-1k.json` com 970 palavras adicionais
2. Modificar script para carregar de JSON ao invés de hardcoded array
3. Executar `npm run seed:1k:day1` para inserir 1.000 palavras
4. Validar no Supabase: 1.086 palavras total

**Depois:** 5. Automatizar para dias 2-10 6. Re-habilitar RLS antes de produção 7. Testar app com RLS habilitado

---

**Última atualização:** Dia 1 - Seed Inicial
**Status:** 🟡 EM PROGRESSO
