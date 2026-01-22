# 📚 Implementação: Sistema de 20 Palavras por Exercício

## 🎯 Objetivo

Cada exercício de aprendizagem deve conter **exatamente 20 palavras** que o usuário estuda até assimilar (score >= 3).

**Fluxo Crítico:**

1. Nunca repetir palavra já assimilada (score >= 3)
2. Sempre usar data de Supabase (nunca hardcoded)
3. Cache em AsyncStorage para offline
4. Sincronizar quando online

---

## 📋 Especificação Completa

### 1. Estrutura de Dados (DictionaryAPI.dev)

```json
{
  "id": "uuid",
  "word": "suspicious",
  "definition": "Arousing suspicion",
  "examples": [
    "His suspicious behaviour brought him to the attention of the police.",
    "She gave me a suspicious look."
  ],
  "audio_url": "https://api.dictionaryapi.dev/media/pronunciations/en/suspicious-us.mp3",
  "part_of_speech": "adjective",
  "cefr_level": "B1",
  "frequency_score": 7.5,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### 2. Tabelas Supabase Necessárias

#### `words_global` (Já existe, precisa de atualização)

```sql
CREATE TABLE words_global (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(255) UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  examples TEXT[] DEFAULT '{}',  -- ⭐ NOVA COLUNA
  audio_url TEXT,
  part_of_speech VARCHAR(20),     -- ⭐ NOVA COLUNA
  cefr_level VARCHAR(10),
  frequency_score DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_words_global_word ON words_global(word);
CREATE INDEX idx_words_global_cefr ON words_global(cefr_level);
```

#### `user_progress` (Já existe, validar estrutura)

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words_global(id) ON DELETE CASCADE,
  score INT DEFAULT 0,  -- 0-3+: 0=never, 1=1 correct, 2=2 correct, 3+=assimilated
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Índices críticos
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_score ON user_progress(score);
CREATE INDEX idx_user_progress_user_score ON user_progress(user_id, score);
```

### 3. Fluxo do Exercício (Frontend)

```typescript
// === PASSO 1: Carregar 20 Palavras ===
const loadExerciseSet = async (userId: string): Promise<Word[]> => {
  // Verificar AsyncStorage primeiro
  const cached = await AsyncStorage.getItem(`exercise_${userId}`);
  if (cached) return JSON.parse(cached);

  // Se não tem cache, buscar Supabase
  const { data, error } = await supabase
    .from('user_progress')
    .select('word_id, words_global(*)')
    .eq('user_id', userId)
    .lt('score', 3)  // ⭐ CRÍTICO: score < 3 (não assimiladas)
    .limit(20);

  if (!data || data.length < 20) {
    // Se menos de 20, fazer reset (usuário assimilou tudo)
    return await resetExerciseSet(userId);
  }

  const words = data.map(p => p.words_global);
  await AsyncStorage.setItem(`exercise_${userId}`, JSON.stringify(words));
  return words;
};

// === PASSO 2: Exibir Palavra + Exemplos ===
interface FlashCardProps {
  word: Word;
  examples: string[];  // ⭐ Do DictionaryAPI.dev
  audioUrl?: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({ word, examples }) => {
  return (
    <View>
      <Text style={styles.word}>{word.word}</Text>
      <Text style={styles.definition}>{word.definition}</Text>

      {/* ⭐ NOVO: Exibir exemplos de uso */}
      {examples.map((example, idx) => (
        <Text key={idx} style={styles.example}>
          📌 {example}
        </Text>
      ))}

      {/* ⭐ NOVO: Reproduzir áudio */}
      {word.audio_url && <AudioButton url={word.audio_url} />}
    </View>
  );
};

// === PASSO 3: Registrar Resposta (Acertei/Errei) ===
const handleAnswer = async (
  userId: string,
  wordId: string,
  isCorrect: boolean
) => {
  // Incrementar score se correto
  const newScore = isCorrect ? 1 : 0;

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      word_id: wordId,
      score: supabase.raw(`CASE WHEN score < 3 THEN score + ${newScore} ELSE score END`),
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id,word_id' });

  if (!error) {
    // Sincronizar cache local
    await syncExerciseProgress(userId);
  }
};

// === PASSO 4: Rotação Automática (quando tudo score >= 3) ===
const checkAndRotateExercise = async (userId: string) => {
  const exerciseSet = await loadExerciseSet(userId);

  // Verificar se todas as 20 têm score >= 3
  const allAssimilated = exerciseSet.every(word => word.score >= 3);

  if (allAssimilated) {
    console.log("✅ Exercício concluído! Carregando novo set...");
    await AsyncStorage.removeItem(`exercise_${userId}`);
    return await loadExerciseSet(userId);  // Carrega novo set
  }

  return exerciseSet;
};

// === PASSO 5: Offline - AsyncStorage Cache ===
interface ExerciseCache {
  words: Word[];
  lastSynced: string;
  userId: string;
}

const syncExerciseProgress = async (userId: string) => {
  try {
    // Carregar set atual
    const exerciseSet = await loadExerciseSet(userId);

    // Atualizar cache local
    const cache: ExerciseCache = {
      words: exerciseSet,
      lastSynced: new Date().toISOString(),
      userId
    };

    await AsyncStorage.setItem(
      `exercise_${userId}`,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
    // Offline - usar cache existente
  }
};
```

---

## 🗄️ Migrations SQL Necessárias

### Migration 1: Adicionar colunas a words_global

```sql
-- File: supabase_migrations/[timestamp]_add_examples_part_of_speech.sql

ALTER TABLE words_global
ADD COLUMN IF NOT EXISTS examples TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(20);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_words_global_cefr
  ON words_global(cefr_level);

CREATE INDEX IF NOT EXISTS idx_words_global_word
  ON words_global(word);
```

### Migration 2: Otimizar user_progress

```sql
-- File: supabase_migrations/[timestamp]_optimize_user_progress.sql

-- Índice crítico para query de score < 3
CREATE INDEX IF NOT EXISTS idx_user_progress_user_score
  ON user_progress(user_id, score);

-- Constraint para integridade
ALTER TABLE user_progress
ADD CONSTRAINT check_score_range
  CHECK (score >= 0 AND score <= 10);
```

---

## 🚀 Implementação Frontend (React Native)

### Componente Principal: ExerciseScreen

```typescript
// src/screens/ExerciseScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashCard from '../components/FlashCard';
import AudioButton from '../components/AudioButton';

interface Word {
  id: string;
  word: string;
  definition: string;
  examples: string[];
  audio_url?: string;
  part_of_speech: string;
  cefr_level: string;
  score?: number;
}

export const ExerciseScreen: React.FC = () => {
  const [exerciseSet, setExerciseSet] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // PASSO 1: Obter ID do usuário
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  // PASSO 2: Carregar 20 palavras
  useEffect(() => {
    if (!userId) return;

    const loadExercise = async () => {
      setLoading(true);

      // Tentar cache primeiro
      const cached = await AsyncStorage.getItem(`exercise_${userId}`);
      if (cached) {
        setExerciseSet(JSON.parse(cached));
        setLoading(false);
        return;
      }

      // Buscar do Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .select('word_id, words_global(*), score')
        .eq('user_id', userId)
        .lt('score', 3)
        .limit(20);

      if (error) {
        console.error('Erro ao carregar exercício:', error);
        return;
      }

      const words: Word[] = data.map((p: any) => ({
        ...p.words_global,
        score: p.score
      }));

      // Atualizar cache
      await AsyncStorage.setItem(
        `exercise_${userId}`,
        JSON.stringify(words)
      );

      setExerciseSet(words);
      setLoading(false);
    };

    loadExercise();
  }, [userId]);

  // PASSO 3: Registrar resposta
  const handleCorrect = async () => {
    if (!userId || !exerciseSet[currentIndex]) return;

    const word = exerciseSet[currentIndex];

    await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        word_id: word.id,
        score: (word.score || 0) + 1,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id,word_id' });

    moveToNext();
  };

  const handleIncorrect = async () => {
    if (!userId || !exerciseSet[currentIndex]) return;

    const word = exerciseSet[currentIndex];

    await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        word_id: word.id,
        score: word.score || 0,  // Não incrementa
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id,word_id' });

    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < exerciseSet.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Fim do exercício - verificar se todas têm score >= 3
      checkRotation();
    }
  };

  const checkRotation = async () => {
    // Se todas têm score >= 3, carregar novo set
    const newSet = await loadExerciseSet(userId!);
    setExerciseSet(newSet);
    setCurrentIndex(0);
  };

  if (loading) return <Text>Carregando exercício...</Text>;
  if (exerciseSet.length === 0) return <Text>Nenhuma palavra para estudar</Text>;

  const currentWord = exerciseSet[currentIndex];

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {currentIndex + 1}/{exerciseSet.length}
      </Text>

      <FlashCard
        word={currentWord}
        examples={currentWord.examples}
        audioUrl={currentWord.audio_url}
      />

      <View style={{ marginTop: 30, gap: 10 }}>
        <Button title="✅ Acertei" onPress={handleCorrect} color="green" />
        <Button title="❌ Errei" onPress={handleIncorrect} color="red" />
      </View>
    </ScrollView>
  );
};

async function loadExerciseSet(userId: string): Promise<Word[]> {
  const { data } = await supabase
    .from('user_progress')
    .select('word_id, words_global(*), score')
    .eq('user_id', userId)
    .lt('score', 3)
    .limit(20);

  return data?.map((p: any) => ({ ...p.words_global, score: p.score })) || [];
}
```

---

## ✅ Checklist de Implementação

### Backend (Supabase)

- [ ] Adicionar colunas `examples` (TEXT[]) e `part_of_speech` a `words_global`
- [ ] Criar índices em `user_progress(user_id, score)`
- [ ] Validar RLS policies
- [ ] Testar queries de score < 3

### Seed (Script)

- [ ] ✅ Refatorar `scripts/seed-1k-words.js` para DictionaryAPI.dev
- [ ] ✅ Extrair `examples[]` array
- [ ] ✅ Extrair `part_of_speech` field
- [ ] ✅ Remover hardcoded COMMON_WORDS

### Frontend

- [ ] Criar componente `ExerciseScreen`
- [ ] Implementar `loadExerciseSet()` com score < 3
- [ ] Implementar `handleCorrect()` e `handleIncorrect()`
- [ ] Implementar AsyncStorage cache
- [ ] Implementar rotação automática
- [ ] Exibir exemplos na interface

### Testes

- [ ] [ ] Testar carregamento de 20 palavras
- [ ] [ ] Testar incremento de score
- [ ] [ ] Testar rotação quando score >= 3
- [ ] [ ] Testar offline com AsyncStorage
- [ ] [ ] Testar sincronização

---

## 🔗 Referências

- **DictionaryAPI.dev**: https://dictionaryapi.dev/
- **Supabase Docs**: https://supabase.com/docs
- **React Native AsyncStorage**: https://react-native-async-storage.github.io/async-storage/
- **ai_instructions.md**: Fluxo: API → Supabase → AsyncStorage (nunca hardcode)

---

## 📝 Notas Importantes

1. **Nunca Hardcoding**: Todas as palavras vêm da API ou Supabase, nunca do código
2. **Examples Field**: OBRIGATÓRIO do DictionaryAPI.dev para contexto de uso
3. **Score Rule**: score >= 3 = ASSIMILADA (nunca repete no mesmo exercício)
4. **20-Word Set**: Exatamente 20 palavras onde score < 3
5. **Offline First**: AsyncStorage cache é source of truth offline
6. **Audio URLs**: Armazenar apenas URL, não fazer download do arquivo binário

---

**Status**: ✅ Especificação Completa
**Última Atualização**: 2024-01-15
**Responsável**: GitHub Copilot
