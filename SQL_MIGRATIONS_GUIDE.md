# 🗄️ SQL Migrations - DictionaryAPI.dev + 20-Word System

## 🎯 Objetivo

Adicionar as colunas `examples` e `part_of_speech` à tabela `words_global` para suportar o sistema de 20 palavras com exemplos do DictionaryAPI.dev.

---

## 📋 Migrations Necessárias

### Migration 1: Adicionar Colunas a words_global

**Nome do Arquivo**: `supabase_migrations/[TIMESTAMP]_add_examples_and_part_of_speech.sql`

```sql
-- Adicionar colunas para suportar DictionaryAPI.dev
ALTER TABLE words_global
ADD COLUMN IF NOT EXISTS examples TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(20);

-- Criar índices para otimizar queries
CREATE INDEX IF NOT EXISTS idx_words_global_word
  ON words_global(word);

CREATE INDEX IF NOT EXISTS idx_words_global_cefr
  ON words_global(cefr_level);

-- Comentário documentando as novas colunas
COMMENT ON COLUMN words_global.examples IS 'Array de exemplos de uso da palavra (de DictionaryAPI.dev)';
COMMENT ON COLUMN words_global.part_of_speech IS 'Parte da fala (noun, verb, adjective, etc)';
```

### Migration 2: Otimizar user_progress

**Nome do Arquivo**: `supabase_migrations/[TIMESTAMP]_optimize_user_progress_indexes.sql`

```sql
-- Criar índices críticos para o sistema de 20 palavras
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id
  ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_score
  ON user_progress(score);

-- Índice composto CRÍTICO para query de score < 3
CREATE INDEX IF NOT EXISTS idx_user_progress_user_score
  ON user_progress(user_id, score);

-- Constraint para garantir score válido
ALTER TABLE user_progress
ADD CONSTRAINT IF NOT EXISTS check_score_range
  CHECK (score >= 0);

-- Comentários documentando
COMMENT ON INDEX idx_user_progress_user_score IS 'Índice crítico para loadExerciseSet() - Query: WHERE user_id = ? AND score < 3 LIMIT 20';
```

### Migration 3: Adicionar RLS Policy para Dados

**Nome do Arquivo**: `supabase_migrations/[TIMESTAMP]_add_user_progress_rls.sql`

```sql
-- Habilitar RLS na tabela user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver apenas sua própria progress
CREATE POLICY "Users can see their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuário pode atualizar sua própria progress
CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode inserir sua própria progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer um pode ler words_global (público)
ALTER TABLE words_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Words are public"
  ON words_global FOR SELECT
  USING (true);
```

---

## 🔨 Como Executar as Migrations

### Opção 1: Usar Supabase CLI (Recomendado)

```bash
# 1. Preparar migrations localmente
# Criar arquivo: supabase_migrations/20240115_add_examples_and_part_of_speech.sql
# Copiar conteúdo de Migration 1 acima

# 2. Fazer push para Supabase
supabase db push

# 3. Verificar status
supabase migration list
```

### Opção 2: Executar via Dashboard Supabase

1. Abrir: https://app.supabase.com
2. Selecionar projeto
3. Ir em "SQL Editor"
4. Criar novo script
5. Copiar e colar cada migration
6. Clicar "Run"

### Opção 3: Usar MCP Supabase (Se disponível)

```bash
# Via MCP (Model Context Protocol)
# Executar migration via ferramenta
```

---

## ✅ Validação Pós-Migração

### 1. Validar Schema

```sql
-- Verificar se colunas foram adicionadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'words_global'
ORDER BY column_name;

-- Esperado incluir:
-- examples | ARRAY
-- part_of_speech | character varying
```

### 2. Validar Índices

```sql
-- Listar índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('words_global', 'user_progress')
ORDER BY indexname;

-- Esperado incluir:
-- idx_words_global_word
-- idx_words_global_cefr
-- idx_user_progress_user_score
```

### 3. Validar Dados Existentes

```sql
-- Verificar se dados antigos estão OK
SELECT
  COUNT(*) as total_words,
  COUNT(examples) as words_with_examples,
  COUNT(part_of_speech) as words_with_pos
FROM words_global;

-- Se foi seed dia 1:
-- total_words: ~86
-- words_with_examples: ~86
-- words_with_pos: ~86
```

### 4. Validar RLS

```sql
-- Verificar policies
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename IN ('words_global', 'user_progress')
ORDER BY tablename, policyname;

-- Esperado:
-- user_progress: 3 policies (SELECT, UPDATE, INSERT)
-- words_global: 1 policy (SELECT public)
```

---

## 🧪 Teste Pós-Implementação

### Test 1: Verificar Dados com Examples

```sql
-- Verificar estrutura dos dados após seed
SELECT
  word,
  definition,
  examples,
  part_of_speech,
  audio_url,
  cefr_level
FROM words_global
WHERE examples IS NOT NULL AND array_length(examples, 1) > 0
LIMIT 5;

-- Esperado:
-- word: "hello"
-- examples: ["Hello there!", "Hello, how are you?"]
-- part_of_speech: "interjection" ou "noun"
```

### Test 2: Testar Query de 20 Palavras

```sql
-- Simular query do ExerciseScreen
-- Assumindo user_id = 'test-user-uuid'

SELECT
  wp.word_id,
  wg.word,
  wg.definition,
  wg.examples,
  wp.score
FROM user_progress wp
JOIN words_global wg ON wp.word_id = wg.id
WHERE wp.user_id = 'test-user-uuid'
AND wp.score < 3
LIMIT 20;

-- Esperado: Até 20 linhas com score < 3
```

### Test 3: Teste de Performance

```sql
-- Verificar se índices estão sendo usados
EXPLAIN ANALYZE
SELECT wp.word_id, wg.word, wg.definition
FROM user_progress wp
JOIN words_global wg ON wp.word_id = wg.id
WHERE wp.user_id = 'test-user-uuid'
AND wp.score < 3
LIMIT 20;

-- Esperado: "Bitmap Index Scan" ou "Index Scan" (não "Seq Scan")
```

---

## 🐛 Troubleshooting

### Problema: "Column already exists"

```sql
-- Solução: ALTER TABLE adicionou verificação IF NOT EXISTS
-- Se ainda der erro, verificar:
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'words_global';
```

### Problema: "Index already exists"

```sql
-- Solução: CREATE INDEX usa IF NOT EXISTS
-- Se der erro, remover e recriar:
DROP INDEX IF EXISTS idx_words_global_word;
CREATE INDEX idx_words_global_word ON words_global(word);
```

### Problema: Query de 20 palavras lenta

```sql
-- Verificar se índice está sendo usado
EXPLAIN (FORMAT json)
SELECT wp.word_id
FROM user_progress wp
WHERE wp.user_id = 'test-id'
AND wp.score < 3
LIMIT 20;

-- Se não usar índice, executar ANALYZE
ANALYZE user_progress;
```

### Problema: RLS bloqueando acesso

```sql
-- Verificar se user_id está sendo passado corretamente
-- No Supabase, usar: supabase.auth.user().id

-- Test de RLS:
SELECT * FROM user_progress WHERE user_id = auth.uid();
```

---

## 📝 Ordem de Execução

### Cenário 1: Novo Projeto (Limpo)

```
1. Executar Migration 1 (Adicionar colunas)
2. Executar Migration 2 (Criar índices)
3. Executar Migration 3 (Habilitar RLS)
4. Executar seed script
5. Testar queries
```

### Cenário 2: Projeto com Dados

```
1. Backup do banco (CRÍTICO!)
   pg_dump -U postgres dbname > backup.sql

2. Executar Migration 1 (Adicionar colunas)
   - Não afeta dados existentes (DEFAULT {})

3. Executar Migration 2 (Criar índices)
   - Apenas metadados

4. Executar Migration 3 (Habilitar RLS)
   - CUIDADO: Pode bloquear acesso se policies não forem OK

5. Testar acesso antes de produção
```

---

## 🔄 Rollback (Se Necessário)

### Para desfazer Migration 1:

```sql
ALTER TABLE words_global
DROP COLUMN IF EXISTS examples,
DROP COLUMN IF EXISTS part_of_speech;
```

### Para desfazer Migration 2:

```sql
DROP INDEX IF EXISTS idx_words_global_word;
DROP INDEX IF EXISTS idx_words_global_cefr;
DROP INDEX IF EXISTS idx_user_progress_user_id;
DROP INDEX IF EXISTS idx_user_progress_score;
DROP INDEX IF EXISTS idx_user_progress_user_score;
```

### Para desfazer Migration 3:

```sql
DROP POLICY IF EXISTS "Users can see their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Words are public" ON words_global;

ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE words_global DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist Pré-Produção

- [ ] Backup do banco realizado
- [ ] Migration 1 executada com sucesso
- [ ] Migration 2 executada com sucesso
- [ ] Migration 3 executada (RLS habilitado)
- [ ] Validação de schema confirmada
- [ ] Índices criados e funcionando
- [ ] RLS policies testadas
- [ ] Dados existentes intactos
- [ ] Seed script testado
- [ ] Query de 20 palavras retorna resultado esperado
- [ ] Performance aceitável (< 500ms)
- [ ] Testes em staging antes de produção

---

## 🚀 Próximas Etapas

1. **Aplicar Migrations** (THIS)
2. **Executar Seed Script** (`npm run seed:1k:day1`)
3. **Implementar ExerciseScreen** Frontend
4. **Testar Fluxo Completo** (20 palavras → score tracking)
5. **Deploy para Produção**

---

**Status**: 📝 Ready to Execute
**Última Atualização**: 15 de Janeiro de 2024
**Responsável**: GitHub Copilot

---

## 🔗 Recursos

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/managing-databases)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Query Performance](https://www.postgresql.org/docs/current/sql-explain.html)
