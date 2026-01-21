/**
 * Cliente Supabase inicializado e pronto para uso
 * Responsável pela conexão com o banco de dados
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { ENV_CONFIG } from "@/config/env.generated";

// Usa o arquivo gerado pelo script inject-env.js (valores injetados no build)
const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;

// Debug temporário - remover depois
console.log("SUPABASE_URL exists:", !!SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase credentials not found. Check environment variables.");
}

/**
 * Cliente Supabase tipado com tipos da database
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Testa a conexão com Supabase
 * @returns {Promise<boolean>} true se conectado, false caso contrário
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection error:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection failed:", error);
    return false;
  }
}

/**
 * Obtém o usuário autenticado atual
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Logout do usuário
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    console.log("✅ User logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}

/**
 * Obtém a sessão atual
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
}

/**
 * Inscreve-se a mudanças de autenticação
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export default supabase;
