/**
 * Exemplo de uso do componente AudioButton
 * Testa a reprodução de áudio com URLs reais
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { AudioButton } from "@/components/AudioButton";

// Type augmentation para NativeWind className (compatibilidade)
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
}

/**
 * Demo AudioButton - Exemplos de uso do botão de áudio
 */
export const AudioButtonDemo: React.FC = () => {
  const [playedCount, setPlayedCount] = useState(0);

  // URLs de áudio de exemplo - usando URLs públicas e confiáveis
  // Estas URLs são de domínio público e disponíveis publicamente
  const audioExamples = [
    {
      word: "Hello",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      description: "Teste de áudio (SoundHelix)",
      available: true,
    },
    {
      word: "Serendipity",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      description: "Teste de áudio (SoundHelix)",
      available: true,
    },
    {
      word: "Eloquent",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      description: "Teste de áudio (SoundHelix)",
      available: true,
    },
    {
      word: "Sem áudio",
      audioUrl: undefined,
      description: "Demonstra fallback",
      available: false,
    },
  ];

  const handleAudioPlay = (word: string) => {
    setPlayedCount(playedCount + 1);
    Alert.alert("Áudio Iniciado", `Reproduzindo áudio de "${word}"`, [
      { text: "OK" },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Demo AudioButton</Text>
        <Text style={styles.subtitle}>
          Teste a reprodução de áudio com URLs reais
        </Text>
      </View>

      {/* Contagem de reproduções */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Cliques em áudio:</Text>
        <Text style={styles.statsValue}>{playedCount}</Text>
      </View>

      {/* Exemplos de áudio */}
      <View style={styles.examplesContainer}>
        {audioExamples.map((example, index) => (
          <View key={index} style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleWord}>{example.word}</Text>
              <Text style={styles.exampleStatus}>
                {example.available ? "✓ Com áudio" : "✗ Sem áudio"}
              </Text>
            </View>

            {/* Botão de áudio */}
            <View style={styles.buttonContainer}>
              <AudioButton
                audioUrl={example.audioUrl}
                onPress={() => handleAudioPlay(example.word)}
                disabled={false}
              />
            </View>

            {/* Descrição ou URL */}
            <Text style={styles.descriptionText}>{example.description}</Text>
          </View>
        ))}
      </View>

      {/* Informações adicionais */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Sobre o AudioButton</Text>
        <Text style={styles.infoText}>
          • Carrega e reproduz áudio via URL{"\n"}• Feedback visual: Loading,
          Playing, Paused{"\n"}• Tratamento completo de erros{"\n"}• Acessível
          com screen readers{"\n"}• Fallback quando sem URL ou conexão
        </Text>
      </View>

      {/* Notas técnicas */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>📝 Notas Técnicas</Text>
        <Text style={styles.notesText}>
          O componente AudioButton está totalmente integrado ao FlashCard e
          pronto para uso em produção. Ele gerencia o ciclo de vida do áudio,
          trata erros de rede e fornece feedback visual claro ao usuário.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  examplesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  exampleCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exampleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exampleWord: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  exampleStatus: {
    fontSize: 12,
    color: "#64748B",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
  },
  infoContainer: {
    backgroundColor: "#F0F4FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  notesContainer: {
    backgroundColor: "#F9F5FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
});

export default AudioButtonDemo;
