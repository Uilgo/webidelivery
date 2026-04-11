/**
 * Row Types — Módulo Assinaturas
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * planos, assinaturas, faturas, gateway_eventos
 */

import type { PlanoPreco, PlanoLimites, PlanoRecurso } from "../jsonb";

// =============================================
// TABELA: planos (catálogo SaaS)
// =============================================

export interface Plano {
	id: string;
	nome: string;
	descricao: string | null;
	preco: PlanoPreco;
	limites: PlanoLimites;
	recursos: PlanoRecurso[];
	destaque: boolean;
	status: string; // ativo, inativo, descontinuado
	ordem: number;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: assinaturas (1:1 com empresa)
// =============================================

export interface Assinatura {
	id: string;
	empresa_id: string;
	plano_id: string;
	status: string; // trial, ativa, atrasada, cancelada, suspensa
	ciclo: string; // mensal, anual, etc
	valor_atual: number;
	gateway_customer_id: string | null;
	gateway_subscription_id: string | null;
	trial_fim_em: string | null;
	renova_em: string | null; // gatekeeper principal de acesso
	cancelada_em: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: faturas (histórico de cobranças)
// =============================================

export interface Fatura {
	id: string;
	assinatura_id: string;
	empresa_id: string;
	gateway_invoice_id: string | null; // idempotência
	valor: number;
	status: string; // pendente, paga, cancelada, estornada
	metodo_pagamento: string | null;
	gateway_provider: string | null;
	paga_em: string | null;
	vencimento_em: string | null;
	dados_gateway: Record<string, unknown>; // payload bruto do gateway
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: gateway_eventos (log de webhooks)
// =============================================

export interface GatewayEvento {
	id: string;
	gateway_provider: string;
	event_id: string;
	event_type: string;
	payload: Record<string, unknown>; // corpo bruto do webhook
	processado: boolean;
	processado_em: string | null;
	erro: string | null;
	created_at: string;
}
