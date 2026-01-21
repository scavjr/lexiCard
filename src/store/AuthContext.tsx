/**
 * AuthContext - Gerencia autenticação e organização do usuário
 * Persiste sessão e organizationId no AsyncStorage
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/services/supabase";

interface AuthContextType {
  userId: string | null;
  organizationId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, organizationId: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sessão ao montar
  useEffect(() => {
    restoreSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUserId(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        setOrganizationId(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const restoreSession = async () => {
    try {
      setIsLoading(true);

      // 1. Verificar se há sessão ativa
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Não há sessão, limpar AsyncStorage
        await AsyncStorage.removeItem("@auth_userId");
        await AsyncStorage.removeItem("@auth_organizationId");
        setIsLoading(false);
        return;
      }

      const user = session.user;

      // 2. Restaurar do AsyncStorage se disponível
      const storedUserId = await AsyncStorage.getItem("@auth_userId");
      const storedOrgId = await AsyncStorage.getItem("@auth_organizationId");

      if (storedUserId && storedOrgId) {
        setUserId(storedUserId);
        setOrganizationId(storedOrgId);
      } else {
        // Buscar organização do usuário
        // @ts-ignore - Tabela user_organizations será adicionada após migration
        const { data: userOrg, error: orgError } = (await supabase
          .from("user_organizations" as any)
          .select("organization_id")
          .eq("user_id", user.id)
          .single()) as any;

        if (!orgError && userOrg) {
          setUserId(user.id);
          setOrganizationId((userOrg as any).organization_id);

          // Salvar no AsyncStorage
          await AsyncStorage.setItem("@auth_userId", user.id);
          await AsyncStorage.setItem(
            "@auth_organizationId",
            (userOrg as any).organization_id,
          );
        }
      }
    } catch (err) {
      console.error("[AuthContext] Error restoring session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newUserId: string, newOrganizationId: string) => {
    try {
      setUserId(newUserId);
      setOrganizationId(newOrganizationId);

      // Persistir no AsyncStorage
      await AsyncStorage.setItem("@auth_userId", newUserId);
      await AsyncStorage.setItem("@auth_organizationId", newOrganizationId);
    } catch (err) {
      console.error("[AuthContext] Error during login:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Fazer logout do Supabase Auth
      await supabase.auth.signOut();

      // Limpar estado
      setUserId(null);
      setOrganizationId(null);

      // Limpar AsyncStorage
      await AsyncStorage.removeItem("@auth_userId");
      await AsyncStorage.removeItem("@auth_organizationId");
    } catch (err) {
      console.error("[AuthContext] Error during logout:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        organizationId,
        isLoading,
        isAuthenticated: !!userId && !!organizationId,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;
