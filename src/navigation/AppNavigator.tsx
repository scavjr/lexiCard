/**
 * AppNavigator - Navegação entre telas (FlashCard e Dashboard)
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
import { FlashCardDemo } from "@/components/FlashCard.demo";
import DashboardScreen from "@/screens/DashboardScreen";
import { useAuth } from "@/store/AuthContext";

interface AppNavigatorProps {
  userId: string;
  organizationId: string;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  userId,
  organizationId,
}) => {
  const [currentTab, setCurrentTab] = useState<"home" | "dashboard">("home");
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Conteúdo */}
      <View style={styles.content}>
        {currentTab === "home" ? (
          <FlashCardDemo userId={userId} organizationId={organizationId} />
        ) : (
          <DashboardScreen userId={userId} organizationId={organizationId} />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        {/* Home Tab */}
        <TouchableOpacity
          style={[styles.tab, currentTab === "home" && styles.tabActive]}
          onPress={() => setCurrentTab("home")}
        >
          <Text
            style={[
              styles.tabLabel,
              currentTab === "home" && styles.tabLabelActive,
            ]}
          >
            🏠 Aprende
          </Text>
        </TouchableOpacity>

        {/* Dashboard Tab */}
        <TouchableOpacity
          style={[styles.tab, currentTab === "dashboard" && styles.tabActive]}
          onPress={() => setCurrentTab("dashboard")}
        >
          <Text
            style={[
              styles.tabLabel,
              currentTab === "dashboard" && styles.tabLabelActive,
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
