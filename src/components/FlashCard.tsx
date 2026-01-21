/**
 * Componente FlashCard com animação de flip
 *
 * Features:
 * - Frente: Palavra em inglês + ícones (áudio, exemplo, tradução)
 * - Verso: Tradução em português + botões de acerto/erro
 * - Animação flip suave (300ms) com perspectiva 3D
 * - Responsive para mobile, tablet e web
 * - Acessibilidade com labels e aria attributes
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  AccessibilityInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AudioButton } from "./AudioButton";

/**
 * Props para o componente FlashCard
 */
interface FlashCardProps {
  /** Palavra em inglês */
  word: string;
  /** Tradução em português */
  translation: string;
  /** Definição em inglês (opcional) */
  definition?: string;
  /** Exemplo de uso da palavra em frase (opcional) */
  example?: string;
  /** Pronúncia escrita da palavra (opcional) */
  phonetic?: string;
  /** URL do áudio para pronúncia (opcional) */
  audioUrl?: string;
  /** Callback ao clicar em acerto (verde) */
  onCorrect: () => void;
  /** Callback ao clicar em erro (vermelho) */
  onIncorrect: () => void;
  /** Callback ao clicar no ícone de áudio */
  onAudioPlay?: () => void;
  /** Callback ao clicar no ícone de exemplo */
  onShowExample?: () => void;
  /** ID da palavra para acessibilidade */
  wordId?: string;
  /** Índice do card na série (para a11y) */
  index?: number;
}

/**
 * Componente FlashCard - Card de aprendizado com flip animation
 */
export const FlashCard: React.FC<FlashCardProps> = ({
  word,
  translation,
  definition,
  example,
  audioUrl,
  onCorrect,
  onIncorrect,
  onAudioPlay,
  onShowExample,
  index = 0,
  phonetic,
}) => {
  // Estado de flip (false = frente, true = verso)
  const [isFlipped, setIsFlipped] = useState(false);
  // Estado para mostrar definição na frente do card
  const [showDefinition, setShowDefinition] = useState(false);
  // Estado para mostrar exemplo na frente do card
  const [showExample, setShowExample] = useState(false);
  // Estado para mostrar pronúncia escrita
  const [showPronunciation, setShowPronunciation] = useState(false);

  // Animação de flip
  const flipAnimation = React.useRef(new Animated.Value(0)).current;

  // Resetar flip e definição quando a palavra muda
  useEffect(() => {
    setIsFlipped(false);
    setShowDefinition(false);
    setShowExample(false);
    setShowPronunciation(false);
    flipAnimation.setValue(0);
  }, [word, flipAnimation]);

  // Interpolar a rotação baseado no progresso da animação
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  /**
   * Dispara animação de flip
   */
  const toggleFlip = () => {
    const toValue = isFlipped ? 0 : 180;

    Animated.timing(flipAnimation, {
      toValue,
      duration: 300, // Design system: 300ms
      useNativeDriver: false,
    }).start();

    setIsFlipped(!isFlipped);

    // A11y: Anunciar para screen readers
    const side = isFlipped ? "Frente do card" : "Verso do card";
    if (AccessibilityInfo.announceForAccessibility) {
      AccessibilityInfo.announceForAccessibility(side);
    }
  };

  const { width } = Dimensions.get("window");
  const cardWidth = Math.min(width - 32, 400); // Max 400px, com 16px padding
  const cardHeight = 280;

  return (
    <View
      style={
        {
          alignItems: "center",
          justifyContent: "center",
        } as any
      }
      accessible={false}
      accessibilityLabel={`Flashcard ${index + 1}: ${word}`}
      accessibilityHint={
        isFlipped
          ? "Verso visível. Toque para virar"
          : "Frente visível. Toque para virar"
      }
    >
      {/* Container com perspectiva 3D */}
      <View
        style={
          {
            width: cardWidth,
            height: cardHeight,
            perspective: 1000,
          } as any
        }
      >
        {/* FRENTE DO CARD */}
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
            zIndex: frontOpacity,
          }}
        >
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]} // Primary Indigo gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardBase,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
          >
            {/* Conteúdo da Frente */}
            <TouchableOpacity
              onPress={toggleFlip}
              style={styles.frontContent}
              activeOpacity={0.8}
              accessible={false}
            >
              {/* Palavra Principal - Sempre Visível no Topo */}
              <Text
                style={styles.word}
                numberOfLines={2}
                accessibilityRole="header"
              >
                {word}
              </Text>

              {/* Definição, Exemplo ou Pronúncia */}
              <View style={styles.contentContainer}>
                {showDefinition ? (
                  <Text
                    style={styles.definition}
                    numberOfLines={6}
                    accessibilityRole="text"
                  >
                    {definition || `Sem definição disponível`}
                  </Text>
                ) : showExample ? (
                  <Text
                    style={[styles.definition, styles.exampleText]}
                    numberOfLines={4}
                    accessibilityRole="text"
                  >
                    {example || `Sem exemplo disponível`}
                  </Text>
                ) : showPronunciation && phonetic ? (
                  <View style={styles.pronunciationContainer}>
                    <Text
                      style={styles.phonetic}
                      numberOfLines={2}
                      accessibilityRole="text"
                    >
                      {phonetic}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Ícones da Frente */}
              <View style={styles.frontIconsContainer}>
                {/* AudioButton para pronúncia */}
                {audioUrl && (
                  <View style={styles.audioButtonWrapper}>
                    <AudioButton
                      audioUrl={audioUrl}
                      onPress={() => {
                        setShowPronunciation(true);
                        setShowDefinition(false);
                        setShowExample(false);
                        onAudioPlay?.();
                      }}
                      disabled={false}
                    />
                  </View>
                )}

                {/* Ícone de Definição */}
                {definition && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowDefinition(!showDefinition);
                      setShowExample(false);
                      setShowPronunciation(false);
                    }}
                    style={[
                      styles.iconButton,
                      showDefinition ? styles.iconButtonActive : null,
                    ]}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Ver definição"
                  >
                    <Text style={styles.iconText}>📖</Text>
                  </TouchableOpacity>
                )}

                {/* Ícone de Exemplo */}
                {definition && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowExample(!showExample);
                      setShowDefinition(false);
                      setShowPronunciation(false);
                      onShowExample?.();
                    }}
                    style={[
                      styles.iconButton,
                      showExample ? styles.iconButtonActive : null,
                    ]}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Ver exemplo em frase"
                  >
                    <Text style={styles.iconText}>📝</Text>
                  </TouchableOpacity>
                )}

                {/* Ícone de Tradução (visual indicator) */}
                <View style={styles.iconButton}>
                  <Text style={styles.iconText}>🌐</Text>
                </View>
              </View>

              {/* Hint para virar */}
              <Text style={styles.flipHint}>Toque para virar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* VERSO DO CARD */}
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
            zIndex: backOpacity,
          }}
        >
          <LinearGradient
            colors={["#10B981", "#34D399"]} // Success Emerald gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardBase,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
          >
            {/* Conteúdo do Verso */}
            <TouchableOpacity
              onPress={toggleFlip}
              style={styles.backContent}
              activeOpacity={0.8}
              accessible={false}
            >
              {/* Tradução */}
              <Text
                style={styles.translation}
                numberOfLines={3}
                accessibilityRole="header"
              >
                {translation}
              </Text>

              {/* Definição (se disponível) */}
              {definition && (
                <Text
                  style={styles.definition}
                  numberOfLines={2}
                  accessibilityRole="text"
                >
                  {definition}
                </Text>
              )}

              {/* Botões de Feedback */}
              <View style={styles.feedbackButtons}>
                {/* Botão de Erro (Vermelho) */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onIncorrect();
                  }}
                  style={[styles.feedbackButton, styles.incorrectButton]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Registrar como erro"
                >
                  <Text style={styles.feedbackIcon}>✗</Text>
                  <Text style={styles.feedbackLabel}>Errei</Text>
                </TouchableOpacity>

                {/* Botão de Acerto (Verde) */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onCorrect();
                  }}
                  style={[styles.feedbackButton, styles.correctButton]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Registrar como acerto"
                >
                  <Text style={styles.feedbackIcon}>✓</Text>
                  <Text style={styles.feedbackLabel}>Acertei</Text>
                </TouchableOpacity>
              </View>

              {/* Hint para virar */}
              <Text style={styles.flipHint}>Toque para voltar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 24, // Design system: rounded-2xl
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8, // Android shadow
    overflow: "hidden",
  },

  frontContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  backContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  word: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Inter",
  },

  translation: {
    fontSize: 40,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Inter",
  },

  definition: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Inter",
  },

  wordSmall: {
    fontSize: 28,
  },

  definitionSmall: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  exampleText: {
    fontSize: 14,
    fontStyle: "normal",
    lineHeight: 20,
  },

  pronunciationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  wordContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  phonetic: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Inter",
    fontStyle: "italic",
  },

  iconButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.6)",
  },

  frontIconsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginBottom: 16,
  },

  audioButtonWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  iconText: {
    fontSize: 28,
  },

  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    width: "100%",
  },

  feedbackButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
  },

  correctButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  incorrectButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  feedbackIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  feedbackLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },

  flipHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 12,
    fontFamily: "Inter",
    fontStyle: "italic",
  },
});

export default FlashCard;
