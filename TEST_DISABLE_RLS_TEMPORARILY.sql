-- ===================================================================
-- TESTE RÁPIDO: Desabilitar RLS temporariamente
-- Use ISTO apenas para testar se o fluxo funciona sem RLS
-- ===================================================================

-- PASSO 1: Desabilitar RLS na tabela user_progress
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- ✅ AGORA TESTE:
-- - Recarregue o app (F5)
-- - Clique "Acertei"
-- - Deve funcionar sem erro RLS
-- ===================================================================

-- DEPOIS DO TESTE, REABILITAR RLS:
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
