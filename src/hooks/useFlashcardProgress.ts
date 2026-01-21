import { useState, useCallback } from "react";
import { supabase } from "@/services/supabase";

/**
 * CEFR Levels mapping
 * A1 (0-50 words), A2 (50-250), B1 (250-1000), B2 (1000-3000), C1 (3000-8000), C2 (8000+)
 */
export const CEFR_LEVELS = {
  A1: { min: 0, max: 50, label: "A1 - Beginner" },
  A2: { min: 50, max: 250, label: "A2 - Elementary" },
  B1: { min: 250, max: 1000, label: "B1 - Intermediate" },
  B2: { min: 1000, max: 3000, label: "B2 - Upper-Intermediate" },
  C1: { min: 3000, max: 8000, label: "C1 - Advanced" },
  C2: { min: 8000, max: Infinity, label: "C2 - Mastery" },
} as const;

export type CEFRLevel = keyof typeof CEFR_LEVELS;

export interface ProgressStats {
  totalWords: number;
  masteredWords: number;
  cefrLevel: CEFRLevel;
  cefrLabel: string;
  successRate: number;
}

export interface FeedbackResult {
  success: boolean;
  message: string;
  isMastered?: boolean;
  stats?: ProgressStats;
}

/**
 * Hook para gerenciar progresso e pontuação do usuário
 * Registra acertos/erros no Supabase e calcula nível CEFR
 */
export function useFlashcardProgress(
  organizationId: string,
  userId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registrar acerto de uma palavra
   * Incrementa contador de acertos e verifica se atingiu 3 (mastered)
   */
  const recordCorrect = useCallback(
    async (
      wordId: string,
    ): Promise<FeedbackResult> => {
      setLoading(true);
      setError(null);

      try {
        // Buscar progresso atual
        const { data: existing, error: fetchError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("word_id", wordId)
          .eq("organization_id", organizationId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        const acertos = (existing?.acertos || 0) + 1;
        const isMastered = acertos >= 3;

        // Atualizar ou criar registro de progresso
        if (existing) {
          const { error: updateError } = await supabase
            .from("user_progress")
            .update({
              acertos,
              data_ultimo_acerto: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("user_progress")
            .insert({
              user_id: userId,
              word_id: wordId,
              organization_id: organizationId,
              acertos,
              data_ultimo_acerto: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // Buscar estatísticas atualizadas
        const stats = await getProgressStats();

        return {
          success: true,
          message: isMastered ? "🎉 Parabéns! Você dominou esta palavra!" : `✓ Acertou! (${acertos}/3)`,
          isMastered,
          stats,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar acerto";
        setError(message);
        return {
          success: false,
          message: `Erro: ${message}`,
        };
      } finally {
        setLoading(false);
      }
    },
    [userId, organizationId],
  );

  /**
   * Registrar erro de uma palavra
   * Apenas registra, sem incrementar contador
   */
  const recordIncorrect = useCallback(
    async (wordId: string): Promise<FeedbackResult> => {
      setLoading(true);
      setError(null);

      try {
        // Buscar progresso atual
        const { data: existing, error: fetchError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("word_id", wordId)
          .eq("organization_id", organizationId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // Apenas registrar o erro sem incrementar acertos
        if (existing) {
          const { error: updateError } = await supabase
            .from("user_progress")
            .update({
              data_ultimo_acerto: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (updateError) throw updateError;
        } else {
          // Se não existe registro, criar com 0 acertos
          const { error: insertError } = await supabase
            .from("user_progress")
            .insert({
              user_id: userId,
              word_id: wordId,
              organization_id: organizationId,
              acertos: 0,
              data_ultimo_acerto: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // Buscar estatísticas atualizadas
        const stats = await getProgressStats();

        return {
          success: true,
          message: "✗ Errou! Tente novamente",
          isMastered: false,
          stats,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar erro";
        setError(message);
        return {
          success: false,
          message: `Erro: ${message}`,
        };
      } finally {
        setLoading(false);
      }
    },
    [userId, organizationId],
  );

  /**
   * Calcular estatísticas de progresso
   */
  const getProgressStats = useCallback(async (): Promise<ProgressStats> => {
    try {
      // Total de palavras aprendidas (acertos >= 1)
      const { data: totalData, error: totalError } = await supabase
        .from("user_progress")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gt("acertos", 0);

      if (totalError) throw totalError;

      // Total de palavras dominadas (acertos >= 3)
      const { data: masteredData, error: masteredError } = await supabase
        .from("user_progress")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .gte("acertos", 3);

      if (masteredError) throw masteredError;

      // Calcular taxa de sucesso
      const { data: _allData, error: allError } = await supabase
        .from("user_progress")
        .select("acertos")
        .eq("user_id", userId)
        .eq("organization_id", organizationId);

      if (allError) throw allError;

      const totalWords = totalData?.length || 0;
      const masteredWords = masteredData?.length || 0;

      // Calcular taxa de sucesso (porcentagem de acertos)
      const successRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

      // Determinar nível CEFR
      let cefrLevel: CEFRLevel = "A1";
      for (const [level, range] of Object.entries(CEFR_LEVELS)) {
        if (totalWords >= range.min && totalWords < range.max) {
          cefrLevel = level as CEFRLevel;
          break;
        }
      }

      return {
        totalWords,
        masteredWords,
        cefrLevel,
        cefrLabel: CEFR_LEVELS[cefrLevel].label,
        successRate,
      };
    } catch (err) {
      console.error("Erro ao calcular estatísticas:", err);
      return {
        totalWords: 0,
        masteredWords: 0,
        cefrLevel: "A1",
        cefrLabel: CEFR_LEVELS.A1.label,
        successRate: 0,
      };
    }
  }, [userId, organizationId]);

  return {
    recordCorrect,
    recordIncorrect,
    getProgressStats,
    loading,
    error,
  };
}
