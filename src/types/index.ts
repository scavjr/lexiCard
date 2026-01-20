/**
 * Tipos básicos do projeto LexiCard
 * Interfaces principais para comunicação entre componentes e serviços
 */

/**
 * Representa uma organização no sistema multi-tenant
 */
export interface IOrganization {
  id: string;
  name: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

/**
 * Representa um usuário do sistema
 */
export interface IUser {
  id: string;
  email: string;
  organization_id: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

/**
 * Representa uma palavra no vocabulário
 */
export interface IWord {
  id: string;
  word: string;
  translation: string;
  definition?: string;
  audio_url?: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Progresso do usuário com uma palavra
 */
export interface IUserProgress {
  id: string;
  user_id: string;
  word_id: string;
  organization_id: string;
  acertos: number; // 0-3+
  data_ultimo_acerto?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Sessão de estudo do usuário
 */
export interface IFlashcardSession {
  id: string;
  user_id: string;
  organization_id: string;
  data_sessao: string;
  total_aprendidas: number;
  total_revisadas: number;
  created_at: string;
  updated_at: string;
}

/**
 * Resposta da API dictionaryapi.dev
 */
export interface IDictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    audio?: string;
    text?: string;
  }>;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
}

/**
 * Props para o componente FlashCard
 */
export interface IFlashCardProps {
  word: IWord;
  currentProgress: IUserProgress | null;
  onAcerto: () => Promise<void>;
  onErro: () => Promise<void>;
  onAudioPlay?: () => void;
}

/**
 * Contexto de autenticação
 */
export interface IAuthContext {
  user: IUser | null;
  organization: IOrganization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, organization: Partial<IOrganization>) => Promise<void>;
}

/**
 * Estado global do app
 */
export interface IAppState {
  user: IUser | null;
  organization: IOrganization | null;
  currentWord: IWord | null;
  wordHistory: IWord[];
  isOffline: boolean;
  isSyncing: boolean;
}

/**
 * Nível CEFR (Common European Framework of Reference)
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Interface para cálculo de progresso
 */
export interface IProgressStats {
  totalWordsMastered: number;
  totalWordsLearned: number;
  level: CEFRLevel;
  percentageToNextLevel: number;
  sessionCount: number;
  lastSessionDate: string | null;
}

/**
 * Erros customizados da aplicação
 */
export class LexiCardError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LexiCardError';
  }
}

/**
 * Tipos de resposta da API
 */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
