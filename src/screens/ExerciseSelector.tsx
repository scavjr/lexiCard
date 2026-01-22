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
import { wordService } from "@/services/wordService";

interface Word {
  id: string;
  word: string;
  definition: string | null;
  audio_url?: string | null;
  examples?: string[];
  translation?: string;
  phonetic?: string | null;
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
   * Carregar 20 palavras aleatórias que ainda não foram completadas
   * Fluxo:
   * 1. Buscar IDs de palavras já completadas (acertos >= 3)
   * 2. Buscar 20 palavras aleatórias que NÃO estão na lista de completadas
   * 3. Enriquecer palavras com dados da API se necessário
   */
  const loadWordsForExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 [ExerciseSelector] Iniciando loadWordsForExercise");
      console.log(`   userId: ${userId}, organizationId: ${organizationId}`);

      // 1. Buscar palavras JÁ COMPLETADAS pelo usuário (acertos >= 3)
      const { data: completedProgress, error: progressError } = await supabase
        .from("user_progress")
        .select("word_id")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gte("acertos", 3); // Score >= 3 (completadas)

      if (progressError) throw progressError;

      const completedWordIds = new Set(
        completedProgress?.map((p) => p.word_id) || [],
      );
      console.log(
        `✅ Palavras completadas (acertos >= 3): ${completedWordIds.size}`,
      );

      // 2. Buscar MUITAS palavras (ex: 200) para depois filtrar
      // Seleciona da tabela words_global e junta com words para pegar translation
      const { data: availableWords, error: wordsError } = await supabase
        .from("words_global")
        .select("id, word, definition, audio_url, phonetic")
        .order("word", { ascending: true }) // Ordem consistente
        .limit(200); // Buscar bastante para garantir 20 após filtro

      if (wordsError) throw wordsError;

      console.log(
        `📚 Total de palavras buscadas (limit 200): ${availableWords?.length || 0}`,
      );

      // 3. Filtrar palavras já completadas, depois limitar a 20
      const selectedWords = (availableWords || [])
        .filter((w) => !completedWordIds.has(w.id))
        .slice(0, 20); // Pegar apenas 20 palavras não completadas

      console.log(
        `🎯 Palavras após filtro (removendo completadas): ${selectedWords.length}`,
      );

      if (selectedWords.length > 0) {
        console.log(
          "   Exemplos:",
          selectedWords
            .slice(0, 3)
            .map((w) => w.word)
            .join(", "),
        );
      }

      if (selectedWords.length === 0) {
        setError("Parabéns! Você completou todas as palavras!");
        return;
      }

      // 3.5 Buscar traduções na tabela words_global (não em words!)
      const wordGlobalIds = selectedWords.map((w) => w.id);
      console.log(
        `📍 Buscando traduções para ${wordGlobalIds.length} palavras em words_global...`,
      );

      const { data: translations, error: translationError } = await supabase
        .from("words_global")
        .select("id, translation")
        .in("id", wordGlobalIds);

      if (translationError) {
        console.warn("❌ Erro ao buscar traduções", translationError);
      }

      console.log(`✅ Traduções encontradas: ${translations?.length || 0}`);
      if (translations && translations.length > 0) {
        console.log("   Exemplos:", translations.slice(0, 3));
      }

      // Merge traduções com palavras
      const translationMap = new Map(
        (translations || []).map((t) => [t.id, t.translation]),
      );

      const selectedWordsWithTranslation = selectedWords.map((w) => ({
        ...w,
        translation: translationMap.get(w.id) || w.word, // Fallback: mesma palavra
      }));

      // Debug: Mostrar primeiras 3 com tradução
      console.log("📋 Palavras após merge com tradução:");
      selectedWordsWithTranslation.slice(0, 3).forEach((w, i) => {
        console.log(`   [${i}] ${w.word} → ${w.translation}`);
      });

      // 4. ✅ NOVO: Enriquecer palavras com dados da API se necessário
      console.log("🌐 Verificando se palavras precisam ser enriquecidas...");

      // Contar quantas têm dados incompletos
      const needEnrichment = selectedWordsWithTranslation.filter(
        (w) => !w.definition || !w.audio_url,
      );

      console.log(
        `📊 Palavras que precisam enriquecimento: ${needEnrichment.length}/${selectedWordsWithTranslation.length}`,
      );

      // Se tiver muitas que precisam, enriquecer
      let finalWords: Word[];
      if (needEnrichment.length > 0) {
        console.log("🔄 Iniciando enriquecimento de palavras da API...");
        const enrichedWords = await wordService.enrichWords(
          selectedWordsWithTranslation,
        );

        // Manter traduções do enriquecimento
        finalWords = enrichedWords.map((w) => ({
          ...w,
          translation: translationMap.get(w.id) || w.translation || w.word,
        })) as Word[];
        console.log("✅ Enriquecimento concluído!");
      } else {
        finalWords = selectedWordsWithTranslation as Word[];
        console.log("✅ Todas as palavras já têm dados completos");
      }

      // Debug: log primeira palavra
      console.log("🔍 Primeiras 5 palavras do exercício:");
      finalWords.slice(0, 5).forEach((w, i) => {
        console.log(`   [${i}] ${w.word} (ID: ${w.id}) → ${w.translation}`);
      });

      // ✅ Ir direto para o exercício (FlashCard) sem mostrar lista
      console.log(
        "🚀 Iniciando exercício com " + finalWords.length + " palavras",
      );
      onStartExercise(finalWords);
    } catch (err) {
      console.error("❌ [ExerciseSelector] Erro ao carregar palavras:", err);
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
          <Text style={styles.errorTitle}>⚠️ Erro</Text>
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
