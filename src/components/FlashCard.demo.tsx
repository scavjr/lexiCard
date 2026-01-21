/**
 * Exemplo de uso do componente FlashCard
 * Demonstra como usar o card em uma aplicação real
 */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import FlashCard from "@/components/FlashCard";
import Toast from "@/components/Toast";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { useToast } from "@/hooks/useToast";

interface CardData {
  word: string;
  wordId: string; // UUID para Supabase
  translation: string;
  definition?: string;
  example?: string;
  phonetic?: string;
  audioUrl?: string;
}

interface FlashCardDemoProps {
  userId: string;
  organizationId: string;
}

/**
 * Demo FlashCard - Tela de exemplo com múltiplos cards
 * Incluindo progresso e feedback visual
 */
export const FlashCardDemo: React.FC<FlashCardDemoProps> = ({
  userId,
  organizationId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, success, error: showError } = useToast();

  const { recordCorrect, recordIncorrect } = useFlashcardProgress(
    organizationId,
    userId,
  );

  // Palavras para buscar da API com UUIDs para cada palavra
  const wordsToFetch = [
    {
      word: "Serendipity",
      wordId: "550e8400-e29b-41d4-a716-446655440010",
      translation: "Serendipidade",
    },
    {
      word: "Ephemeral",
      wordId: "550e8400-e29b-41d4-a716-446655440011",
      translation: "Efêmero",
    },
    {
      word: "Ubiquitous",
      wordId: "550e8400-e29b-41d4-a716-446655440012",
      translation: "Ubíquo",
    },
  ];

  useEffect(() => {
    const fetchCardsFromAPI = async () => {
      try {
        const cardsData: CardData[] = [];

        for (const { word, wordId, translation } of wordsToFetch) {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch ${word}`);
          }

          const data = response.json().then((arr: any) => {
            if (!Array.isArray(arr) || arr.length === 0) return null;

            const entry = arr[0];
            let audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio;
            const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || "";
            const definition =
              entry.meanings?.[0]?.definitions?.[0]?.definition || "";

            // Procurar por exemplo na primeira definição, se não tiver procurar na próxima
            let example = entry.meanings?.[0]?.definitions?.[0]?.example || "";

            // Se não encontrou exemplo, procurar em outras definições
            if (!example && entry.meanings?.[0]?.definitions) {
              for (const def of entry.meanings[0].definitions) {
                if (def.example) {
                  example = def.example;
                  break;
                }
              }
            }

            console.log(`[API] ${word}: phonetic="${phonetic}"`);

            // Normalizar URL de áudio
            let finalAudioUrl = "";
            if (audioUrl) {
              // Se começa com //, adicionar https:
              if (audioUrl.startsWith("//")) {
                finalAudioUrl = `https:${audioUrl}`;
              }
              // Se já tem protocolo, usar como está
              else if (audioUrl.startsWith("http")) {
                finalAudioUrl = audioUrl;
              }
              // Senão, construir a URL completa
              else {
                finalAudioUrl = `https://api.dictionaryapi.dev${audioUrl}`;
              }
            } else {
              // Fallback: usar URL padrão da API
              finalAudioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}-us.mp3`;
            }

            return {
              word,
              wordId,
              translation,
              definition,
              example,
              phonetic,
              audioUrl: finalAudioUrl,
            };
          });

          const cardData = await data;
          if (cardData) {
            cardsData.push(cardData);
          }
        }

        setCards(cardsData.length > 0 ? cardsData : getDefaultCards());
      } catch (error) {
        console.error("Erro ao buscar cards da API:", error);
        setCards(getDefaultCards());
      } finally {
        setLoading(false);
      }
    };

    fetchCardsFromAPI();
  }, []);

  const getDefaultCards = (): CardData[] => [
    {
      word: "Serendipity",
      wordId: "550e8400-e29b-41d4-a716-446655440010",
      translation: "Serendipidade",
      definition:
        "The occurrence of events by chance in a happy or beneficial way",
      example: "It was pure serendipity that we met at the airport that day.",
      phonetic: "/ˌserənˈdɪpɪti/",
      audioUrl:
        "https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-us.mp3",
    },
    {
      word: "Ephemeral",
      wordId: "550e8400-e29b-41d4-a716-446655440011",
      translation: "Efêmero",
      definition: "Lasting for a very short time",
      example:
        "The beauty of cherry blossoms is ephemeral, lasting only a few weeks.",
      phonetic: "/ɪˈfem(ə)rəl/",
      audioUrl:
        "https://api.dictionaryapi.dev/media/pronunciations/en/ephemeral-us.mp3",
    },
    {
      word: "Ubiquitous",
      wordId: "550e8400-e29b-41d4-a716-446655440012",
      translation: "Ubíquo",
      definition: "Present, appearing, or found everywhere",
      example: "Smartphones have become ubiquitous in modern society.",
      phonetic: "/juːˈbɪkwɪtəs/",
      audioUrl:
        "https://api.dictionaryapi.dev/media/pronunciations/en/ubiquitous-us.mp3",
    },
  ];

  const current = cards[currentIndex];

  const handleCorrect = async () => {
    const result = await recordCorrect(current.wordId);

    if (result.success) {
      success(result.message);

      if (result.isMastered) {
        Alert.alert(
          "🎉 Parabéns!",
          `Você dominou a palavra "${current.word}"!\n\nProgresso: ${result.stats?.masteredWords}/${result.stats?.totalWords} palavras`,
        );
      }

      // Aguardar um pouco antes de passar para o próximo card
      setTimeout(() => moveToNext(), 1500);
    } else {
      showError(result.message);
    }
  };

  const handleIncorrect = async () => {
    const result = await recordIncorrect(current.wordId);

    if (result.success) {
      showError(result.message);
      // Aguardar um pouco antes de passar para o próximo card
      setTimeout(() => moveToNext(), 1500);
    } else {
      showError(result.message);
    }
  };

  const handleAudioPlay = () => {
    // O AudioButton já cuida da reprodução via audioUrl
    // Este callback é apenas para logging/analytics opcional
    console.log(`[Audio] Iniciando pronúncia de: ${current.word}`);
  };

  const handleShowExample = () => {
    Alert.alert(
      "📖 Definição",
      current.definition || "Sem definição disponível",
    );
  };

  const moveToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert("✅ Série Completa!", "Você completou todos os cards!");
      setCurrentIndex(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Toast Notification */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onDismiss={() => {}}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aprenda Vocabulário</Text>
        <Text style={styles.subtitle}>
          {loading
            ? "Carregando..."
            : `Card ${currentIndex + 1} de ${cards.length}`}
        </Text>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.cardContainer}>
          <Text style={styles.loadingText}>Carregando palavras da API...</Text>
        </View>
      ) : cards.length > 0 ? (
        <>
          {/* FlashCard */}
          <View style={styles.cardContainer}>
            <FlashCard
              word={current.word}
              translation={current.translation}
              definition={current.definition}
              example={current.example}
              phonetic={current.phonetic}
              audioUrl={current.audioUrl}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
              onAudioPlay={handleAudioPlay}
              onShowExample={handleShowExample}
              index={currentIndex}
            />
          </View>

          {/* Informações */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Toque no card para virar e ver a tradução
            </Text>
            <Text style={styles.infoText}>
              📊 Use os botões para registrar seu desempenho
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentIndex + 1) / cards.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Progresso: {currentIndex + 1}/{cards.length}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.cardContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar palavras. Verifique sua conexão.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingVertical: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },

  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  infoContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },

  infoText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    fontFamily: "Inter",
  },

  progressContainer: {
    paddingHorizontal: 16,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },

  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 40,
    fontFamily: "Inter",
  },

  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    paddingVertical: 40,
    fontFamily: "Inter",
  },
});

export default FlashCardDemo;
