/**
 * LandingPage - Tela de boas-vindas
 *
 * Features:
 * - Hero section com valor do app
 * - Botão para Login
 * - Botão para Instalar (PWA)
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log("✅ PWA instalado com sucesso!");
      setShowInstallButton(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("✅ Usuário aceitou instalar o PWA");
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#4F46E5", "#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.emoji}>📚</Text>
            <Text style={styles.title}>LexiCard</Text>
            <Text style={styles.tagline}>
              Aprenda Inglês com Flashcards Inteligentes
            </Text>
            <Text style={styles.description}>
              Expanda seu vocabulário em inglês com nossa plataforma de
              aprendizado adaptativo. Flashcards, pronúncia, tradução e muito
              mais!
            </Text>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Por que LexiCard?</Text>

          <View style={[styles.featureCard, { marginTop: 20 }]}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Exercícios Focados</Text>
              <Text style={styles.featureDescription}>
                20 palavras por rodada, exatamente do seu nível
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Pronúncia em Áudio</Text>
              <Text style={styles.featureDescription}>
                Ouça pronunciação nativa de cada palavra
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Rastreamento de Progresso</Text>
              <Text style={styles.featureDescription}>
                Veja seu progresso em tempo real
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🌍</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Tradução para Português</Text>
              <Text style={styles.featureDescription}>
                Entenda o significado em português
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1,000+</Text>
            <Text style={styles.statLabel}>Palavras</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>20</Text>
            <Text style={styles.statLabel}>Por Rodada</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Gratuito</Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Comece Agora</Text>
          <Text style={styles.ctaDescription}>
            Cadastre-se ou faça login para começar a aprender
          </Text>

          {/* Botão de Instalar (PWA) */}
          {showInstallButton && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.installButton]}
              onPress={handleInstallClick}
            >
              <Text style={styles.primaryButtonText}>
                📥 Instalar Aplicativo
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNavigateToLogin}
          >
            <Text style={styles.primaryButtonText}>Entrar / Cadastrar</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Nenhum cartão de crédito necessário
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: "#E0E7FF",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: "#C7D2FE",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 350,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  installButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
