```typescript
/**
 * RPC Types — Módulo Core
 *
 * Tipos de entrada (params) para as funções RPC de CUD:
 * perfis, empresas, lojas
 */

// =============================================
// RPCs de Perfil
// =============================================

/** Parâmetros para rpc_criar_perfil */
export interface RpcCriarPerfilParams {
	nome: string;
	sobrenome?: string;
	email: string;
	whatsapp?: string;
	cargo: string;
	empresa_id?: string;
	loja_id?: string;
}

/** Parâmetros para rpc_atualizar_perfil */
export interface RpcAtualizarPerfilParams {
	perfil_id: string;
	nome?: string;
	sobrenome?: string;
	whatsapp?: string;
	avatar_url?: string;
	config_ui?: Record<string, unknown>;
}

/** Parâmetros para rpc_desativar_perfil */
export interface RpcDesativarPerfilParams {
	perfil_id: string;
	motivo?: string;
}

// =============================================
// RPCs de Empresa
// =============================================

/** Parâmetros para rpc_criar_empresa */
export interface RpcCriarEmpresaParams {
	nome_fantasia: string;
	razao_social?: string;
	cnpj?: string;
	slug: string;
	logo_url?: string;
}

/** Parâmetros para rpc_atualizar_empresa */
export interface RpcAtualizarEmpresaParams {
	empresa_id: string;
	nome_fantasia?: string;
	razao_social?: string;
	cnpj?: string;
	logo_url?: string;
	config?: Record<string, unknown>;
}

/** Parâmetros para rpc_suspender_empresa */
export interface RpcSuspenderEmpresaParams {
	empresa_id: string;
	motivo?: string;
}

// =============================================
// RPCs de Loja
// =============================================

import type {
	LojaEndereco,
	LojaHorario,
	LojaConfigOperacao,
	LojaConfigTema,
	LojaConfigPagamentos,
	LojaConfigEntrega,
} from "../jsonb";

/** Parâmetros para rpc_criar_loja */
export interface RpcCriarLojaParams {
	empresa_id: string;
	nome: string;
	slug: string;
	telefone?: string;
	whatsapp?: string;
	email?: string;
	endereco: LojaEndereco;
	horarios?: LojaHorario[];
}

/** Parâmetros para rpc_atualizar_loja */
export interface RpcAtualizarLojaParams {
	loja_id: string;
	nome?: string;
	telefone?: string;
	whatsapp?: string;
	email?: string;
	logo_url?: string;
	endereco?: LojaEndereco;
	horarios?: LojaHorario[];
	aberta_manualmente?: boolean;
}

/** Parâmetros para rpc_atualizar_config_operacao_loja */
export interface RpcAtualizarConfigOperacaoLojaParams {
	loja_id: string;
	config_operacao: Partial<LojaConfigOperacao>;
}

/** Parâmetros para rpc_atualizar_config_tema_loja */
export interface RpcAtualizarConfigTemaLojaParams {
	loja_id: string;
	config_tema: Partial<LojaConfigTema>;
}

/** Parâmetros para rpc_atualizar_config_pagamentos_loja */
export interface RpcAtualizarConfigPagamentosLojaParams {
	loja_id: string;
	config_pagamentos: Partial<LojaConfigPagamentos>;
}

/** Parâmetros para rpc_atualizar_config_entrega_loja */
export interface RpcAtualizarConfigEntregaLojaParams {
	loja_id: string;
	config_entrega: Partial<LojaConfigEntrega>;
}
```
