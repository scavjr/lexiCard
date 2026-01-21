# 📱 CHECKLIST VISUAL: Executar Fix no Supabase

## 🎯 Objetivo

Corrigir erro "infinite recursion detected in policy" e fazer "Acertei/Errei" funcionarem

---

## ✅ CHECKLIST - PASSO A PASSO

### 1. PREPARAR

- [ ] Copie o arquivo correto:
  - [ ] `fix_infinite_recursion_COMPLETO.sql` (recomendado)
  - [ ] OU `fix_infinite_recursion_ALTERNATIVO.sql` (se houver erro)

### 2. SUPABASE DASHBOARD

- [ ] Abra: https://app.supabase.com
- [ ] Veja tela inicial com seus projetos
- [ ] Localize projeto **"lexicard"** na lista
- [ ] Clique nele para abrir

### 3. ENTRAR NO SQL EDITOR

Após abrir projeto lexicard:

- [ ] Procure na barra lateral esquerda
- [ ] Clique em **"SQL Editor"** (ícone {})
- [ ] Tela preta com editor aparece

### 4. CRIAR NOVA QUERY

Na tela do SQL Editor:

- [ ] Procure botão **"New Query"** (canto superior)
- [ ] Clique nele
- [ ] Uma aba branca aparece para digitar

### 5. COPIAR E COLAR SQL

- [ ] Abra arquivo: `fix_infinite_recursion_COMPLETO.sql`
- [ ] Selecione TUDO (Ctrl+A)
- [ ] Copie (Ctrl+C)
- [ ] Volte ao Supabase SQL Editor
- [ ] Clique na área branca
- [ ] Limpe conteúdo antigo (se houver)
- [ ] Cole (Ctrl+V)

Deve ficar assim:

```
-- ===================================================================
-- SOLUÇÃO COMPLETA: Corrigir Infinite Recursion RLS
-- ===================================================================

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as policies antigas
DROP POLICY IF EXISTS "Enable select for users in org" ON user_progress;
...
```

### 6. EXECUTAR SQL

- [ ] Procure botão azul **"RUN"** ou ▶️ (canto superior direito)
- [ ] Clique nele
- [ ] Aguarde carregar (10-30 segundos)

### 7. CONFIRMAR SUCESSO

Abaixo do editor, você deve ver:

**ESPERADO ✅:**

```
✅ Success (0ms)
Rows updated: 4
```

E depois uma tabela com:

```
schemaname  tablename      policyname              permissive
postgres    user_progress  user_progress_select    true
postgres    user_progress  user_progress_insert    true
postgres    user_progress  user_progress_update    true
postgres    user_progress  user_progress_delete    true
```

**NÃO ESPERADO ❌:**

- Erro vermelho
- "Syntax error"
- "Permission denied"

Se aparecer erro, tente OPÇÃO 2 ou OPÇÃO 3

### 8. VOLTAR PARA O APP

- [ ] Minimize ou feche aba do Supabase
- [ ] Volta para seu código/terminal
- [ ] Pressione `Ctrl+C` se app estiver rodando
- [ ] Execute: `npm start`
- [ ] Aguarde compilar e abrir no navegador

### 9. LIMPAR CACHE

- [ ] Pressione: `Ctrl+Shift+Delete` (Windows/Linux)
- [ ] OU `Cmd+Shift+Delete` (Mac)
- [ ] Tela de "Clear browsing data" aparece
- [ ] Clique "Clear data"
- [ ] Recarregue página: `F5` ou `Cmd+R`

### 10. TESTAR

- [ ] Navegue até o flashcard no app
- [ ] Vire o card (clique no card)
- [ ] Verso aparece com "Acertei" e "Errei"
- [ ] **CLIQUE EM "ACERTEI"**

### 11. VERIFICAR RESULTADO

Após clicar "Acertei", deve aparecer:

**ESPERADO ✅:**

- Toast verde no topo: `✓ Acertou! (1/3)`
- Sem erros no console
- Card passa para próximo

**NÃO ESPERADO ❌:**

- Toast vermelho: "Erro: infinite recursion"
- Error no console
- Nada acontece

---

## 🔍 TROUBLESHOOTING RÁPIDO

### Se aparecer erro no passo 7:

1. Copie mensagem de erro exata
2. Tente com arquivo alternativo:
   - [ ] Tente `fix_infinite_recursion_ALTERNATIVO.sql`
3. Se ainda falhar:
   - [ ] Siga OPÇÃO 3 (Fix Manual) em `SOLUCAO_3_OPCOES_FIX.md`

### Se funcionou SQL mas app ainda dá erro:

1. [ ] Aguarde 30 segundos (cache Supabase)
2. [ ] Limpe cache: `Ctrl+Shift+Delete`
3. [ ] Recarregue: `F5`
4. [ ] Tente novamente

### Se teste no passo 11 falhar:

1. [ ] Abra console (F12 no navegador)
2. [ ] Procure por erro exacto
3. [ ] Se ainda for 42P17, SQL não funcionou:
   - [ ] Volte para Supabase
   - [ ] Procure policies em "Database" → "user_progress" → "Policies"
   - [ ] Veja se as 4 policies estão lá

---

## 📞 INFORMAÇÕES PARA DEBUG

Se tiver problema, colete:

```
Erro Exato:
[seu erro aqui]

Qual arquivo usou:
[ ] COMPLETO.sql
[ ] ALTERNATIVO.sql
[ ] Manual

Captura de tela:
[envie print do erro]

Project ID Supabase:
[seu ID aqui]
```

---

## ✅ RESUMO EXECUTIVO

```
1. Copie arquivo SQL
2. SQL Editor → New Query
3. Cole e Execute (RUN)
4. Veja ✅ Success
5. npm start
6. Teste "Acertei"
7. Funciona! 🎉
```

---

**Quando terminar todos os passos, avise o resultado! 👍**

Se funcionou: `✅ Pronto para continuar!`
Se não funcinou: `❌ Colete info debug e envie`
