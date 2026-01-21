/**
 * Tela de Login - Autenticação com Supabase
 * Email + Senha → Retorna usuário autenticado
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "@/services/supabase";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

interface LoginScreenProps {
  onLoginSuccess: (userId: string, organizationId: string) => void;
  onNavigateToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, error: showError, success } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Email e senha são obrigatórios");
      return;
    }

    if (password.length < 6) {
      showError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // 1. Autenticar com Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) {
        showError(`Erro de login: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!data.user) {
        showError("Usuário não encontrado");
        setLoading(false);
        return;
      }

      const userId = data.user.id;

      // 2. Buscar organização do usuário
      // @ts-ignore - Tabela user_organizations será adicionada após migration
      const { data: userOrg, error: orgError } = (await supabase
        .from("user_organizations" as any)
        .select("organization_id")
        .eq("user_id", userId)
        .single()) as any;

      if (orgError || !userOrg) {
        // ⚠️ Usuário não tem organização associada
        showError("Usuário não está associado a nenhuma organização");

        // Logout automático
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const organizationId = (userOrg as any).organization_id;

      success(`Bem-vindo! ${email}`);

      // Chamar callback após sucesso
      setTimeout(() => {
        onLoginSuccess(userId, organizationId);
      }, 1500);
    } catch (err: any) {
      showError(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📚 LexiCard</Text>
          <Text style={styles.subtitle}>Aprenda Inglês com Flashcards</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={onNavigateToSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Supabase Auth • Multi-Tenant</Text>
        </View>
      </View>

      {/* Toast */}
      {toast && <Toast {...toast} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    paddingHorizontal: 12,
    color: "#999",
    fontSize: 14,
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: "#6366f1",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});

export default LoginScreen;
