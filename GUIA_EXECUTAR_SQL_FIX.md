# 🔧 GUIA COMPLETO: Executar SQL Fix no Supabase

## ⚠️ Seu Sistema Ainda Tem o Erro

Se está vendo:

```
[recordCorrect] Error: ⚠️ Erro de configuração no servidor
Política de segurança do banco de dados precisa de ajuste
```

Significa que o SQL Fix **ainda não foi executado** ou **não funcionou completamente**.

---

## 📋 Instruções PASSO-A-PASSO

### Passo 1️⃣: Acessar Supabase Dashboard

1. Abra seu navegador
2. Vá para: **https://app.supabase.com**
3. Faça login com sua conta

### Passo 2️⃣: Selecionar Projeto LexiCard

1. Na tela inicial, procure por **"lexicard"**
2. Clique para abrir o projeto
3. Aguarde carregar

### Passo 3️⃣: Abrir SQL Editor

Na barra lateral esquerda:

- Procure por **SQL Editor** (ícone `{}`)
- Clique nele

Deve abrir a tela de SQL Query

### Passo 4️⃣: Criar Nova Query

Na tela do SQL Editor:

- Clique em botão **"New Query"** (canto superior)
- Uma aba branca em branco vai aparecer

### Passo 5️⃣: Copiar e Colar SQL

**Copie TUDO** deste arquivo:

```
fix_infinite_recursion_COMPLETO.sql
```

(Está na raiz do projeto)

**Cole no SQL Editor** que abriu

Deve ficar assim:

```
┌─────────────────────────────────────┐
│  SQL Editor                         │
├─────────────────────────────────────┤
│ -- ===== FIX COMPLETO =====        │
│ ALTER TABLE user_progress...       │
│ DROP POLICY IF EXISTS...           │
│ CREATE POLICY...                   │
│ ...                                 │
│ (todo o conteúdo do arquivo)       │
└─────────────────────────────────────┘
```

### Passo 6️⃣: Executar SQL

No canto superior direito:

- Você vai ver um botão azul com **"Run"** ou play ▶️
- **Clique nele**

### Passo 7️⃣: Aguardar Resultado

Abaixo vai aparecer:

```
✅ Success (0ms)
Rows updated: 4
```

Ou pode aparecer warnings (amarelo) - **isso é normal**, ignore.

O importante é NÃO aparecer erro vermelho ❌

### Passo 8️⃣: Confirmar no Console

Na aba abaixo da query, você verá a table:

```
schemaname | tablename      | policyname           | permissive | ...
postgres   | user_progress  | user_progress_select | true       | ...
postgres   | user_progress  | user_progress_insert | true       | ...
postgres   | user_progress  | user_progress_update | true       | ...
postgres   | user_progress  | user_progress_delete | true       | ...
```

Se aparecerem essas 4 policies **sem recursão**, funcionou! ✅

---

## 🧪 Testar Após Executar

1. **Volte para o seu código**
2. **No terminal:** Pressione `Ctrl+C` para parar
3. **Rode:** `npm start`
4. **No navegador:** Recarregue a página (F5)
5. **Teste:** Clique em "Acertei" ou "Errei" no card
6. **Resultado:** Deve funcionar sem erro! ✅

---

## 🔍 Verificar o Que Foi Feito

**Se tudo funcionou:**

- ✅ Policies antigas removidas (tinham recursão)
- ✅ RLS desabilitado e reabilitado (reset completo)
- ✅ 4 policies novas criadas (sem recursão)
- ✅ Clique em "Acertei" agora funciona

---

## 📸 Screenshots de Ajuda

### Local do SQL Editor

```
Supabase Dashboard
├── Project: lexicard
├── [SQL Editor] ← CLIQUE AQUI
│   ├── New Query
│   ├── [Query results here]
│   └── ▶️ RUN button
└── [Other menus]
```

### Após Executar

```
Query successful

schemaname  tablename       policyname              permissive
postgres    user_progress   user_progress_select    true
postgres    user_progress   user_progress_insert    true
postgres    user_progress   user_progress_update    true
postgres    user_progress   user_progress_delete    true
```

---

## 🆘 Se Não Funcionar

### Cenário 1: Aparecer erro vermelho no SQL

- **Copie a mensagem de erro exata**
- Tente remover a primeira seção (`ALTER TABLE DISABLE...`)
- Execute novamente

### Cenário 2: Executou mas erro continua

- Aguarde **2 minutos** (cache do Supabase)
- Limpe cache do navegador: `Ctrl+Shift+Delete`
- Recarregue: `F5`
- Tente novamente

### Cenário 3: Ainda não funciona

- Envie screenshot do erro
- Informações:
  - Qual projeto Supabase está usando?
  - Qual é o UUID do user logado? (no console)
  - Qual é o UUID da organization? (no console)

---

## ✅ Checklist Final

Depois de executar, confirme:

- [ ] Acessei https://app.supabase.com
- [ ] Selecionei projeto "lexicard"
- [ ] Cliquei em "SQL Editor"
- [ ] Copiei TODO o arquivo `fix_infinite_recursion_COMPLETO.sql`
- [ ] Colei no SQL Editor
- [ ] Cliquei em "Run"
- [ ] Recebi mensagem "Success"
- [ ] Vi as 4 policies listadas (user_progress_select, etc)
- [ ] Voltei para o app e cliquei em "Acertei"
- [ ] **FUNCIONOU!** ✅

---

## 🎉 Depois que Funcionar

- Toast verde com "✓ Acertou!" vai aparecer
- Progresso vai ser salvo no banco
- Dados vão sincronizar com Supabase
- Tudo normal! 🚀

---

**Confirme quando terminar os passos! 👍**
