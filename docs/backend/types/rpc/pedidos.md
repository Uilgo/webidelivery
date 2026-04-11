```typescript
/**
 * RPC Types — Módulo Pedidos
 *
 * Tipos de entrada para as funções RPC de CUD:
 * clientes, pedidos, histórico, avaliações
 */

import type {
	CarrinhoItem,
	PedidoLogistica,
	PedidoPagamento,
	PedidoEstadoAtual,
	ClienteEnderecoSalvo,
	ClientePerfilCRM,
	TagProblema,
} from "../jsonb";

// =============================================
// RPCs de Cliente
// =============================================

/** Parâmetros para rpc_criar_cliente */
export interface RpcCriarClienteParams {
	loja_id: string;
	nome: string;
	telefone: string;
	tipo_cadastro?: string; // 'visitante' | 'registrado' (default: 'visitante')
	email?: string;
	device_token?: string;
	enderecos_salvos?: ClienteEnderecoSalvo[];
}

/** Parâmetros para rpc_atualizar_cliente */
export interface RpcAtualizarClienteParams {
	cliente_id: string;
	nome?: string;
	telefone?: string;
	email?: string;
	enderecos_salvos?: ClienteEnderecoSalvo[];
	perfil_crm?: Partial<ClientePerfilCRM>;
}

// =============================================
// RPCs de Pedido
// =============================================

/** Parâmetros para rpc_criar_pedido */
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

/** Parâmetros para rpc_atualizar_status_pedido */
export interface RpcAtualizarStatusPedidoParams {
	pedido_id: string;
	novo_status: string;
	motivo_cancelamento?: string;
	cancelado_por?: string; // 'loja', 'cliente', 'sistema'
	tempo_preparo_estimado_min?: number; // ao aceitar
}

/** Parâmetros para rpc_atribuir_entregador */
export interface RpcAtribuirEntregadorParams {
	pedido_id: string;
	entregador_id: string;
}

// =============================================
// RPCs de Avaliação
// =============================================

/** Parâmetros para rpc_criar_avaliacao */
export interface RpcCriarAvaliacaoParams {
	pedido_id: string;
	loja_id: string;
	cliente_id: string;
	nota: number; // 1 a 5
	comentarios_internos?: string;
	tags_problema?: TagProblema[];
}
```
