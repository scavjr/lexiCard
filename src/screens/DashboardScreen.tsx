import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFlashcardProgress,
  CEFR_LEVELS,
  type ProgressStats,
  type CEFRLevel,
} from "@/hooks/useFlashcardProgress";
import { supabase } from "@/services/supabase";

interface SessionStats {
  date: string;
  wordsLearned: number;
  masteredCount: number;
  sessionDuration: number; // em minutos
}

interface DashboardState {
  stats: ProgressStats | null;
  todayWords: number;
  weekWords: number;
  sessions: SessionStats[];
  loading: boolean;
}

/**
 * DashboardScreen - Tela de estatísticas e progresso do usuário
 * Mostra widgets de progresso, CEFR level, e histórico de sessões
 */
export const DashboardScreen: React.FC<{
  userId: string;
  organizationId: string;
}> = ({ userId, organizationId }) => {
  const [state, setState] = useState<DashboardState>({
    stats: null,
    todayWords: 0,
    weekWords: 0,
    sessions: [],
    loading: true,
  });

  const [refreshing, setRefreshing] = useState(false);
  const { getProgressStats } = useFlashcardProgress(organizationId, userId);

  /**
   * Buscar estatísticas de hoje (últimas 24h)
   */
  const fetchTodayStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("user_progress")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gt("data_ultimo_acerto", today.toISOString())
        .gt("acertos", 0);

      if (error) throw error;
      return data?.length || 0;
    } catch (err) {
      console.error("Erro ao buscar estatísticas de hoje:", err);
      return 0;
    }
  }, [userId, organizationId]);

  /**
   * Buscar estatísticas da semana (últimos 7 dias)
   */
  const fetchWeekStats = useCallback(async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("user_progress")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gt("data_ultimo_acerto", weekAgo.toISOString())
        .gt("acertos", 0);

      if (error) throw error;
      return data?.length || 0;
    } catch (err) {
      console.error("Erro ao buscar estatísticas da semana:", err);
      return 0;
    }
  }, [userId, organizationId]);

  /**
   * Buscar histórico de sessões
   */
  const fetchSessions = useCallback(async (): Promise<SessionStats[]> => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("flashcard_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gte("data_sessao", thirtyDaysAgo.toISOString())
        .order("data_sessao", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((session) => ({
        date: new Date(session.data_sessao).toLocaleDateString("pt-BR"),
        wordsLearned: session.total_aprendidas || 0,
        masteredCount: session.total_revisadas || 0,
        sessionDuration: 0, // Campo não existe no banco, será calculado depois
      }));
    } catch (err) {
      console.error("Erro ao buscar sessões:", err);
      return [];
    }
  }, [userId, organizationId]);

  /**
   * Carregar todos os dados
   */
  const loadData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const [stats, today, week, sessions] = await Promise.all([
        getProgressStats(),
        fetchTodayStats(),
        fetchWeekStats(),
        fetchSessions(),
      ]);

      setState({
        stats,
        todayWords: today,
        weekWords: week,
        sessions,
        loading: false,
      });
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [getProgressStats, fetchTodayStats, fetchWeekStats, fetchSessions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  const stats = state.stats;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Seu Progresso</Text>
        <Text style={styles.subtitle}>Acompanhe seu aprendizado</Text>
      </View>

      {/* CEFR Level Card */}
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cefrCard}
      >
        <View style={styles.cefrContent}>
          <Text style={styles.cefrLabel}>Seu Nível CEFR</Text>
          <Text style={styles.cefrLevel}>{stats?.cefrLevel}</Text>
          <Text style={styles.cefrTitle}>{stats?.cefrLabel}</Text>
          <Text style={styles.cefrDescription}>
            {stats?.totalWords} palavras aprendidas
          </Text>
        </View>
      </LinearGradient>

      {/* Widgets Row 1: Today & Week */}
      <View style={styles.widgetRow}>
        {/* Today Widget */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.widget, styles.widgetHalf]}
        >
          <Text style={styles.widgetLabel}>Hoje</Text>
          <Text style={styles.widgetNumber}>{state.todayWords}</Text>
          <Text style={styles.widgetSubtitle}>palavras aprendidas</Text>
        </LinearGradient>

        {/* Week Widget */}
        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.widget, styles.widgetHalf]}
        >
          <Text style={styles.widgetLabel}>Esta Semana</Text>
          <Text style={styles.widgetNumber}>{state.weekWords}</Text>
          <Text style={styles.widgetSubtitle}>palavras aprendidas</Text>
        </LinearGradient>
      </View>

      {/* Widgets Row 2: Stats */}
      <View style={styles.widgetRow}>
        {/* Total Mastered Widget */}
        <LinearGradient
          colors={["#EC4899", "#DB2777"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.widget, styles.widgetHalf]}
        >
          <Text style={styles.widgetLabel}>Dominadas</Text>
          <Text style={styles.widgetNumber}>{stats?.masteredWords}</Text>
          <Text style={styles.widgetSubtitle}>
            {stats?.totalWords && stats.totalWords > 0
              ? `${Math.round((stats.masteredWords / stats.totalWords) * 100)}%`
              : "0%"}
          </Text>
        </LinearGradient>

        {/* Success Rate Widget */}
        <LinearGradient
          colors={["#06B6D4", "#0891B2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.widget, styles.widgetHalf]}
        >
          <Text style={styles.widgetLabel}>Taxa de Sucesso</Text>
          <Text style={styles.widgetNumber}>{stats?.successRate}%</Text>
          <Text style={styles.widgetSubtitle}>de aproveitamento</Text>
        </LinearGradient>
      </View>

      {/* CEFR Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progresso para Próximo Nível</Text>
        <CEFRProgressBar stats={stats} />
      </View>

      {/* Recent Sessions */}
      {state.sessions.length > 0 && (
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Histórico de Sessões</Text>
          {state.sessions.map((session, index) => (
            <View key={index} style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>{session.date}</Text>
                <Text style={styles.sessionStats}>
                  {session.wordsLearned} palavras aprendidas
                </Text>
              </View>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                  {session.masteredCount}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {state.sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📚</Text>
          <Text style={styles.emptyStateTitle}>Sem histórico ainda</Text>
          <Text style={styles.emptyStateSubtitle}>
            Comece a aprender para ver seu progresso aqui
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

/**
 * Componente para mostrar progresso até o próximo nível CEFR
 */
const CEFRProgressBar: React.FC<{ stats: ProgressStats | null }> = ({
  stats,
}) => {
  if (!stats) return null;

  const currentLevel = CEFR_LEVELS[stats.cefrLevel];
  const nextLevelKey = Object.keys(CEFR_LEVELS)[
    Object.keys(CEFR_LEVELS).indexOf(stats.cefrLevel) + 1
  ] as CEFRLevel | undefined;
  const nextLevel = nextLevelKey ? CEFR_LEVELS[nextLevelKey] : null;

  if (!nextLevel) {
    return (
      <View style={styles.cefrMaxLevel}>
        <Text style={styles.cefrMaxLevelText}>
          🎓 Você alcançou o nível máximo! Parabéns!
        </Text>
      </View>
    );
  }

  const progress = Math.min(
    (stats.totalWords - currentLevel.min) / (nextLevel.min - currentLevel.min),
    1,
  );

  return (
    <View style={styles.progressBar}>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>
          {stats.cefrLevel} ({currentLevel.min})
        </Text>
        <Text style={styles.progressLabel}>
          {nextLevelKey} ({nextLevel.min})
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressDistance}>
        Faltam {Math.max(0, nextLevel.min - stats.totalWords)} palavras
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Inter",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Inter",
  },

  cefrCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  cefrContent: {
    alignItems: "center",
  },

  cefrLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Inter",
    marginBottom: 8,
  },

  cefrLevel: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  cefrTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  cefrDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: "Inter",
  },

  widgetRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },

  widget: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  widgetHalf: {
    flex: 1,
  },

  widgetLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Inter",
    marginBottom: 8,
  },

  widgetNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  widgetSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Inter",
  },

  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },

  progressBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    fontFamily: "Inter",
  },

  progressTrack: {
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

  progressDistance: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
    fontFamily: "Inter",
  },

  cefrMaxLevel: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  cefrMaxLevelText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "600",
    fontFamily: "Inter",
  },

  sessionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  sessionInfo: {
    flex: 1,
  },

  sessionDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Inter",
  },

  sessionStats: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter",
  },

  sessionBadge: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  sessionBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    marginHorizontal: 16,
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Inter",
  },
});

export default DashboardScreen;
