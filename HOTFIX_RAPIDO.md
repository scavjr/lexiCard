# 🚨 HOTFIX EXECUTIVO - Infinite Recursion Error

## ❌ ERRO QUE VOCÊ ESTÁ RECEBENDO

```
[recordCorrect] Error:
Erro de configuração no servidor
Política de segurança do banco de dados precisa de ajuste
Execute 'fix_infinite_recursion.sql' no Supabase SQL Editor
```

---

## ✅ SOLUÇÃO RÁPIDA (2 MINUTOS)

### 1. Abra Supabase Dashboard

```
https://app.supabase.com → Projeto "lexicard"
```

### 2. Vá para SQL Editor

```
Menu esquerdo → SQL Editor → New Query
```

### 3. Cole Este SQL

```sql
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable select for users in org" ON user_progress;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_progress;
DROP POLICY IF EXISTS "Enable update for own records" ON user_progress;
DROP POLICY IF EXISTS "Enable delete for own records" ON user_progress;
DROP POLICY IF EXISTS "user_progress_select_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_delete_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_select" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update" ON user_progress;
DROP POLICY IF EXISTS "user_progress_delete" ON user_progress;
DROP POLICY IF EXISTS "user_progress_select_v2" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert_v2" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update_v2" ON user_progress;
DROP POLICY IF EXISTS "user_progress_delete_v2" ON user_progress;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "up1" ON user_progress FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "up2" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "up3" ON user_progress FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "up4" ON user_progress FOR DELETE TO authenticated USING (auth.uid()::text = user_id::text);
```

### 4. Clique RUN (botão azul)

```
Aguarde ✅ Success
```

### 5. Teste

```
npm start → Clique "Acertei" → Funciona! ✅
```

---

## 📄 ARQUIVOS DE REFERÊNCIA

Se acima não funcionar:

- `fix_infinite_recursion_COMPLETO.sql` - Opção completa
- `fix_infinite_recursion_ALTERNATIVO.sql` - Opção alternativa com função
- `SOLUCAO_3_OPCOES_FIX.md` - 3 opções completas
- `CHECKLIST_VISUAL_FIX.md` - Guia visual passo-a-passo
- `GUIA_EXECUTAR_SQL_FIX.md` - Guia detalhado

---

## ⏱️ TEMPO TOTAL

- SQL: 30 segundos
- Recarregar app: 20 segundos
- Testar: 10 segundos
- **TOTAL: 1 minuto** ⏱️

---

## 🎉 DEPOIS QUE FUNCIONAR

- Toast verde aparece
- Progresso é salvo
- Tudo funciona normalmente

---

**FAÇA AGORA: Vá para Supabase, copie/cole o SQL e clique RUN! 👆**

Depois testa e avisa o resultado 👍
