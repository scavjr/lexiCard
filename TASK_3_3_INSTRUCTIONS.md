# 🚀 Task 3.3: Autenticação Supabase - Instruções Implementação

## ✅ O que foi criado:

### 1. **Telas de Login/Signup**

- [LoginScreen.tsx](src/screens/LoginScreen.tsx) - Email + Senha
- [SignUpScreen.tsx](src/screens/SignUpScreen.tsx) - Registro + Seleção Organização

### 2. **AuthContext**

- [AuthContext.tsx](src/store/AuthContext.tsx) - Gerencia sessão + organização
- Persiste no AsyncStorage
- Escuta mudanças de autenticação

### 3. **App.tsx Atualizado**

- Integrado com AuthProvider
- Navega automaticamente: Login → App ou Signup
- Passa `userId` e `organizationId` para FlashCardDemo

### 4. **Migration SQL**

- Arquivo: [supabase_migrations/user_organizations.sql](supabase_migrations/user_organizations.sql)
- Cria tabela `user_organizations` (many-to-many entre users e organizations)
- RLS policies integradas

---

## 📋 Próximos Passos:

### 1. **Executar Migration SQL no Supabase**

No **SQL Editor** do Supabase:

```sql
-- Cole todo o conteúdo de: supabase_migrations/user_organizations.sql
-- Execute! ✅
```

### 2. **Regenerar Tipos Supabase**

Terminal:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 3. **Criar Usuários de Teste**

No **Supabase Auth Dashboard**:

- Email: `user1@test.com` | Senha: `test123456`
- Email: `user2@test.com` | Senha: `test123456`

### 4. **Criar Organização de Teste**

No **Supabase Studio** → Tabela `organizations`:

- Insira uma org: `{ id: UUID, name: "Test Org", ... }`
- Copie o ID da organização

### 5. **Associar Usuário à Organização**

Manual (para teste):

```sql
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES ('USER_ID_FROM_AUTH', 'ORG_ID', 'member');
```

Ou deixar que o SignUp faça automaticamente.

---

## 🧪 Fluxo de Teste Completo:

### Teste 1: Signup

```
1. F5 (recarregar app)
2. Clique "Criar Conta"
3. Email: user1@test.com
4. Senha: test123456
5. Confirmar: test123456
6. Selecionar organização
7. Clique "Cadastrar"
8. ✅ Deve ver Flash Card demo
```

### Teste 2: Login

```
1. Logout (implementar botão depois)
2. Clique "Entrar"
3. Email: user1@test.com
4. Senha: test123456
5. ✅ Deve ver Flash Card demo com dados salvos
```

### Teste 3: Feedback & Scoring

```
1. Clique "Acertei"
2. ✅ Toast verde (sem erro RLS!)
3. Verificar Supabase → user_progress table
4. Deve ter registrado a progressão com user_id real
```

---

## ⚙️ Configuração Importante:

### Banco de Dados Requerido:

```
📊 Supabase Tables:
├── organizations (existente)
├── users (auth.users - automático)
├── user_organizations (NOVA - criar com migration)
├── user_progress
├── words
├── words_global
└── flashcard_sessions
```

### RLS Status:

- ✅ user_organizations: Policies criadas (select/insert/update/delete)
- ✅ user_progress: Policies corrigidas (sem recursão)
- ✅ Escalação: Users autenticados usam auth.uid() para validação

---

## 🐛 Troubleshooting:

### Erro: "Usuário não está associado a nenhuma organização"

- **Causa:** Tabela `user_organizations` vazia para este usuário
- **Solução:** Usar SignUp (cria associação) ou inserir manualmente

### Erro: "Cannot read property 'organization_id'"

- **Causa:** Migration não executada
- **Solução:** Rodar SQL em Supabase SQL Editor

### RLS Error 42501 (new row violates...)

- **Causa:** auth.uid() não corresponde ao user_id
- **Solução:** Usuário deve estar autenticado (usar SignUp/Login real)

---

## ✨ Resultado Final:

Após este fluxo, o sistema estará:

- ✅ Tela de Login/Signup funcional
- ✅ Autenticação Supabase Auth integrada
- ✅ Persistência de sessão e organização
- ✅ RLS sem erros (usando auth.uid() real)
- ✅ Pronto para Task 3.2 (PWA configuration)

**Status: TASK 3.3 IMPLEMENTADA ✅**
