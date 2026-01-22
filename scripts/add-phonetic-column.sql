-- Migration: Adicionar coluna phonetic a words_global
-- Descrição: Armazena pronúncia escrita (IPA) das palavras

ALTER TABLE words_global
ADD COLUMN IF NOT EXISTS phonetic TEXT;

-- Comentário
COMMENT ON COLUMN words_global.phonetic IS 'Pronúncia escrita em IPA (ex: "/həˈloʊ/")';
