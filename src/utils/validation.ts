/**
 * Utilitários para validação e operações multi-tenant
 * Garante isolamento de dados entre organizações
 */

import { LexiCardError } from "@/types";

/**
 * Valida se um ID de organização é válido
 */
export function validateOrganizationId(orgId: string): boolean {
  if (!orgId || typeof orgId !== "string" || orgId.trim().length === 0) {
    return false;
  }
  return /^[a-f0-9-]{36}$/.test(orgId); // UUID format
}

/**
 * Valida se um ID de usuário é válido
 */
export function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return false;
  }
  return /^[a-f0-9-]{36}$/.test(userId); // UUID format
}

/**
 * Cria um filtro de query para organização
 */
export function createOrgFilter(organizationId: string) {
  if (!validateOrganizationId(organizationId)) {
    throw new LexiCardError(
      "INVALID_ORG_ID",
      "ID de organização inválido"
    );
  }

  return { organization_id: organizationId };
}

/**
 * Cria um filtro de query para usuário
 */
export function createUserFilter(organizationId: string, userId: string) {
  if (!validateOrganizationId(organizationId)) {
    throw new LexiCardError(
      "INVALID_ORG_ID",
      "ID de organização inválido"
    );
  }

  if (!validateUserId(userId)) {
    throw new LexiCardError(
      "INVALID_USER_ID",
      "ID de usuário inválido"
    );
  }

  return {
    organization_id: organizationId,
    user_id: userId,
  };
}

/**
 * Valida acesso a recurso por organização
 */
export function validateResourceAccess(
  resourceOrgId: string,
  userOrgId: string
): boolean {
  if (!validateOrganizationId(resourceOrgId) || !validateOrganizationId(userOrgId)) {
    return false;
  }

  return resourceOrgId === userOrgId;
}

/**
 * Cria chave de cache separada por organização
 */
export function createCacheKey(
  organizationId: string,
  baseKey: string,
  ...params: string[]
): string {
  if (!validateOrganizationId(organizationId)) {
    throw new LexiCardError(
      "INVALID_ORG_ID",
      "ID de organização inválido para criação de cache"
    );
  }

  return [organizationId, baseKey, ...params].join(":");
}

/**
 * Sanitiza dados para garantir que não vazem dados de outra organização
 */
export function sanitizeOrgData<T extends Record<string, any>>(
  data: T,
  expectedOrgId: string
): T {
  if (!data || typeof data !== "object") {
    return data;
  }

  if ("organization_id" in data && data.organization_id !== expectedOrgId) {
    throw new LexiCardError(
      "ORGANIZATION_MISMATCH",
      "Dados não pertencem à organização esperada"
    );
  }

  return data;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida senha (mínimo 6 caracteres)
 */
export function validatePassword(password: string): boolean {
  return !!(password && password.length >= 6);
}

/**
 * Cria erro de acesso negado
 */
export function createAccessDeniedError(reason?: string): LexiCardError {
  return new LexiCardError(
    "ACCESS_DENIED",
    reason || "Acesso negado a este recurso",
    403
  );
}

/**
 * Cria erro de não encontrado
 */
export function createNotFoundError(resource: string): LexiCardError {
  return new LexiCardError(
    "NOT_FOUND",
    `${resource} não encontrado`,
    404
  );
}

/**
 * Cria erro de já existe
 */
export function createAlreadyExistsError(resource: string): LexiCardError {
  return new LexiCardError(
    "ALREADY_EXISTS",
    `${resource} já existe`,
    409
  );
}

/**
 * Log seguro (não registra dados sensíveis)
 */
export function safeLog(
  message: string,
  data?: Record<string, any>
): void {
  if (!data) {
    console.log(`[LexiCard] ${message}`);
    return;
  }

  const sanitized = { ...data };
  // Remove campos sensíveis
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  delete sanitized.api_key;

  console.log(`[LexiCard] ${message}`, sanitized);
}

/**
 * Tratador de erro com retry logic
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error("Max retries exceeded");
}

export default {
  validateOrganizationId,
  validateUserId,
  createOrgFilter,
  createUserFilter,
  validateResourceAccess,
  createCacheKey,
  sanitizeOrgData,
  validateEmail,
  validatePassword,
  createAccessDeniedError,
  createNotFoundError,
  createAlreadyExistsError,
  safeLog,
  retryAsync,
};
