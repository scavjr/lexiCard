import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./src/store/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";

/**
 * Componente principal com navegação de autenticação
 */
function AppContent() {
  const { isLoading, isAuthenticated, userId, organizationId, login } =
    useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  // Tela de carregamento enquanto restaura sessão
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Se não autenticado, mostrar telas de auth
  if (!isAuthenticated) {
    return showSignUp ? (
      <SignUpScreen
        onSignUpSuccess={(newUserId, newOrgId) => {
          login(newUserId, newOrgId);
        }}
        onNavigateToLogin={() => setShowSignUp(false)}
      />
    ) : (
      <LoginScreen
        onLoginSuccess={(newUserId, newOrgId) => {
          login(newUserId, newOrgId);
        }}
        onNavigateToSignUp={() => setShowSignUp(true)}
      />
    );
  }

  // Se autenticado, mostrar o app com navegação
  return (
    <>
      <AppNavigator
        userId={userId || ""}
        organizationId={organizationId || ""}
      />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
