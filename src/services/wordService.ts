/**
 * Serviço de Palavras - Implementa estratégia de cache híbrido com tabelas globais
 * Fluxo: AsyncStorage → Supabase (words_global + words) → dictionaryapi.dev
 * 
 * Estratégia Híbrida:
 * - words_global: Palavras compartilhadas (sem organization_id)
 * - words: Customizações por organização (com organization_id)
 * 
 * Benefícios:
 * - Zero redundância: "hello" armazenado 1x globalmente
 * - Isolamento mantido: Orgs só veem suas customizações
 * - Performance: RLS rápido em words; global read em words_global
 */

import supabase from "@/services/supabase";
import { useWordCache } from "@/hooks/useLocalStorage";
import { Tables, TablesInsert } from "@/types/database";
import { IDictionaryEntry, LexiCardError } from "@/types";
import {
  validateOrganizationId,
  validateResourceAccess,
  sanitizeOrgData,
  createNotFoundError,
  retryAsync,
} from "@/utils/validation";

type DbWord = Tables<"words">;
type DbWordGlobal = Tables<"words_global">;
type DbWordGlobalInsert = TablesInsert<"words_global">;

type EnrichableWord = {
  id: string;
  word: string;
  definition: string | null;
  audio_url: string | null;
  examples?: string[];
};

/**
 * URLs externas para a API de dicionário
 */
const DICTIONARY_API_BASE_URL =
  process.env.EXPO_PUBLIC_DICTIONARY_API_URL ||
  "https://api.dictionaryapi.dev/api/v2/entries/en/";

/**
 * Classe para gerenciar palavras com cache híbrido
 */
class WordService {
  private organizationId: string | null = null;
  private userId: string | null = null;

  /**
   * Define o contexto de organização (deve ser chamado após autenticação)
   */
  setContext(organizationId: string, userId: string): void {
    if (!validateOrganizationId(organizationId)) {
      throw new LexiCardError(
        "INVALID_ORG_ID",
        "ID de organização inválido"
      );
    }

    this.organizationId = organizationId;
    this.userId = userId;
  }

  /**
   * Valida que o contexto foi inicializado
   */
  private validateContext(): void {
    if (!this.organizationId || !this.userId) {
      throw new LexiCardError(
        "CONTEXT_NOT_SET",
        "Contexto de organização não foi inicializado"
      );
    }
  }

  /**
   * Busca palavra com estratégia de cache híbrido
   * 1. AsyncStorage (cache local)
   * 2. Supabase (cache compartilhado)
   * 3. dictionaryapi.dev (fonte primária)
   */
  async fetchWord(word: string): Promise<DbWord> {
    this.validateContext();

    const normalizedWord = word.toLowerCase().trim();

    try {
      // 1️⃣ Tenta AsyncStorage
      const cachedWord = await this.getFromLocalCache(normalizedWord);
      if (cachedWord) {
        console.log(`✅ Palavra encontrada no cache local: ${normalizedWord}`);
        return cachedWord;
      }

      // 2️⃣ Tenta Supabase
      const dbWord = await this.getFromSupabase(normalizedWord);
      if (dbWord) {
        console.log(`✅ Palavra encontrada no Supabase: ${normalizedWord}`);
        // Salva no cache local
        await this.saveToLocalCache(dbWord);
        return dbWord;
      }

      // 3️⃣ Consulta API externa
      const apiData = await this.fetchFromAPI(normalizedWord);
      if (!apiData) {
        throw createNotFoundError(
          `Palavra não encontrada: ${normalizedWord}`
        );
      }

      // 4️⃣ Transforma e salva em Supabase + AsyncStorage
      const newWord = await this.saveWord(normalizedWord, apiData);
      console.log(
        `✅ Palavra salva em Supabase e cache: ${normalizedWord}`
      );

      return newWord;
    } catch (error) {
      const err =
        error instanceof LexiCardError
          ? error
          : new LexiCardError(
              "FETCH_WORD_ERROR",
              error instanceof Error ? error.message : "Erro ao buscar palavra"
            );
      console.error("Erro em fetchWord:", err);
      throw err;
    }
  }

  /**
   * Obtém palavra do cache local (AsyncStorage)
   */
  private async getFromLocalCache(word: string): Promise<DbWord | null> {
    try {
      this.validateContext();
      const { getCachedWords } = useWordCache(this.organizationId!);
      const cached = await getCachedWords();

      const found = cached.find(
        (w: DbWord) => w.word.toLowerCase() === word.toLowerCase()
      );

      return found || null;
    } catch (error) {
      console.warn("Erro ao buscar no cache local:", error);
      return null;
    }
  }

  /**
   * Obtém palavra do Supabase (UNION de words_global + customizações da org)
   * 
   * Estratégia:
   * 1. Buscar em words_global (palavras compartilhadas)
   * 2. Se existir customização em words, usar dados dessa (translation, etc)
   * 3. Retornar merged result com dados globais + customizações locais
   */
  private async getFromSupabase(word: string): Promise<DbWord | null> {
    try {
      this.validateContext();

      const lowerWord = word.toLowerCase();

      // 1️⃣ Busca palavra global
      const { data: globalData, error: globalError } = await supabase
        .from("words_global")
        .select("*")
        .eq("word", lowerWord)
        .single();

      if (globalError && globalError.code !== "PGRST116") {
        console.warn("Erro ao buscar em words_global:", globalError);
        return null;
      }

      // Se não encontrou nem na global, tenta direto em words (dados legados)
      if (!globalData) {
        const { data: legacyData, error: legacyError } = await supabase
          .from("words")
          .select("*")
          .eq("organization_id", this.organizationId!)
          .eq("word", lowerWord)
          .single();

        if (legacyError) {
          if (legacyError.code === "PGRST116") return null;
          throw legacyError;
        }

        return sanitizeOrgData(legacyData, this.organizationId!);
      }

      // 2️⃣ Se encontrou global, busca customizações da org
      const { data: orgData, error: orgError } = await supabase
        .from("words")
        .select("*")
        .eq("organization_id", this.organizationId!)
        .eq("word_global_id", (globalData as DbWordGlobal).id)
        .single();

      // Se não tem customização, cria resultado apenas da global
      if (orgError && orgError.code === "PGRST116") {
        // Não existe customização, cria palavra virtual com dados globais
        const virtualWord: DbWord = {
          id: (globalData as DbWordGlobal).id,
          word: (globalData as DbWordGlobal).word,
          definition: (globalData as DbWordGlobal).definition,
          audio_url: (globalData as DbWordGlobal).audio_url,
          translation: (globalData as DbWordGlobal).word, // Padrão: mesmo word
          word_global_id: (globalData as DbWordGlobal).id,
          organization_id: this.organizationId!,
          created_by: this.userId!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return virtualWord;
      }

      if (orgError) {
        console.warn("Erro ao buscar customização em words:", orgError);
        return null;
      }

      // 3️⃣ Merge: dados globais + customizações da org
      const merged: DbWord = {
        ...orgData,
        definition: orgData.definition || (globalData as DbWordGlobal).definition,
        audio_url: orgData.audio_url || (globalData as DbWordGlobal).audio_url,
      };

      return sanitizeOrgData(merged, this.organizationId!);
    } catch (error) {
      console.warn("Erro ao buscar no Supabase:", error);
      return null;
    }
  }

  /**
   * Busca palavra na API externa (dictionaryapi.dev)
   */
  private async fetchFromAPI(word: string): Promise<IDictionaryEntry | null> {
    try {
      const normalizedWord = word.toLowerCase().trim();
      const url = `${DICTIONARY_API_BASE_URL}${normalizedWord}`;

      const response = await retryAsync(
        async () => {
          const res = await fetch(url);

          if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`HTTP ${res.status}`);
          }

          return res.json();
        },
        3,
        500
      );

      // API retorna array
      if (Array.isArray(response) && response.length > 0) {
        return response[0];
      }

      return null;
    } catch (error) {
      console.warn("Erro ao buscar da API:", error);
      return null;
    }
  }

  /**
   * Salva palavra com abordagem híbrida
   * 
   * Fluxo:
   * 1. Tenta inserir em words_global (UNIQUE constraint)
   *    - Se já existe, apenas busca o ID
   *    - Se novo, cria com dados da API
   * 2. Cria/atualiza customização em words (org-specific)
   * 3. Salva no cache local
   */
  private async saveWord(
    word: string,
    apiData: IDictionaryEntry
  ): Promise<DbWord> {
    this.validateContext();

    const definition = apiData.meanings?.[0]?.definitions?.[0]?.definition;
    const audioUrl = this.extractAudioUrl(apiData);
    const phonetic = this.extractPhonetic(apiData);
    const translation = ""; // TODO: Integrar serviço de tradução
    const lowerWord = word.toLowerCase();

    try {
      // 1️⃣ Salva/busca em words_global (compartilhada)
      let globalId: string;

      // Tenta inserir na global
      const globalData: DbWordGlobalInsert = {
        word: lowerWord,
        definition: definition || undefined,
        audio_url: audioUrl || undefined,
        phonetic: phonetic || undefined,
      };

      const { data: insertedGlobal, error: globalError } = await supabase
        .from("words_global")
        .insert([globalData])
        .select()
        .single();

      if (globalError) {
        // Se unique constraint violation, busca existente
        if (globalError.code === "23505") {
          const { data: existing, error: existingError } = await supabase
            .from("words_global")
            .select("id")
            .eq("word", lowerWord)
            .single();

          if (existingError) throw existingError;
          globalId = (existing as { id: string }).id;
        } else {
          throw globalError;
        }
      } else {
        globalId = (insertedGlobal as DbWordGlobal).id;
      }

      // 2️⃣ Cria/atualiza customização em words (org-specific)
      const wordData: TablesInsert<"words"> = {
        word: lowerWord,
        translation: translation || lowerWord,
        definition: definition || undefined,
        audio_url: audioUrl || undefined,
        organization_id: this.organizationId!,
        created_by: this.userId!,
        word_global_id: globalId,
      };

      // Verifica se já existe customização dessa org
      const { data: existingOrgWord, error: checkError } = await supabase
        .from("words")
        .select("id")
        .eq("organization_id", this.organizationId!)
        .eq("word_global_id", globalId)
        .single();

      let savedWord: DbWord;

      if (checkError && checkError.code === "PGRST116") {
        // Não existe, cria nova customização
        const { data, error } = await supabase
          .from("words")
          .insert([wordData])
          .select()
          .single();

        if (error) {
          throw new LexiCardError(
            "SAVE_WORD_ERROR",
            "Erro ao salvar palavra no banco"
          );
        }

        savedWord = sanitizeOrgData(data as DbWord, this.organizationId!);
      } else if (checkError) {
        throw checkError;
      } else {
        // Já existe, atualiza
        const { data, error } = await supabase
          .from("words")
          .update({
            translation: wordData.translation,
            definition: wordData.definition,
            audio_url: wordData.audio_url,
          })
          .eq("id", (existingOrgWord as { id: string }).id)
          .select()
          .single();

        if (error) throw error;

        savedWord = sanitizeOrgData(data as DbWord, this.organizationId!);
      }

      // 3️⃣ Salva no cache local
      await this.saveToLocalCache(savedWord);

      return savedWord;
    } catch (error) {
      const err =
        error instanceof LexiCardError
          ? error
          : new LexiCardError(
              "SAVE_WORD_ERROR",
              error instanceof Error ? error.message : "Erro ao salvar palavra"
            );
      throw err;
    }
  }

  /**
   * Retorna o primeiro audio_url disponível na resposta da API.
   * Alguns verbetes têm vários phonetics; usamos o primeiro com audio não vazio.
   */
  private extractAudioUrl(apiData: IDictionaryEntry): string | null {
    const phonetics = apiData.phonetics || [];
    const withAudio = phonetics.find((p) => p.audio && p.audio.trim().length > 0);
    return withAudio?.audio || null;
  }

  /**
   * Extrai pronúncia escrita (phonetic) do primeiro phonetic disponível
   */
  private extractPhonetic(apiData: IDictionaryEntry): string | null {
    const phonetics = apiData.phonetics || [];
    const withText = phonetics.find((p) => p.text && p.text.trim().length > 0);
    return withText?.text || null;
  }

  /**
   * Salva palavra no cache local (AsyncStorage)
   */
  private async saveToLocalCache(word: DbWord): Promise<void> {
    try {
      this.validateContext();
      const { getCachedWords, setCachedWords } = useWordCache(
        this.organizationId!
      );

      const cached = await getCachedWords();
      const filtered = cached.filter((w: DbWord) => w.id !== word.id);
      const updated = [...filtered, word];

      await setCachedWords(updated);
    } catch (error) {
      console.warn("Erro ao salvar no cache local:", error);
      // Não lança erro, apenas avisa
    }
  }

  /**
   * Obtém todas as palavras da organização (UNION de global + customizações)
   */
  async getOrganizationWords(): Promise<DbWord[]> {
    this.validateContext();

    try {
      // Query: seleciona words_global ∪ words WHERE org_id
      // Implementado via múltiplas queries já que Supabase não suporta UNION direto
      
      const { data: customized, error: customError } = await supabase
        .from("words")
        .select("*")
        .eq("organization_id", this.organizationId!)
        .order("created_at", { ascending: false });

      if (customError) {
        throw new LexiCardError(
          "FETCH_WORDS_ERROR",
          "Erro ao buscar palavras da organização"
        );
      }

      // Retorna customizações (que contêm dados globais merged)
      return (customized || []).map((w) =>
        sanitizeOrgData(w, this.organizationId!)
      );
    } catch (error) {
      const err =
        error instanceof LexiCardError
          ? error
          : new LexiCardError(
              "FETCH_WORDS_ERROR",
              error instanceof Error ? error.message : "Erro ao buscar palavras"
            );
      console.error("Erro em getOrganizationWords:", err);
      throw err;
    }
  }

  /**
   * Busca palavras com filtro (busca em customizações da org)
   */
  async searchWords(
    query: string,
    limit: number = 10
  ): Promise<DbWord[]> {
    this.validateContext();

    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("organization_id", this.organizationId!)
        .or(`word.ilike.%${query}%,translation.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw new LexiCardError(
          "SEARCH_WORDS_ERROR",
          "Erro ao buscar palavras"
        );
      }

      return (data || []).map((w) =>
        sanitizeOrgData(w, this.organizationId!)
      );
    } catch (error) {
      const err =
        error instanceof LexiCardError
          ? error
          : new LexiCardError(
              "SEARCH_WORDS_ERROR",
              error instanceof Error ? error.message : "Erro ao buscar palavras"
            );
      console.error("Erro em searchWords:", err);
      throw err;
    }
  }

  /**
   * Obtém palavra por ID (com validação de organização)
   */
  async getWordById(wordId: string): Promise<DbWord> {
    this.validateContext();

    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("id", wordId)
        .eq("organization_id", this.organizationId!)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw createNotFoundError("Palavra");
        }
        throw error;
      }

      return sanitizeOrgData(data, this.organizationId!);
    } catch (error) {
      const err = error instanceof LexiCardError ? error : 
        new LexiCardError(
          "GET_WORD_ERROR",
          error instanceof Error ? error.message : "Erro ao obter palavra"
        );
      throw err;
    }
  }

  /**
   * Atualiza uma palavra
   */
  async updateWord(wordId: string, updates: Partial<DbWord>): Promise<DbWord> {
    this.validateContext();

    try {
      // Valida que a palavra pertence à organização
      const existing = await this.getWordById(wordId);
      if (!validateResourceAccess(existing.organization_id, this.organizationId!)) {
        throw new LexiCardError(
          "ACCESS_DENIED",
          "Sem permissão para atualizar esta palavra"
        );
      }

      const { data, error } = await supabase
        .from("words")
        .update(updates)
        .eq("id", wordId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updated = sanitizeOrgData(data, this.organizationId!);

      // Atualiza cache local
      await this.saveToLocalCache(updated);

      return updated;
    } catch (error) {
      const err = error instanceof LexiCardError ? error :
        new LexiCardError(
          "UPDATE_WORD_ERROR",
          error instanceof Error ? error.message : "Erro ao atualizar palavra"
        );
      throw err;
    }
  }

  /**
   * Deleta uma palavra
   */
  async deleteWord(wordId: string): Promise<void> {
    this.validateContext();

    try {
      // Valida que a palavra pertence à organização
      const existing = await this.getWordById(wordId);
      if (!validateResourceAccess(existing.organization_id, this.organizationId!)) {
        throw new LexiCardError(
          "ACCESS_DENIED",
          "Sem permissão para deletar esta palavra"
        );
      }

      const { error } = await supabase
        .from("words")
        .delete()
        .eq("id", wordId);

      if (error) {
        throw error;
      }

      // Remove do cache local
      try {
        const { getCachedWords, setCachedWords } = useWordCache(
          this.organizationId!
        );
        const cached = await getCachedWords();
        const filtered = cached.filter((w: DbWord) => w.id !== wordId);
        await setCachedWords(filtered);
      } catch (err) {
        console.warn("Erro ao remover do cache local:", err);
      }
    } catch (error) {
      const err = error instanceof LexiCardError ? error :
        new LexiCardError(
          "DELETE_WORD_ERROR",
          error instanceof Error ? error.message : "Erro ao deletar palavra"
        );
      throw err;
    }
  }

  /**
   * Enriquece múltiplas palavras com dados da API se necessário
   * Atualiza apenas colunas existentes (definition, audio_url)
   * e devolve exemplos em memória para uso imediato
   */
  async enrichWords(words: EnrichableWord[]): Promise<EnrichableWord[]> {
    console.log(`🔄 Enriquecendo ${words.length} palavras com dados da API...`);

    const enriched: EnrichableWord[] = [];

    for (const word of words) {
      try {
        const needsDefinition = !word.definition;
        const needsAudio = !word.audio_url;

        if (!needsDefinition && !needsAudio) {
          enriched.push({ ...word });
          continue;
        }

        console.log(
          `📚 Enriquecendo: ${word.word} (def: ${!needsDefinition}, audio: ${!needsAudio})`
        );

        const apiData = await this.fetchFromAPI(word.word);
        if (!apiData) {
          console.warn(`⚠️ Não encontrado na API: ${word.word}`);
          enriched.push({ ...word });
          continue;
        }

        const definition =
          apiData.meanings?.[0]?.definitions?.[0]?.definition || null;
        const audioUrl = this.extractAudioUrl(apiData);
        const phonetic = this.extractPhonetic(apiData);

        const examples: string[] = [];
        apiData.meanings?.forEach((meaning) => {
          meaning.definitions?.forEach((def) => {
            if (def.example && examples.length < 5) {
              examples.push(def.example);
            }
          });
        });

        const mergedWord: EnrichableWord = {
          ...word,
          definition: definition || word.definition,
          audio_url: audioUrl || word.audio_url,
          examples: examples.length > 0 ? examples : word.examples || [],
          translation: word.translation, // Manter tradução original
          phonetic: phonetic || word.phonetic, // Adicionar fonética se nova
        };

        if (definition || audioUrl || phonetic) {
          const updatePayload: {
            definition?: string | null;
            audio_url?: string | null;
            phonetic?: string | null;
          } = {};

          if (definition && definition !== word.definition) {
            updatePayload.definition = definition;
          }
          if (audioUrl && audioUrl !== word.audio_url) {
            updatePayload.audio_url = audioUrl;
          }
          if (phonetic) {
            updatePayload.phonetic = phonetic;
          }

          if (Object.keys(updatePayload).length > 0) {
            const { error } = await supabase
              .from("words_global")
              .update(updatePayload)
              .eq("id", word.id);

            if (error) {
              console.error(`❌ Erro ao atualizar ${word.word}:`, error);
            }
          }
        }

        console.log(
          `✅ Enriquecido: ${word.word} (def: ${!!mergedWord.definition}, audio: ${!!mergedWord.audio_url}, exemplos: ${mergedWord.examples?.length || 0})`
        );
        enriched.push(mergedWord);

        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`❌ Erro enriquecendo ${word.word}:`, error);
        enriched.push({ ...word });
      }
    }

    console.log(`✅ Enriquecimento completo: ${enriched.length}/${words.length}`);
    return enriched;
  }

  /**
   * Sincroniza cache local com Supabase
   * Útil para reconciliação pós-offline
   */
  async syncLocalCache(): Promise<void> {
    this.validateContext();

    try {
      console.log("🔄 Sincronizando cache local com Supabase...");

      const { getCachedWords } = useWordCache(this.organizationId!);
      const cached = await getCachedWords();

      if (cached.length === 0) {
        console.log("✅ Cache vazio, nada para sincronizar");
        return;
      }

      // Busca todas as palavras da organização no Supabase
      const allWords = await this.getOrganizationWords();
      const allWordIds = new Set(allWords.map((w) => w.id));

      // Remove palavras do cache que foram deletadas no Supabase
      const filtered = cached.filter((w: DbWord) => allWordIds.has(w.id));

      if (filtered.length !== cached.length) {
        const { setCachedWords } = useWordCache(this.organizationId!);
        await setCachedWords(filtered);
        console.log(
          `✅ Removidas ${cached.length - filtered.length} palavras deletadas`
        );
      }
    } catch (error) {
      console.error("Erro ao sincronizar cache:", error);
      // Não lança erro, apenas avisa
    }
  }
}

// Instância única do serviço
export const wordService = new WordService();

export default wordService;
