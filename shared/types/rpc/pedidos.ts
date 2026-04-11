/**
 * RPC Types — Módulo Pedidos
 *
 * Tipos de entrada para as funções RPC de CUD:
 * clientes, pedidos, histórico, avaliações
 */

import type {
	CarrinhoItem,
	ClienteEnderecoSalvo,
	ClientePerfilCRM,
	PedidoLogistica,
	PedidoPagamento,
	TagProblema,
} from "../jsonb";

// =============================================
// RPCs de Cliente
// =============================================

/** Parâmetros para fn_rpc_criar_cliente */
export interface RpcCriarClienteParams {
	loja_id: string;
	nome: string;
	telefone: string;
	tipo_cadastro?: string; // 'visitante' | 'registrado' (default: 'visitante')
	email?: string;
	device_token?: string;
	enderecos_salvos?: ClienteEnderecoSalvo[];
}

/** Parâmetros para fn_rpc_atualizar_cliente */
export interface RpcAtualizarClienteParams {
	cliente_id: string;
	nome?: string;
	telefone?: string;
	email?: string;
	enderecos_salvos?: ClienteEnderecoSalvo[];
	perfil_crm?: Partial<ClientePerfilCRM>;
}

/** Parâmetros para fn_rpc_upgrade_visitante_para_registrado */
export interface RpcUpgradeVisitanteParaRegistradoParams {
	p_cliente_id: string;
	p_email: string;
	p_senha_hash: string;
}

/** Parâmetros para fn_rpc_incrementar_contadores_compra */
export interface RpcIncrementarContadoresCompraParams {
	p_cliente_id: string;
	p_valor_pedido: number;
}

/** Parâmetros para fn_rpc_mesclar_visitante_em_auth */
export interface RpcMesclarVisitanteEmAuthParams {
	p_visitante_id: string;
	p_cliente_auth_id: string;
}

// =============================================
// RPCs de Pedido
// =============================================

/** Parâmetros para fn_rpc_criar_pedido */
export interface RpcCriarPedidoParams {
	loja_id: string;
	cliente_id: string;
	cupom_id?: string;
	cliente_nome: string;
	cliente_telefone?: string;
	carrinho: CarrinhoItem[];
	logistica: PedidoLogistica;
	subtotal: number;
	desconto: number;
	total: number;
	pagamento: PedidoPagamento;
}

/** Parâmetros para fn_rpc_atualizar_status_pedido */
export interface RpcAtualizarStatusPedidoParams {
	pedido_id: string;
	novo_status: string;
	motivo_cancelamento?: string;
	cancelado_por?: string; // 'loja', 'cliente', 'sistema'
	tempo_preparo_estimado_min?: number; // ao aceitar
}

/** Parâmetros para fn_rpc_efetuar_cancelamento */
export interface RpcEfetuarCancelamentoParams {
	p_pedido_id: string;
	p_motivo: string;
	p_cancelado_por?: string;
}

/** Parâmetros para fn_rpc_rastrear_pedido */
export interface RpcRastrearPedidoParams {
	p_codigo_rastreamento: string;
}

/** Retorno de fn_rpc_rastrear_pedido */
export interface RpcRastrearPedidoResult {
	id: string;
	numero_pedido: string;
	estado_atual: string;
	created_at: string;
	previsao_entrega: string | null;
	valor_total: number;
	itens: CarrinhoItem[];
	historico: Array<{
		status: string;
		created_at: string;
		observacao: string | null;
	}>;
}

/** Parâmetros para fn_rpc_atribuir_entregador */
export interface RpcAtribuirEntregadorParams {
	pedido_id: string;
	entregador_id: string;
}

// =============================================
// RPCs de Avaliação
// =============================================

/** Parâmetros para fn_rpc_criar_avaliacao */
export interface RpcCriarAvaliacaoParams {
	pedido_id: string;
	loja_id: string;
	cliente_id: string;
	nota: number; // 1 a 5
	comentarios_internos?: string;
	tags_problema?: TagProblema[];
}

/** Parâmetros para fn_rpc_avaliar_entrega_finalizada */
export interface RpcAvaliarEntregaFinalizadaParams {
	p_pedido_id: string;
	p_nota: number; // 1 a 5
	p_comentario?: string;
	p_token_avaliacao?: string;
}
