/**
 * Tela de Sign Up - Cadastro com Supabase
 * Email + Senha + Confirmação de Senha + Organização
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "@/services/supabase";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

interface SignUpScreenProps {
  onSignUpSuccess: (userId: string, organizationId: string) => void;
  onNavigateToLogin: () => void;
}

interface Organization {
  id: string;
  name: string;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const { toast, error: showError, success } = useToast();

  // Carregar organizações disponíveis
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name")
          .order("name");

        if (error) {
          showError(`Erro ao carregar organizações: ${error.message}`);
        } else if (data) {
          setOrganizations(data as Organization[]);
          if (data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        }
      } catch (err: any) {
        showError(`Erro: ${err.message}`);
      } finally {
        setLoadingOrgs(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleSignUp = async () => {
    // Validação
    if (!email || !password || !confirmPassword) {
      showError("Email, senha e confirmação são obrigatórios");
      return;
    }

    if (password.length < 6) {
      showError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      showError("As senhas não coincidem");
      return;
    }

    if (!selectedOrgId) {
      showError("Selecione uma organização");
      return;
    }

    setLoading(true);

    try {
      // 1. Registrar usuário com Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        showError(`Erro de cadastro: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      if (!data.user) {
        showError("Erro ao criar usuário");
        setLoading(false);
        return;
      }

      const userId = data.user.id;

      // 2. Criar associação user_organizations
      // @ts-ignore - Tabela user_organizations será adicionada após migration
      const { error: assocError } = (await supabase
        .from("user_organizations" as any)
        .insert({
          user_id: userId,
          organization_id: selectedOrgId,
          role: "member", // Role padrão
        })) as any;

      if (assocError) {
        showError(`Erro ao associar organização: ${assocError.message}`);

        // Tentar fazer logout do usuário criado
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      success(`Cadastro realizado! Bem-vindo ${email}`);

      // Chamar callback
      setTimeout(() => {
        onSignUpSuccess(userId, selectedOrgId);
      }, 1500);
    } catch (err: any) {
      showError(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOrgs) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Carregando organizações...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📚 LexiCard</Text>
          <Text style={styles.subtitle}>Crie sua Conta</Text>
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

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            secureTextEntry
          />

          <Text style={styles.label}>Organização</Text>
          <View style={styles.orgContainer}>
            {organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={[
                  styles.orgButton,
                  selectedOrgId === org.id && styles.orgButtonSelected,
                ]}
                onPress={() => setSelectedOrgId(org.id)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.orgButtonText,
                    selectedOrgId === org.id && styles.orgButtonTextSelected,
                  ]}
                >
                  {org.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={onNavigateToLogin}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>Já tem conta? Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
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
    gap: 12,
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
    marginBottom: 8,
  },
  orgContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  orgButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  orgButtonSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  orgButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  orgButtonTextSelected: {
    color: "#fff",
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
    marginVertical: 16,
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
});

export default SignUpScreen;
