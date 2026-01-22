/**
 * ExerciseSelector - Tela de seleção de 20 palavras para o exercício
 *
 * Features:
 * - Carrega automaticamente 20 palavras com score < 3
 * - Mostra progresso de carregamento
 * - Permite iniciar o exercício ou voltar
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/services/supabase";

interface Word {
  id: string;
  word: string;
  definition: string;
  audio_url?: string;
  examples?: string[];
}

interface ExerciseSelectorProps {
  userId: string;
  organizationId: string;
  onStartExercise: (words: Word[]) => void;
  onCancel: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  userId,
  organizationId,
  onStartExercise,
  onCancel,
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar 20 palavras com score < 3
   * Prioridade:
   * 1. Nunca vistas (score = 0)
   * 2. Vistas 1-2x (score = 1-2)
   * 3. Restantes até completar 20
   */
  const loadWordsForExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar IDs de palavras que o usuário já tem progresso
      const { data: userProgress, error: progressError } = await supabase
        .from("user_progress")
        .select("word_id, acertos")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .lt("acertos", 3); // Score < 3

      if (progressError) throw progressError;

      // Extrair IDs que já foram vistas
      const viewedWordIds = new Set(userProgress?.map((p) => p.word_id) || []);

      // Se menos de 20 palavras foram vistas, buscar mais do geral
      if (viewedWordIds.size < 20) {
        const { data: allWords, error: wordsError } = await supabase
          .from("words_global")
          .select("id, word, definition, audio_url, examples")
          .limit(20);

        if (wordsError) throw wordsError;

        // Combinar: palavras já vistas + novas
        const allWordIds = new Set([
          ...viewedWordIds,
          ...(allWords?.map((w) => w.id) || []),
        ]);
        const selectedIds = Array.from(allWordIds).slice(0, 20);

        // Buscar os dados completos dessas 20 palavras
        const { data: selectedWords, error: selectError } = await supabase
          .from("words_global")
          .select("id, word, definition, audio_url, examples")
          .in("id", selectedIds);

        if (selectError) throw selectError;

        setWords(selectedWords || []);
      } else {
        // Se já tem 20+ palavras com baixo score, selecionar as 20 com menor score
        const { data: topWords, error: topError } = await supabase
          .from("user_progress")
          .select("word_id, acertos")
          .eq("user_id", userId)
          .eq("organization_id", organizationId)
          .lt("acertos", 3)
          .order("acertos", { ascending: true })
          .limit(20);

        if (topError) throw topError;

        const topWordIds = topWords?.map((p) => p.word_id) || [];

        const { data: selectedWords, error: selectError } = await supabase
          .from("words_global")
          .select("id, word, definition, audio_url, examples")
          .in("id", topWordIds);

        if (selectError) throw selectError;

        setWords(selectedWords || []);
      }
    } catch (err) {
      console.error("Erro ao carregar palavras:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar exercício",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWordsForExercise();
  }, [userId, organizationId]);

  // Estado de carregamento
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparando seu exercício...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#EF4444", "#F87171"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.errorContainer}
        >
          <Text style={styles.errorTitle}>❌ Erro</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadWordsForExercise}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Sem palavras disponíveis
  if (words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#10B981", "#34D399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successContainer}
        >
          <Text style={styles.successTitle}>🎉 Parabéns!</Text>
          <Text style={styles.successText}>
            Você completou todas as palavras!
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Renderizar seleção de palavras
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          📚 Seu Exercício: {words.length} Palavras
        </Text>
        <Text style={styles.headerSubtitle}>
          Revise as palavras que mais precisa
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {words.map((word, index) => (
          <View key={word.id} style={styles.wordItem}>
            <View style={styles.wordHeader}>
              <Text style={styles.wordNumber}>{index + 1}.</Text>
              <View style={styles.wordInfo}>
                <Text style={styles.wordText}>{word.word}</Text>
                <Text style={styles.wordDefinition} numberOfLines={1}>
                  {word.definition}
                </Text>
              </View>
            </View>
            {word.examples && word.examples.length > 0 && (
              <Text style={styles.wordExample}>📝 {word.examples[0]}</Text>
            )}
            {word.audio_url && (
              <Text style={styles.audioIndicator}>🎵 Com áudio</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartExercise(words)}
        >
          <Text style={styles.startButtonText}>Começar Exercício →</Text>
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
    padding: 20,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  wordItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  wordNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
    marginRight: 12,
    marginTop: 2,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  wordDefinition: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  wordExample: {
    fontSize: 12,
    color: "#7C3AED",
    marginTop: 8,
    fontStyle: "italic",
  },
  audioIndicator: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  startButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#10B981",
    borderRadius: 8,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
