/**
 * =============================================
 * WebiDelivery — Tipos do Banco de Dados
 * =============================================
 *
 * Ponto de entrada principal para todos os tipos.
 *
 * Uso:
 *   import type { Pedido, CarrinhoItem, RpcCriarPedidoParams } from '#shared/types'
 *
 * Organização:
 *   - database/  → Row types (SELECT) — o que vem do banco
 *   - jsonb/     → Shapes de campos JSONB — subtipos reutilizáveis
 *   - rpc/       → Parâmetros de RPCs (CUD) — o que vai pro banco
 *   - supabase-database.ts → Database type global para useSupabaseClient<Database>()
 */

// Row types (leitura)
export * from "./database/index";

// JSONB shapes (subtipos)
export * from "./jsonb/index";

// RPC types (CUD params)
export * from "./rpc/index";

// Database type global (Supabase client)
// Comentei aqui pois o arquivo database.ts na raiz já é escaneado pelo Nuxt
// export type { Database } from "./database";
