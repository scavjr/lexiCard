/**
 * Hook para gerenciar AsyncStorage de forma segura e tipada
 * Usado para cache offline-first
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

/**
 * Hook genérico para AsyncStorage
 */
export function useAsyncStorage(key: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Obtém item do storage
   */
  const getItem = useCallback(
    async (defaultValue?: string | null): Promise<string | null> => {
      try {
        setIsLoading(true);
        const value = await AsyncStorage.getItem(key);
        return value || defaultValue || null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error getting item from AsyncStorage [${key}]:`, error);
        return defaultValue || null;
      } finally {
        setIsLoading(false);
      }
    },
    [key]
  );

  /**
   * Define item no storage
   */
  const setItem = useCallback(
    async (value: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        await AsyncStorage.setItem(key, value);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error setting item in AsyncStorage [${key}]:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [key]
  );

  /**
   * Remove item do storage
   */
  const removeItem = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Error removing item from AsyncStorage [${key}]:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  /**
   * Limpa todo o storage (cuidado!)
   */
  const clear = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.clear();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error clearing AsyncStorage:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getItem, setItem, removeItem, clear, isLoading, error };
}

/**
 * Hook para gerenciar cache de palavras por organização
 */
export function useWordCache(organizationId: string) {
  const storageKey = `words_cache_${organizationId}`;
  const { getItem, setItem } = useAsyncStorage(storageKey);

  /**
   * Obtém palavras em cache
   */
  const getCachedWords = useCallback(async (): Promise<any[]> => {
    try {
      const cached = await getItem();
      if (!cached) return [];
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error parsing cached words:", err);
      return [];
    }
  }, [getItem]);

  /**
   * Salva palavras em cache
   */
  const setCachedWords = useCallback(
    async (words: any[]): Promise<void> => {
      try {
        await setItem(JSON.stringify(words));
      } catch (err) {
        console.error("Error caching words:", err);
      }
    },
    [setItem]
  );

  /**
   * Adiciona uma palavra ao cache
   */
  const addWordToCache = useCallback(
    async (word: any): Promise<void> => {
      try {
        const cached = await getCachedWords();
        const updated = [...cached, word];
        await setCachedWords(updated);
      } catch (err) {
        console.error("Error adding word to cache:", err);
      }
    },
    [getCachedWords, setCachedWords]
  );

  return { getCachedWords, setCachedWords, addWordToCache };
}

/**
 * Hook para gerenciar cache de progresso do usuário
 */
export function useProgressCache(organizationId: string, userId: string) {
  const storageKey = `progress_cache_${organizationId}_${userId}`;
  const { getItem, setItem } = useAsyncStorage(storageKey);

  /**
   * Obtém progresso em cache
   */
  const getCachedProgress = useCallback(async (): Promise<any[]> => {
    try {
      const cached = await getItem();
      if (!cached) return [];
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error parsing cached progress:", err);
      return [];
    }
  }, [getItem]);

  /**
   * Salva progresso em cache
   */
  const setCachedProgress = useCallback(
    async (progress: any[]): Promise<void> => {
      try {
        await setItem(JSON.stringify(progress));
      } catch (err) {
        console.error("Error caching progress:", err);
      }
    },
    [setItem]
  );

  /**
   * Atualiza progresso de uma palavra
   */
  const updateWordProgress = useCallback(
    async (wordId: string, acertos: number): Promise<void> => {
      try {
        const cached = await getCachedProgress();
        const updated = cached.map((p: any) =>
          p.word_id === wordId ? { ...p, acertos } : p
        );
        await setCachedProgress(updated);
      } catch (err) {
        console.error("Error updating word progress:", err);
      }
    },
    [getCachedProgress, setCachedProgress]
  );

  return { getCachedProgress, setCachedProgress, updateWordProgress };
}

export default useAsyncStorage;
