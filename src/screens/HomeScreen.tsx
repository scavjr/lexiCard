/**
 * HomeScreen - Tela inicial com menu de opções
 * Permite ao usuário escolher entre:
 * - Iniciar nova rodada de exercícios
 * - Ver dashboard de progresso
 * - Sair
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/services/supabase";

interface HomeScreenProps {
  userId: string;
  organizationId: string;
  onStartExercise: () => void;
  onDashboard: () => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userId,
  organizationId,
  onStartExercise,
  onDashboard,
  onLogout,
}) => {
  const [stats, setStats] = useState({
    totalWords: 0,
    completedWords: 0,
    todayExercises: 0,
  });

  useEffect(() => {
    loadStats();
  }, [userId, organizationId]);

  const loadStats = async () => {
    try {
      // Contar total de palavras
      const { count: totalWords } = await supabase
        .from("words_global")
        .select("*", { count: "exact", head: true });

      // Contar palavras completadas (acertos >= 3)
      const { count: completedWords } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gte("acertos", 3);

      setStats({
        totalWords: totalWords || 0,
        completedWords: completedWords || 0,
        todayExercises: 0, // TODO: Contar exercícios de hoje
      });
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>📚 LexiCard</Text>
        <Text style={styles.subtitle}>Aprenda palavras em inglês</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Palavras Totais</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedWords}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalWords - stats.completedWords}
            </Text>
            <Text style={styles.statLabel}>Para Aprender</Text>
          </View>
        </View>

        {/* Menu Principal */}
        <View style={styles.menuContainer}>
          {/* Botão Nova Rodada */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={onStartExercise}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonIcon}>🎯</Text>
              <Text style={styles.mainButtonText}>Nova Rodada</Text>
              <Text style={styles.buttonSubtext}>
                20 palavras para praticar
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botão Dashboard */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onDashboard}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#F59E0B", "#FBBF24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonIcon}>📊</Text>
              <Text style={styles.mainButtonText}>Progresso</Text>
              <Text style={styles.buttonSubtext}>Ver seu desempenho</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botão Sair */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#EF4444", "#F87171"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonIcon}>👋</Text>
              <Text style={styles.mainButtonText}>Sair</Text>
              <Text style={styles.buttonSubtext}>Até logo!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  menuContainer: {
    gap: 16,
  },
  mainButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  buttonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
});
