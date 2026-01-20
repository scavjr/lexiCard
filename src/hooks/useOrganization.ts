/**
 * Hook customizado para gerenciar contexto e validação de organização
 * Implementa isolamento multi-tenant
 */

import { useEffect, useState } from "react";
import { useAsyncStorage } from "@/hooks/useLocalStorage";
import supabase, { getCurrentUser } from "@/services/supabase";
import { LexiCardError } from "@/types";
import { Tables } from "@/types/database";

type DbOrganization = Tables<"organizations">;
type DbUser = Tables<"users">;

/**
 * Hook para obter e validar organização do usuário
 */
export function useOrganization() {
  const [organization, setOrganization] = useState<DbOrganization | null>(
    null
  );
  const [user, setUser] = useState<(DbUser & { auth_id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<LexiCardError | null>(null);

  const { getItem: getStoredOrgId, setItem: setStoredOrgId } =
    useAsyncStorage("organization_id");
  const { getItem: getStoredUserId, setItem: setStoredUserId } =
    useAsyncStorage("user_id");

  /**
   * Carrega organização e usuário ao inicializar
   */
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Obtém usuário autenticado
        const authUser = await getCurrentUser();
        if (!authUser) {
          setOrganization(null);
          setUser(null);
          return;
        }

        // 2. Tenta carregar organização do storage
        let storedOrgId = await getStoredOrgId();
        let dbUser: DbUser | null = null;

        // 3. Se não houver no storage, busca no banco
        if (!storedOrgId) {
          const { data, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (userError) {
            throw new LexiCardError(
              "USER_NOT_FOUND",
              "Usuário não encontrado no banco de dados. Verifique se está registrado."
            );
          }

          dbUser = data;
          storedOrgId = dbUser.organization_id;

          // Salva no storage para próximo acesso
          await setStoredOrgId(storedOrgId);
          await setStoredUserId(dbUser.id);
        } else {
          // Recarrega usuário do banco
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (userError) {
            throw new LexiCardError(
              "USER_NOT_FOUND",
              "Usuário não encontrado no banco de dados"
            );
          }

          dbUser = userData;
        }

        // 4. Valida se organização foi encontrada
        if (!storedOrgId) {
          throw new LexiCardError(
            "ORG_NOT_FOUND",
            "Nenhuma organização associada ao usuário"
          );
        }

        // 5. Carrega dados da organização
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", storedOrgId)
          .single();

        if (orgError) {
          throw new LexiCardError(
            "ORG_LOAD_ERROR",
            "Erro ao carregar dados da organização"
          );
        }

        // 6. Valida que o usuário pertence à organização
        if (dbUser.organization_id !== orgData.id) {
          throw new LexiCardError(
            "ORG_MISMATCH",
            "Usuário não pertence a esta organização"
          );
        }

        // 7. Define estado
        setOrganization(orgData);
        setUser({
          ...dbUser,
          auth_id: authUser.id,
        });
      } catch (err) {
        const error = err instanceof LexiCardError ? err : new LexiCardError(
          "UNKNOWN_ERROR",
          err instanceof Error ? err.message : "Erro desconhecido"
        );
        setError(error);
        console.error("useOrganization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganization();
  }, [getStoredOrgId, setStoredOrgId, getStoredUserId, setStoredUserId]);

  /**
   * Valida se usuário tem acesso a um recurso da organização
   */
  const validateAccess = async (resourceOrgId: string): Promise<boolean> => {
    if (!organization) {
      throw new LexiCardError(
        "NOT_AUTHENTICATED",
        "Usuário não autenticado"
      );
    }

    if (organization.id !== resourceOrgId) {
      throw new LexiCardError(
        "ACCESS_DENIED",
        "Acesso negado a este recurso"
      );
    }

    return true;
  };

  /**
   * Obtém filtro para queries de organização
   */
  const getOrgFilter = () => {
    if (!organization) {
      throw new LexiCardError(
        "NOT_AUTHENTICATED",
        "Organização não carregada"
      );
    }
    return { organization_id: organization.id };
  };

  /**
   * Valida se usuário é admin da organização
   */
  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  /**
   * Carrega organização por ID (com validação)
   */
  const getOrganizationById = async (orgId: string): Promise<DbOrganization> => {
    if (organization?.id !== orgId) {
      throw new LexiCardError(
        "ACCESS_DENIED",
        "Acesso negado a esta organização"
      );
    }

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (error) {
      throw new LexiCardError(
        "ORG_LOAD_ERROR",
        "Erro ao carregar organização"
      );
    }

    return data;
  };

  return {
    organization,
    user,
    isLoading,
    error,
    validateAccess,
    getOrgFilter,
    isAdmin,
    getOrganizationById,
  };
}

export default useOrganization;
