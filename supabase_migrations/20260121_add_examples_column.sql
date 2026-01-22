-- ============================================================================
-- MIGRATION: Adicionar coluna examples à tabela words_global
-- ============================================================================
-- Data: 21 de Janeiro de 2026
-- Objetivo: Adicionar suporte a examples[] do DictionaryAPI.dev
-- Status: CRÍTICA (necessária para seed funcionar corretamente)
-- ============================================================================

-- 1. Adicionar coluna examples
ALTER TABLE words_global
ADD COLUMN IF NOT EXISTS examples TEXT[] DEFAULT '{}';

-- 2. Adicionar comentário
COMMENT ON COLUMN words_global.examples IS 'Array de exemplos de uso da palavra (extraídos do DictionaryAPI.dev)';

-- 3. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_words_global_word 
  ON words_global(word);

CREATE INDEX IF NOT EXISTS idx_words_global_cefr 
  ON words_global(cefr_level);

-- 4. Validar que a coluna foi adicionada
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'words_global'
ORDER BY column_name;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ✅ Coluna 'examples' type: text[] default: '{}'
-- ============================================================================
