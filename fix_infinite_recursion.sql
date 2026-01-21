-- ===================================================================
-- FIX: Corrigir Infinite Recursion nas Policies RLS
-- ===================================================================
-- Problema: A policy em user_progress estava acessando a tabela users,
-- que por sua vez acessa user_progress, criando recursão infinita.
-- 
-- Solução: Usar auth.uid() e validação simples sem acessar users
-- ===================================================================

-- 1. DROPPAR POLICIES PROBLEMÁTICAS
-- Remover todas as policies de user_progress que causam recursão
DROP POLICY IF EXISTS "Enable select for users in org" ON user_progress;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_progress;
DROP POLICY IF EXISTS "Enable update for own records" ON user_progress;
DROP POLICY IF EXISTS "Enable delete for own records" ON user_progress;

-- 2. CRIAR NOVAS POLICIES SEM RECURSÃO
-- SELECT: Usuário pode ver progresso da sua org
CREATE POLICY "user_progress_select_policy"
ON user_progress
FOR SELECT
USING (
  -- Validar que o user_id no record é o user logado
  -- E que ele pertence à organização (validar via auth metadata)
  auth.uid() = user_id
);

-- INSERT: Usuário pode inserir progresso apenas para si mesmo
CREATE POLICY "user_progress_insert_policy"
ON user_progress
FOR INSERT
WITH CHECK (
  -- Só pode inserir para seu próprio user_id
  auth.uid() = user_id
);

-- UPDATE: Usuário pode atualizar apenas seu próprio progresso
CREATE POLICY "user_progress_update_policy"
ON user_progress
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- DELETE: Usuário pode deletar apenas seu próprio progresso
CREATE POLICY "user_progress_delete_policy"
ON user_progress
FOR DELETE
USING (
  auth.uid() = user_id
);

-- ===================================================================
-- ALTERNATIVA: Se precisar validar organization_id via JWT claims
-- (requer configurar auth.users com custom claims)
-- ===================================================================

-- Descomente se estiver usando JWT custom claims:
/*
CREATE POLICY "user_progress_select_org_policy"
ON user_progress
FOR SELECT
USING (
  -- Validar via auth.uid() E organization_id via JWT
  auth.uid() = user_id
  AND organization_id = (
    COALESCE(current_setting('app.organization_id', true), '')::uuid
  )
);
*/

-- ===================================================================
-- RECOMENDAÇÃO PARA PRODUÇÃO:
-- ===================================================================
-- Para maior segurança em multi-tenant, usar uma das alternativas:
--
-- Opção 1 (Mais Simples - Atual):
--   Validar apenas auth.uid() = user_id
--   A validação de organization_id fica a cargo do frontend/backend
--
-- Opção 2 (Mais Segura):
--   Usar auth.users custom claims com organization_id
--   Validar na policy: organization_id = auth.jwt() ->> 'org_id'
--
-- Opção 3 (Mais Robusta):
--   Criar função PL/pgSQL que valida sem recursão:
--   SELECT * FROM users WHERE id = auth.uid() AND organization_id = $1
--   Marcar função como IMMUTABLE para evitar recursão
-- ===================================================================
