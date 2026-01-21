# 🔧 CORRIGIR: Infinite Recursion nas Policies RLS

## ❌ Problema

Ao clicar "Acertei" ou "Errei", recebe erro:

```
{
  "code": "42P17",
  "message": "infinite recursion detected in policy for relation \"users\""
}
```

## 🔍 Causa

A política RLS na tabela `user_progress` estava acessando a tabela `users` para validar a organização, que por sua vez tenta acessar `user_progress`, criando um loop infinito.

**Fluxo problemático:**

```
user_progress.SELECT policy
  ↓
  → tenta acessar users table
    ↓
    → users.SELECT policy
      ↓
      → tenta acessar user_progress
        ↓
        → RECURSÃO INFINITA ❌
```

## ✅ Solução

Usar apenas `auth.uid()` nas policies, sem acessar outras tabelas que têm suas próprias policies.

**Fluxo correto:**

```
user_progress.SELECT policy
  ↓
  → valida auth.uid() = user_id (built-in, sem recursão)
    ↓
    → Acesso permitido ✅
```

---

## 📋 Instruções para Executar

### 1. Acessar Supabase Dashboard

- Vá para: https://app.supabase.com
- Selecione seu projeto lexicard
- Vá para **SQL Editor**

### 2. Executar o SQL Fix

- Copie todo o conteúdo de `fix_infinite_recursion.sql`
- Cole no SQL Editor
- Clique em **RUN** (botão azul)
- Aguarde executar

### 3. Confirmar Execução

```
Query executed successfully
5 rows updated
```

### 4. Testar no App

- Volte para o app
- Clique em "Acertei" ou "Errei" no verso do card
- Deve funcionar sem erros ✅

---

## 🛡️ O que foi corrigido

| Operação | Antes           | Depois            |
| -------- | --------------- | ----------------- |
| SELECT   | ❌ Acessa users | ✅ Usa auth.uid() |
| INSERT   | ❌ Acessa users | ✅ Usa auth.uid() |
| UPDATE   | ❌ Acessa users | ✅ Usa auth.uid() |
| DELETE   | ❌ Acessa users | ✅ Usa auth.uid() |

---

## 📝 Políticas Criadas

```sql
-- SELECT: Usuário vê apenas seu próprio progresso
WHERE auth.uid() = user_id

-- INSERT: Usuário insere apenas para si mesmo
WHERE auth.uid() = user_id

-- UPDATE: Usuário atualiza apenas seu próprio progresso
WHERE auth.uid() = user_id

-- DELETE: Usuário deleta apenas seu próprio progresso
WHERE auth.uid() = user_id
```

---

## 🔐 Observação sobre Multi-tenant

**Versão Atual (Simples):**

- Valida apenas: `auth.uid() = user_id`
- Organization_id é confiável (server-side validation)
- ✅ Soluciona recursão imediata

**Para Produção (Mais Segura):**

- Adicionar validação de `organization_id` via JWT claims
- Usar: `organization_id = auth.jwt() ->> 'org_id'`
- Evita que usuário acesse dados de outra org

**Próximo Passo:** Configurar JWT custom claims no Supabase Auth

---

## ✅ Depois de Executar

1. ✅ Erro "infinite recursion" desaparece
2. ✅ Recordar acertos/erros funciona
3. ✅ Toast de feedback aparece
4. ✅ Progresso é salvo no banco

**Se ainda tiver erro:**

- Limpe cache do browser (Ctrl+Shift+Delete)
- Reinicie o app (npm start)
- Tente novamente
