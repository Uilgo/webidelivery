```typescript
/**
 * RPC Types — Módulo Notificações
 *
 * Tipos de entrada para as funções RPC de CUD:
 * criação, leitura e exclusão de notificações
 */

import type { NotificacaoPayload } from "../jsonb";

// =============================================
// RPCs de Notificação
// =============================================

/** Parâmetros para rpc_criar_notificacao */
export interface RpcCriarNotificacaoParams {
	perfil_id: string;
	loja_id?: string; // null = notificação de sistema
	tipo: string; // 'pedido_novo', 'ticket_respondido', etc
	payload: NotificacaoPayload;
}

/** Parâmetros para rpc_marcar_notificacao_lida */
export interface RpcMarcarNotificacaoLidaParams {
	notificacao_id: string;
}

/** Parâmetros para rpc_marcar_todas_lidas */
export interface RpcMarcarTodasLidasParams {
	perfil_id: string;
}

/** Parâmetros para rpc_deletar_notificacao (soft delete) */
export interface RpcDeletarNotificacaoParams {
	notificacao_id: string;
}
```
