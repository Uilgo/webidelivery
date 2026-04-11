```typescript
/**
 * Row Types — Módulo Pedidos
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * clientes, pedidos, pedido_historico, pedido_avaliacoes
 */

import type {
	ClienteEnderecoSalvo,
	ClientePerfilCRM,
	CarrinhoItem,
	PedidoLogistica,
	PedidoPagamento,
	PedidoEstadoAtual,
	TagProblema,
} from "../jsonb";

// =============================================
// TABELA: clientes (híbrido visitante/registrado)
// =============================================

export interface Cliente {
	id: string;
	loja_id: string;
	tipo_cadastro: string; // 'visitante' | 'registrado'
	device_token: string | null; // cookie silencioso do visitante
	email: string | null;
	senha_hash: string | null; // nunca expor no frontend!
	nome: string;
	telefone: string;
	enderecos_salvos: ClienteEnderecoSalvo[];
	perfil_crm: ClientePerfilCRM;
	total_pedidos: number;
	total_gasto: number; // LTV
	ultimo_pedido_em: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

/**
 * Versão segura do Cliente — sem campos sensíveis.
 * Usar esta interface nas respostas de API para o frontend.
 */
export type ClienteSeguro = Omit<Cliente, "senha_hash" | "device_token">;

// =============================================
// TABELA: pedidos (coração da operação)
// =============================================

export interface Pedido {
	id: string;
	loja_id: string;
	cliente_id: string;
	cupom_id: string | null;
	entregador_id: string | null;
	numero: number; // sequencial por loja
	codigo_rastreamento: string; // ex: 'WBD-4F9Q'
	cliente_nome: string; // snapshot
	cliente_telefone: string | null; // snapshot
	carrinho: CarrinhoItem[]; // snapshot imutável
	logistica: PedidoLogistica;
	subtotal: number;
	desconto: number;
	total: number;
	pagamento: PedidoPagamento;
	estado_atual: PedidoEstadoAtual;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: pedido_historico (timeline append-only)
// =============================================

export interface PedidoHistorico {
	id: string;
	pedido_id: string;
	status_novo: string;
	perfil_id: string | null; // null = ação do sistema
	criado_em: string;
}

// =============================================
// TABELA: pedido_avaliacoes (CSAT 1:1 com pedido)
// =============================================

export interface PedidoAvaliacao {
	pedido_id: string; // PK = pedido_id (relação 1:1)
	loja_id: string;
	cliente_id: string;
	nota: number; // 1 a 5
	comentarios_internos: string | null;
	tags_problema: TagProblema[] | null;
	criado_em: string;
}
```
