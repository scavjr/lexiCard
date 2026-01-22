/**
 * ExerciseScreen - Tela de exercício com 20 palavras
 *
 * Features:
 * - Mostrar 20 palavras em ordem
 * - Botão para acerto/erro
 * - Tracking de progresso
 * - Salvar score após completar
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FlashCard } from "@/components/FlashCard";
import { supabase } from "@/services/supabase";

interface Word {
  id: string;
  word: string;
  definition: string | null;
  audio_url?: string | null;
  examples?: string[];
  translation?: string;
  phonetic?: string | null;
}

interface ExerciseScreenProps {
  userId: string;
  organizationId: string;
  words: Word[];
  onComplete: (stats: ExerciseStats) => void;
  onCancel: () => void;
}

interface ExerciseStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  duration: number; // em segundos
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  userId,
  organizationId,
  words,
  onComplete,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Debug
  React.useEffect(() => {
    if (currentWord) {
      console.log("📱 [ExerciseScreen] Palavra atual:", {
        word: currentWord.word,
        translation: currentWord.translation,
        id: currentWord.id,
      });
    }
  }, [currentIndex, currentWord]);

  /**
   * Salvar progresso da palavra
   */
  const saveProgress = useCallback(
    async (isCorrect: boolean) => {
      try {
        // Verificar se já existe progresso para essa palavra
        const { data: existing } = await supabase
          .from("user_progress")
          .select("id, acertos")
          .eq("user_id", userId)
          .eq("word_id", currentWord.id)
          .eq("organization_id", organizationId)
          .single();

        const newCorrect = (existing?.acertos || 0) + (isCorrect ? 1 : 0);

        if (existing) {
          // Atualizar existente
          await supabase
            .from("user_progress")
            .update({
              acertos: newCorrect,
              data_ultimo_acerto: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          // Criar novo
          await supabase.from("user_progress").insert({
            user_id: userId,
            word_id: currentWord.id,
            organization_id: organizationId,
            acertos: newCorrect,
            data_ultimo_acerto: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Erro ao salvar progresso:", err);
      }
    },
    [userId, organizationId, currentWord.id],
  );

  /**
   * Responder corretamente
   */
  const handleCorrect = async () => {
    await saveProgress(true);
    setCorrectCount((c) => c + 1);

    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Exercício completo
      finishExercise(true);
    }
  };

  /**
   * Responder incorretamente
   */
  const handleIncorrect = async () => {
    await saveProgress(false);
    setIncorrectCount((c) => c + 1);

    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Exercício completo
      finishExercise(true);
    }
  };

  /**
   * Finalizar exercício
   */
  const finishExercise = async (completed: boolean) => {
    setSaving(true);
    try {
      const duration = Math.round((Date.now() - startTime) / 1000);

      if (completed) {
        // Salvar sessão de exercício
        await supabase.from("flashcard_sessions").insert({
          user_id: userId,
          organization_id: organizationId,
          data_sessao: new Date().toISOString(),
          total_aprendidas: correctCount + 1,
          total_revisadas: incorrectCount,
          duracao_segundos: duration,
        });
      }

      onComplete({
        totalWords: words.length,
        correctAnswers: correctCount + 1,
        incorrectAnswers: incorrectCount,
        duration,
      });
    } catch (err) {
      console.error("Erro ao finalizar exercício:", err);
      onComplete({
        totalWords: words.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        duration: Math.round((Date.now() - startTime) / 1000),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!currentWord) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentIndex + 1} / {words.length}
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{correctCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>❌</Text>
            <Text style={styles.statValue}>{incorrectCount}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* FlashCard */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <FlashCard
          word={currentWord.word}
          translation={currentWord.translation || currentWord.word}
          definition={currentWord.definition ?? undefined}
          example={
            currentWord.examples && currentWord.examples.length > 0
              ? currentWord.examples[0]
              : undefined
          }
          phonetic={currentWord.phonetic ?? undefined}
          audioUrl={currentWord.audio_url ?? undefined}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          index={currentIndex}
        />
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.incorrectButton]}
          onPress={handleIncorrect}
          disabled={saving}
        >
          <Text style={styles.buttonText}>❌ Não Sabia ({incorrectCount})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.correctButton]}
          onPress={handleCorrect}
          disabled={saving}
        >
          <Text style={styles.buttonText}>✅ Sabia ({correctCount})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cancelIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  incorrectButton: {
    backgroundColor: "#EF4444",
  },
  correctButton: {
    backgroundColor: "#10B981",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
