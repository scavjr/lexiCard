/**
 * AppNavigator - Navegação entre telas (Exercício, Dashboard, etc)
 * Com tabs na base para alternar entre telas
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { ExerciseSelector } from "@/screens/ExerciseSelector";
import { ExerciseScreen } from "@/screens/ExerciseScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import { useAuth } from "@/store/AuthContext";

interface Word {
  id: string;
  word: string;
  definition: string;
  audio_url?: string;
  examples?: string[];
}

interface ExerciseStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  duration: number;
}

type Screen = "home" | "dashboard" | "exercise-selector" | "exercise";

interface AppNavigatorProps {
  userId: string;
  organizationId: string;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  userId,
  organizationId,
}) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(
    null,
  );
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleStartExercise = (words: Word[]) => {
    setSelectedWords(words);
    setCurrentScreen("exercise");
  };

  const handleExerciseComplete = (stats: ExerciseStats) => {
    setExerciseStats(stats);
    setCurrentScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Conteúdo */}
      <View style={styles.content}>
        {currentScreen === "home" && (
          <ExerciseSelector
            userId={userId}
            organizationId={organizationId}
            onStartExercise={handleStartExercise}
            onCancel={() => setCurrentScreen("dashboard")}
          />
        )}
        {currentScreen === "exercise" && selectedWords.length > 0 && (
          <ExerciseScreen
            userId={userId}
            organizationId={organizationId}
            words={selectedWords}
            onComplete={handleExerciseComplete}
            onCancel={() => setCurrentScreen("home")}
          />
        )}
        {currentScreen === "dashboard" && (
          <DashboardScreen userId={userId} organizationId={organizationId} />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        {/* Exercício Tab */}
        <TouchableOpacity
          style={[styles.tab, currentScreen === "home" && styles.tabActive]}
          onPress={() => setCurrentScreen("home")}
        >
          <Text
            style={[
              styles.tabLabel,
              currentScreen === "home" && styles.tabLabelActive,
            ]}
          >
            📚 Exercício
          </Text>
        </TouchableOpacity>

        {/* Dashboard Tab */}
        <TouchableOpacity
          style={[
            styles.tab,
            currentScreen === "dashboard" && styles.tabActive,
          ]}
          onPress={() => setCurrentScreen("dashboard")}
        >
          <Text
            style={[
              styles.tabLabel,
              currentScreen === "dashboard" && styles.tabLabelActive,
            ]}
          >
            📊 Progresso
          </Text>
        </TouchableOpacity>

        {/* Logout Tab */}
        <TouchableOpacity style={styles.tab} onPress={handleLogout}>
          <Text style={styles.tabLabel}>🚪 Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f8f9fa",
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 3,
    borderTopColor: "transparent",
  },
  tabActive: {
    borderTopColor: "#6366f1",
    backgroundColor: "#f0f4ff",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#6366f1",
  },
});

export default AppNavigator;
