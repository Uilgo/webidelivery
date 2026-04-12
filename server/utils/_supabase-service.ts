/**
 * _supabase-service
 *
 * Retorna o cliente Supabase com service_role key (bypass de RLS).
 * Usar APENAS em server routes que precisam de acesso admin.
 *
 * Usa SUPABASE_SECRET_KEY (v2+) — nunca exposta ao cliente.
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { H3Event } from "h3";

export { serverSupabaseServiceRole as getServiceClient };

/**
 * Atalho tipado para obter o cliente admin em server routes.
 *
 * @example
 * const admin = getAdminClient(event)
 * await admin.auth.admin.updateUserById(userId, { password: newPassword })
 */
export const getAdminClient = (event: H3Event) => serverSupabaseServiceRole(event);
