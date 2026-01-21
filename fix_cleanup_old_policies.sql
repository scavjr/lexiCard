-- ===================================================================
-- LIMPEZA FINAL: Remover as 3 policies antigas que causam recursão
-- ===================================================================

-- REMOVE apenas as policies antigas que estão causando o problema
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;

-- ===================================================================
-- ✅ PRONTO! Agora só as 4 policies novas (sem recursão) estão ativas
-- ===================================================================
