import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { HomeScreen } from "@/screens/HomeScreen";
import { ExerciseSelector } from "@/screens/ExerciseSelector";
import { ExerciseScreen } from "@/screens/ExerciseScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import { useAuth } from "@/store/AuthContext";

interface Word {
  id: string;
  word: string;
  definition: string | null;
  audio_url?: string | null;
  examples?: string[];
  translation?: string;
}

interface ExerciseStats {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  duration: number;
}

type Screen = "home" | "exercise-selector" | "exercise" | "dashboard";

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
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleStartExercise = (words: Word[]) => {
    setSelectedWords(words);
    setCurrentScreen("exercise");
  };

  const handleExerciseComplete = (_stats: ExerciseStats) => {
    setCurrentScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Conteúdo */}
      <View style={styles.content}>
        {currentScreen === "home" && (
          <HomeScreen
            userId={userId}
            organizationId={organizationId}
            onStartExercise={() => setCurrentScreen("exercise-selector")}
            onDashboard={() => setCurrentScreen("dashboard")}
            onLogout={handleLogout}
          />
        )}
        {currentScreen === "exercise-selector" && (
          <ExerciseSelector
            userId={userId}
            organizationId={organizationId}
            onStartExercise={handleStartExercise}
            onCancel={() => setCurrentScreen("home")}
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
        {/* Home Tab */}
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
            🏠 Início
          </Text>
        </TouchableOpacity>

        {/* ExerciseSelector Tab (apenas quando em seleção) */}
        <TouchableOpacity
          style={[
            styles.tab,
            currentScreen === "exercise-selector" && styles.tabActive,
          ]}
          onPress={() => setCurrentScreen("exercise-selector")}
        >
          <Text
            style={[
              styles.tabLabel,
              currentScreen === "exercise-selector" && styles.tabLabelActive,
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
