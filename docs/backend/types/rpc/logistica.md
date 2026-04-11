```typescript
/**
 * RPC Types — Módulo Logística
 *
 * Tipos de entrada para as funções RPC de CUD:
 * entregadores, acertos financeiros
 */

import type { PerfilLogistico, RegistroPagamentoAcerto } from "../jsonb";

// =============================================
// RPCs de Entregador
// =============================================

/** Parâmetros para rpc_criar_entregador */
export interface RpcCriarEntregadorParams {
	loja_id: string;
	nome_completo: string;
	telefone: string;
	email?: string;
	cpf?: string;
	perfil_logistico: PerfilLogistico;
}

/** Parâmetros para rpc_atualizar_entregador */
export interface RpcAtualizarEntregadorParams {
	entregador_id: string;
	nome_completo?: string;
	telefone?: string;
	email?: string;
	cpf?: string;
	perfil_logistico?: Partial<PerfilLogistico>;
	ativo?: boolean;
}

/** Parâmetros para rpc_atualizar_status_entregador */
export interface RpcAtualizarStatusEntregadorParams {
	entregador_id: string;
	status_trabalho: string; // 'offline', 'disponivel', 'ocupado_em_corrida'
}

// =============================================
// RPCs de Acerto Financeiro
// =============================================

/** Parâmetros para rpc_registrar_acerto */
export interface RpcRegistrarAcertoParams {
	loja_id: string;
	entregador_id: string;
	total_corridas: number;
	valor_pago: number;
	registro_pagamento?: RegistroPagamentoAcerto;
}
```
