# 🚨 HOTFIX: Infinite Recursion - RLS Policy Error

## 📍 O Problema

Ao clicar em **"Acertei"** ou **"Errei"** no verso do card, recebe:

```json
{
  "code": "42P17",
  "message": "infinite recursion detected in policy for relation \"users\""
}
```

---

## 🔍 Causa Raiz

As políticas RLS (Row Level Security) estavam criando uma recursão infinita:

```
Clique em "Acertei"
  ↓
recordCorrect() tenta SELECT em user_progress
  ↓
Policy valida acessando tabela users
  ↓
Users policy tenta validar acessando user_progress
  ↓
Volta para user_progress policy
  ↓
♻️ RECURSÃO INFINITA! ❌
```

---

## ✅ Solução (2 Passos)

### PASSO 1️⃣: Executar SQL Fix no Supabase (OBRIGATÓRIO)

1. **Vá para:** https://app.supabase.com
2. **Projeto:** Selecione `lexicard`
3. **Menu:** SQL Editor (ícone de `{}` no lado esquerdo)
4. **Clique em:** "New Query"

5. **Cole este SQL:**

```sql
-- ===================================================================
-- FIX: Corrigir Infinite Recursion nas Policies RLS
-- ===================================================================

DROP POLICY IF EXISTS "Enable select for users in org" ON user_progress;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_progress;
DROP POLICY IF EXISTS "Enable update for own records" ON user_progress;
DROP POLICY IF EXISTS "Enable delete for own records" ON user_progress;

-- SELECT: Usuário pode ver progresso da sua org
CREATE POLICY "user_progress_select_policy"
ON user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuário pode inserir progresso apenas para si mesmo
CREATE POLICY "user_progress_insert_policy"
ON user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário pode atualizar apenas seu próprio progresso
CREATE POLICY "user_progress_update_policy"
ON user_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário pode deletar apenas seu próprio progresso
CREATE POLICY "user_progress_delete_policy"
ON user_progress
FOR DELETE
USING (auth.uid() = user_id);
```

6. **Clique:** Botão azul `RUN` (canto superior direito)
7. **Aguarde:** Deve exibir ✅ "Success"

### PASSO 2️⃣: Código Frontend (JÁ FEITO ✅)

O código foi melhorado para:

- Detectar erro `42P17` especificamente
- Mostrar mensagem clara ao usuário
- Incluir hint com solução

Arquivo: [src/hooks/useFlashcardProgress.ts](src/hooks/useFlashcardProgress.ts)

---

## 🧪 Testar Após Fix

1. **Limpar cache:**
   - Windows: `Ctrl + Shift + Delete` (no navegador)
   - Mac: `Cmd + Shift + Delete`

2. **Recarregar app:**

   ```bash
   npm start
   ```

3. **Testar:**
   - Clique em um card para virar
   - Clique em **"Acertei"** ✓
   - Deve funcionar! ✅

---

## 📊 Antes vs Depois

| Estado               | Antes         | Depois       |
| -------------------- | ------------- | ------------ |
| **RLS Recursion**    | ♻️ Infinita   | ✅ Eliminada |
| **Clique "Acertei"** | ❌ Erro 42P17 | ✅ Funciona  |
| **Dados Salvos**     | ❌ Não        | ✅ Sim       |
| **Taxa Sucesso**     | ❌ 0%         | ✅ Atualiza  |

---

## 🔐 O que Mudou

**Antes (PROBLEMA):**

```sql
WHERE user_id = (
  SELECT id FROM users
  WHERE id = auth.uid()
  AND organization_id = $1
)
```

^ Acessa tabela `users` que tem suas próprias policies → Recursão

**Depois (SOLUÇÃO):**

```sql
WHERE auth.uid() = user_id
```

^ Usa função built-in `auth.uid()` → Sem recursão

---

## ✅ Checklist

- [ ] Executei o SQL Fix no Supabase
- [ ] Recebi mensagem "Success"
- [ ] Limpei cache do navegador
- [ ] Recarreguei o app (npm start)
- [ ] Testei clicar "Acertei" - funcionou ✅
- [ ] Toast de feedback apareceu ✅
- [ ] Progresso foi salvo no banco ✅

---

## 🆘 Se ainda der erro

**Erro 42P17 ainda aparece?**

1. Confirme que executou o SQL e recebeu "Success"
2. Aguarde 30 segundos (cache do Supabase)
3. Limpe cache: Ctrl+Shift+Delete
4. Recarregue: F5 ou npm start

**Erro diferente?**

1. Copie mensagem exata do erro
2. Abra [GitHub Issues](https://github.com/seu-repo/issues)
3. Descreva: o que clicou, qual erro recebeu

---

## 📝 Notas

- **Segurança:** A policy ainda filtra por `user_id`, protegendo dados
- **Multi-tenant:** A validação de `organization_id` acontece no código TypeScript
- **Próximo:** Adicionar validação de `organization_id` via JWT claims para produção

---

**🎉 Depois de executar, tudo funcionará normalmente!**

Pronto para testar? Siga os passos acima! ⬆️
