-- ===================================================================
-- SOLUÇÃO COMPLETA: Corrigir Infinite Recursion RLS
-- Executar COMPLETO em sequência
-- ===================================================================

-- PASSO 1: Desabilitar RLS temporariamente (se necessário)
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as policies antigas que causam problema
DROP POLICY IF EXISTS "Enable select for users in org" ON user_progress;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_progress;
DROP POLICY IF EXISTS "Enable update for own records" ON user_progress;
DROP POLICY IF EXISTS "Enable delete for own records" ON user_progress;
DROP POLICY IF EXISTS "user_progress_select_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update_policy" ON user_progress;
DROP POLICY IF EXISTS "user_progress_delete_policy" ON user_progress;

-- PASSO 3: Reabilitar RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar NOVAS policies sem recursão
-- Essas policies usam APENAS auth.uid() - built-in function sem recursão

-- Policy SELECT: Ver apenas seu próprio progresso
CREATE POLICY "user_progress_select"
ON user_progress
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = user_id::text
);

-- Policy INSERT: Inserir apenas seu próprio progresso
CREATE POLICY "user_progress_insert"
ON user_progress
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id::text
);

-- Policy UPDATE: Atualizar apenas seu próprio progresso
CREATE POLICY "user_progress_update"
ON user_progress
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = user_id::text
)
WITH CHECK (
  auth.uid()::text = user_id::text
);

-- Policy DELETE: Deletar apenas seu próprio progresso
CREATE POLICY "user_progress_delete"
ON user_progress
FOR DELETE
TO authenticated
USING (
  auth.uid()::text = user_id::text
);

-- ===================================================================
-- VERIFICAÇÃO: Listar todas as policies atuais
-- ===================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_progress'
ORDER BY policyname;

-- ===================================================================
-- RESULTADO ESPERADO:
-- Deve listar 4 policies sem recursão:
-- - user_progress_select
-- - user_progress_insert
-- - user_progress_update
-- - user_progress_delete
-- ===================================================================
