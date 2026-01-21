# ⚠️ SOLUÇÃO: Erro de UUID Inválido

## ❌ Erro Recebido

```
invalid input syntax for type uuid: "demo-user-123"
```

## 🔍 Causa

A coluna `user_id` na tabela `user_progress` espera um UUID válido, mas estávamos usando `demo-user-123` (string arbitrária).

---

## ✅ SOLUÇÃO RÁPIDA (Já Implementada)

Atualizei `FlashCard.demo.tsx` para usar UUIDs válidos:

```typescript
const demoUserId = "550e8400-e29b-41d4-a716-446655440000";
const demoOrganizationId = "550e8400-e29b-41d4-a716-446655440001";
```

Estes são UUIDs válidos para teste.

---

## 🧪 Testar Agora

1. **Terminal:** `npm start`
2. **Browser:** F5 (recarregar)
3. **Clique "Acertei"** no card

### Resultado Esperado

- ✅ Toast verde: `✓ Acertou! (1/3)`
- ✅ Sem erro 400 Bad Request
- ✅ Progresso salvo no banco

---

## 📝 Nota Importante

**Para produção:** Use autenticação real do Supabase Auth

```typescript
// Em vez de:
const demoUserId = "550e8400-...";

// Use:
const {
  data: { user },
} = await supabase.auth.getUser();
const userId = user?.id; // UUID real do usuário autenticado
```

Assim o `auth.uid()` na policy RLS vai validar corretamente.

---

**Teste agora! Deve funcionar! 👍**
