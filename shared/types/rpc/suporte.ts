/**
 * RPC Types — Módulo Suporte
 *
 * Tipos de entrada para as funções RPC de CUD:
 * tickets, mensagens, notas internas
 */

import type { TicketAnexo, TicketMetadata } from "../jsonb";

// =============================================
// RPCs de Ticket
// =============================================

/** Parâmetros para fn_rpc_criar_ticket */
export interface RpcCriarTicketParams {
	loja_id: string;
	titulo: string;
	categoria?: string;
	prioridade?: string; // default: 'normal'
	canal?: string; // default: 'chat'
	metadata?: TicketMetadata;
}

/** Parâmetros para fn_rpc_atualizar_ticket */
export interface RpcAtualizarTicketParams {
	ticket_id: string;
	categoria?: string;
	prioridade?: string;
	status?: string;
}

/** Parâmetros para fn_rpc_atribuir_ticket (designar responsável Master) */
export interface RpcAtribuirTicketParams {
	ticket_id: string;
	atribuido_a: string; // perfil_id do membro master
}

/** Parâmetros para fn_rpc_resolver_ticket */
export interface RpcResolverTicketParams {
	p_ticket_id: string;
	p_resolucao?: string;
}

/** Parâmetros para fn_rpc_responder_csat */
export interface RpcResponderCsatParams {
	p_ticket_id: string;
	p_nota: number; // 1 a 5
	p_comentario?: string;
}

/** Parâmetros para fn_rpc_marcar_mensagens_lidas */
export interface RpcMarcarMensagensLidasParams {
	p_ticket_id: string;
}

// =============================================
// RPCs de Mensagem
// =============================================

/** Parâmetros para fn_rpc_enviar_mensagem_ticket */
export interface RpcEnviarMensagemTicketParams {
	ticket_id: string;
	conteudo?: string; // null aceito se tiver anexo
	anexos?: TicketAnexo[];
}

// =============================================
// RPCs de Nota Interna (somente Master)
// =============================================

/** Parâmetros para fn_rpc_criar_nota_ticket */
export interface RpcCriarNotaTicketParams {
	p_ticket_id: string;
	p_conteudo: string;
}
