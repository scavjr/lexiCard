-- ===================================================================
-- MIGRATION: Criar tabela user_organizations para multi-tenant
-- Relação muitos-para-muitos entre users e organizations
-- ===================================================================

-- PASSO 1: Criar tabela user_organizations
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id) -- Um usuário não pode ter dois roles na mesma org
);

-- PASSO 2: Criar índices
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_role ON user_organizations(role);

-- PASSO 3: Habilitar RLS
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar policies (RLS)
-- Usuários autenticados podem ver suas próprias associações
CREATE POLICY "user_organizations_select"
ON user_organizations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Usuários autenticados podem inserir (para criar nova associação)
CREATE POLICY "user_organizations_insert"
ON user_organizations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Apenas admins podem atualizar roles
CREATE POLICY "user_organizations_update"
ON user_organizations
FOR UPDATE
TO authenticated
USING (
  -- Apenas se é owner/admin da org
  EXISTS (
    SELECT 1 FROM user_organizations AS uo2
    WHERE uo2.organization_id = user_organizations.organization_id
    AND uo2.user_id = auth.uid()
    AND uo2.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_organizations AS uo2
    WHERE uo2.organization_id = user_organizations.organization_id
    AND uo2.user_id = auth.uid()
    AND uo2.role IN ('owner', 'admin')
  )
);

-- Apenas admins podem deletar
CREATE POLICY "user_organizations_delete"
ON user_organizations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_organizations AS uo2
    WHERE uo2.organization_id = user_organizations.organization_id
    AND uo2.user_id = auth.uid()
    AND uo2.role IN ('owner', 'admin')
  )
);

-- PASSO 5: Trigger para atualizar updated_at
CREATE TRIGGER update_user_organizations_updated_at
BEFORE UPDATE ON user_organizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ✅ MIGRATION COMPLETA
-- ===================================================================
