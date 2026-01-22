# ✅ PHONETIC IMPLEMENTATION - PRONTO PARA AMANHÃ

## O Que Foi Feito (Hoje)

### 1. ✅ Adicionado Coluna `phonetic` ao Banco

```sql
ALTER TABLE words_global ADD COLUMN IF NOT EXISTS phonetic TEXT;
```

- Coluna adicionada com sucesso em `words_global`
- Armazena pronúncia escrita em IPA (ex: "/həˈloʊ/")
- Tipos TypeScript atualizados automaticamente

### 2. ✅ Implementado Sistema de Extração de Phonetic

**Arquivo:** `src/services/wordService.ts`

```typescript
// Novo método que extrai phonetic da API
private extractPhonetic(apiData: IDictionaryEntry): string | null {
  const phonetics = apiData.phonetics || [];
  const withText = phonetics.find((p) => p.text && p.text.trim().length > 0);
  return withText?.text || null;
}
```

**Uso em dois lugares:**

1. **`saveWord()`** - Quando salva nova palavra do banco:
   - Extrai phonetic da API
   - Salva em `words_global.phonetic`

2. **`enrichWords()`** - Quando enriquece 20 palavras durante exercício:
   - Extrai phonetic
   - Atualiza `words_global.phonetic` se encontrar

### 3. ✅ Atualizado FlashCard para Exibir Phonetic

**Arquivo:** `src/components/FlashCard.tsx`

- Já tinha suporte a `phonetic` prop
- Mostra pronúncia escrita ao clicar no ícone de áudio
- Display: IPA entre colchetes (ex: "/həˈloʊ/")

### 4. ✅ Atualizado ExerciseSelector e ExerciseScreen

**Arquivo:** `src/screens/ExerciseSelector.tsx`

```typescript
// SELECT agora inclui phonetic
.select("id, word, definition, audio_url, phonetic")
```

**Arquivo:** `src/screens/ExerciseScreen.tsx`

```typescript
// Passa phonetic para FlashCard
phonetic={currentWord.phonetic ?? undefined}
```

### 5. ✅ Tipos TypeScript Atualizados

**Arquivo:** `src/types/database.ts`

Adicionadas colunas:

- `phonetic?: string | null` em `words_global`
- `cefr_level?: string | null`
- `examples?: string[] | null`
- `frequency_score?: number | null`
- `translation?: string | null` (para compat)

## Como Funciona (Fluxo)

### Quando Usuário Abre Exercício

```
1. ExerciseSelector.loadWordsForExercise()
   ↓
2. Busca 200 palavras de words_global com (id, word, definition, audio_url, phonetic)
   ↓
3. Filtra as 20 não completadas
   ↓
4. Verifica se faltam dados (definition, audio_url)
   ↓
5. Se faltar, chama enrichWords() para buscar da API
   ↓
6. enrichWords():
   - Busca cada palavra em dictionaryapi.dev
   - Extrai: definition, audio_url, phonetic
   - Salva tudo em words_global
   ↓
7. FlashCard recebe palavra com todos os dados:
   word, definition, audio_url, phonetic, translation
   ↓
8. Usuário clica ícone 🔊:
   - Toca áudio (audio_url)
   - Mostra pronúncia escrita (phonetic)
```

## Pronto para Amanhã

Quando você conseguir dados da API dictionaryapi.dev amanhã:

### Opção 1: Script de Backfill (Recomendado)

```bash
npx ts-node scripts/fix-missing-audio.ts
```

Já temos isso pronto! Atualizar para também buscar `phonetic`:

```typescript
// No script, adicionar:
const phonetic = this.extractPhonetic(apiData);
await updateWordPhonetic(id, phonetic);
```

### Opção 2: Automático ao Enriquecer

Já está implementado! Quando `enrichWords()` é chamado, salva `phonetic` automaticamente.

## Regras Implementadas

✅ **20 palavras por exercício** - Mantido conforme solicitado
✅ **Busca local de phonetic** - Se estiver em `words_global`, usa direto
✅ **Sem requisições repetidas** - API só chamada quando falta dado
✅ **Fallback gracioso** - Se não tiver phonetic, card funciona sem (mostra só áudio)

## Teste Rápido

```bash
# 1. Build sem erros
npm run type-check  # ✅ Passou

# 2. Rodará app
npm run web

# 3. Abrir exercício
# Ver phonetic no FlashCard quando disponível
```

## Status Final

```
✅ Coluna phonetic adicionada
✅ Métodos de extração implementados
✅ FlashCard exibe phonetic
✅ ExerciseSelector/Screen passam phonetic
✅ Tipos TypeScript atualizados
✅ Sem erros de compilação
⏳ Aguardando dados da API (amanhã)
```

Tudo está pronto para buscar e salvar os dados de pronúncia assim que a API estiver disponível!
