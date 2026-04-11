```typescript
/**
 * Tipos JSONB — Snapshots do Pedido
 *
 * Shapes para os campos JSONB imutáveis das tabelas
 * `pedidos` (carrinho, logistica, pagamento, estado_atual).
 * Esses dados são congelados no momento da criação do pedido.
 */

// =============================================
// Item do carrinho (pedidos.carrinho → array)
// Snapshot imutável — nunca atualizado
// =============================================

export interface CarrinhoAdicionalItem {
	adicional_id: string;
	nome: string;
	preco: number;
	quantidade: number;
}

export interface CarrinhoGrupoAdicional {
	grupo_id: string;
	nome: string;
	itens: CarrinhoAdicionalItem[];
}

export interface CarrinhoItem {
	produto_id: string;
	nome: string;
	variacao_id: string;
	variacao_nome: string;
	preco_unitario: number;
	quantidade: number;
	subtotal: number;
	imagem_url?: string;
	grupos_adicionais?: CarrinhoGrupoAdicional[]; // adicionais selecionados
	observacao?: string; // ex: 'sem cebola'
}

// =============================================
// Logística do pedido (pedidos.logistica)
// =============================================

export interface PedidoEnderecoEntrega {
	rua: string;
	numero: string;
	complemento?: string;
	bairro: string;
	referencia?: string;
	latitude?: number;
	longitude?: number;
}

export interface PedidoLogistica {
	tipo_entrega: string; // 'delivery', 'retirada', 'mesa'
	taxa: number; // taxa de entrega cobrada (0 para retirada)
	endereco_entrega?: PedidoEnderecoEntrega; // null se retirada/mesa
	numero_mesa?: number; // se tipo = 'mesa'
	entregador_id?: string; // atribuído depois
	entregador_nome?: string; // snapshot do nome
	tempo_estimado_min?: number;
	distancia_km?: number;
	saiu_para_entrega_em?: string; // ISO 8601
	entregue_em?: string; // ISO 8601
}

// =============================================
// Pagamento do pedido (pedidos.pagamento)
// =============================================

export interface PedidoPagamento {
	metodo: string; // 'pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'vale_refeicao'
	status: string; // 'pendente', 'confirmado', 'recusado'
	troco_para?: number; // se dinheiro: valor que o cliente vai pagar (ex: 50.00)
	bandeira?: string; // visa, mastercard, etc
	comprovante_url?: string; // URL do comprovante PIX/cartão
	confirmado_em?: string; // ISO 8601
}

// =============================================
// Estado atual do pedido (pedidos.estado_atual)
// =============================================

export interface PedidoEstadoAtual {
	status: string; // 'pendente', 'aceito', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue', 'concluido', 'cancelado'
	motivo_cancelamento?: string; // se cancelado
	cancelado_por?: string; // 'loja', 'cliente', 'sistema'
	tempo_preparo_estimado_min?: number; // estimativa ao aceitar
	aceito_em?: string; // ISO 8601
	pronto_em?: string; // ISO 8601
}

// =============================================
// Tags de problema na avaliação (pedido_avaliacoes.tags_problema)
// =============================================

export type TagProblema =
	| "demora"
	| "embalagem_vazada"
	| "item_errado"
	| "item_faltando"
	| "frio"
	| "atendimento"
	| "entrega"
	| "outro";
```
