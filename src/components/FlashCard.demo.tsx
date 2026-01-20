/**
 * Exemplo de uso do componente FlashCard
 * Demonstra como usar o card em uma aplicação real
 */

import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import FlashCard from "@/components/FlashCard";

/**
 * Demo FlashCard - Tela de exemplo com múltiplos cards
 */
export const FlashCardDemo: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dados de exemplo (em produção viriam do wordService)
  const cards = [
    {
      word: "Serendipity",
      translation: "Serendipidade",
      definition:
        "The occurrence of events by chance in a happy or beneficial way",
      audioUrl: "https://example.com/audio/serendipity.mp3",
    },
    {
      word: "Ephemeral",
      translation: "Efêmero",
      definition: "Lasting for a very short time",
      audioUrl: "https://example.com/audio/ephemeral.mp3",
    },
    {
      word: "Ubiquitous",
      translation: "Ubíquo",
      definition: "Present, appearing, or found everywhere",
      audioUrl: "https://example.com/audio/ubiquitous.mp3",
    },
  ];

  const current = cards[currentIndex];

  const handleCorrect = () => {
    Alert.alert("✓ Acertou!", `"${current.word}" foi registrado como acertado`);
    moveToNext();
  };

  const handleIncorrect = () => {
    Alert.alert("✗ Errou!", `"${current.word}" foi registrado como erro`);
    moveToNext();
  };

  const handleAudioPlay = () => {
    Alert.alert("🔊 Áudio", `Reproduzindo pronúncia de "${current.word}"`);
    // Em produção, aqui teríamos a lógica real de reprodução de áudio
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aprenda Vocabulário</Text>
        <Text style={styles.subtitle}>
          Card {currentIndex + 1} de {cards.length}
        </Text>
      </View>

      {/* FlashCard */}
      <View style={styles.cardContainer}>
        <FlashCard
          word={current.word}
          translation={current.translation}
          definition={current.definition}
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
});

export default FlashCardDemo;
