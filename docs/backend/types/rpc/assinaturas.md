```typescript
/**
 * RPC Types — Módulo Assinaturas
 *
 * Tipos de entrada para as funções RPC de CUD:
 * planos, assinaturas, faturas, gateway
 */

import type { PlanoPreco, PlanoLimites, PlanoRecurso } from "../jsonb";

// =============================================
// RPCs de Plano
// =============================================

/** Parâmetros para rpc_criar_plano */
export interface RpcCriarPlanoParams {
	nome: string;
	descricao?: string;
	preco: PlanoPreco;
	limites: PlanoLimites;
	recursos: PlanoRecurso[];
	destaque?: boolean;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_plano */
export interface RpcAtualizarPlanoParams {
	plano_id: string;
	nome?: string;
	descricao?: string;
	preco?: PlanoPreco;
	limites?: PlanoLimites;
	recursos?: PlanoRecurso[];
	destaque?: boolean;
	ordem?: number;
	status?: string;
}

// =============================================
// RPCs de Assinatura
// =============================================

/** Parâmetros para rpc_criar_assinatura */
export interface RpcCriarAssinaturaParams {
	empresa_id: string;
	plano_id: string;
	ciclo: string; // 'mensal', 'anual', etc
	valor_atual: number;
	trial_fim_em?: string; // ISO 8601
}

/** Parâmetros para rpc_atualizar_assinatura */
export interface RpcAtualizarAssinaturaParams {
	assinatura_id: string;
	plano_id?: string;
	status?: string;
	ciclo?: string;
	valor_atual?: number;
	gateway_customer_id?: string;
	gateway_subscription_id?: string;
	renova_em?: string;
}

// =============================================
// RPCs de Fatura
// =============================================

/** Parâmetros para rpc_registrar_fatura */
export interface RpcRegistrarFaturaParams {
	assinatura_id: string;
	empresa_id: string;
	valor: number;
	gateway_invoice_id?: string;
	gateway_provider?: string;
	vencimento_em?: string;
}

/** Parâmetros para rpc_confirmar_pagamento_fatura */
export interface RpcConfirmarPagamentoFaturaParams {
	fatura_id: string;
	metodo_pagamento: string;
	dados_gateway?: Record<string, unknown>;
}

// =============================================
// RPCs de Gateway (Webhook)
// =============================================

/** Parâmetros para rpc_processar_webhook_gateway */
export interface RpcProcessarWebhookGatewayParams {
	gateway_provider: string;
	event_id: string;
	event_type: string;
	payload: Record<string, unknown>;
}
```
