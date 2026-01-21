-- ===================================================================
-- SOLUÇÃO ALTERNATIVA: Usar Função PL/pgSQL sem Recursão
-- Execute ISSO se o fix anterior não funcionar
-- ===================================================================

-- PASSO 1: Desabilitar RLS enquanto criamos a função
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as policies antigas
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

-- PASSO 3: Criar função auxiliar para validação (STABLE = sem recursão)
CREATE OR REPLACE FUNCTION check_user_access(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() = user_id_param;
$$;

-- PASSO 4: Reabilitar RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar policies usando a função (que não causa recursão)
CREATE POLICY "user_progress_select_v2"
ON user_progress
FOR SELECT
TO authenticated
USING (check_user_access(user_id));

CREATE POLICY "user_progress_insert_v2"
ON user_progress
FOR INSERT
TO authenticated
WITH CHECK (check_user_access(user_id));

CREATE POLICY "user_progress_update_v2"
ON user_progress
FOR UPDATE
TO authenticated
USING (check_user_access(user_id))
WITH CHECK (check_user_access(user_id));

CREATE POLICY "user_progress_delete_v2"
ON user_progress
FOR DELETE
TO authenticated
USING (check_user_access(user_id));

-- ===================================================================
-- ✅ FIM DO FIX - EXECUTE ISTO ACIMA TUDO
-- ===================================================================
