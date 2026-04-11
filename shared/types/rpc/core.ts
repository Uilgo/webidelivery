/**
 * RPC Types — Módulo Core
 *
 * Tipos de entrada (params) para as funções RPC de CUD:
 * perfis, empresas, lojas
 */

import type {
	LojaConfigEntrega,
	LojaConfigOperacao,
	LojaConfigPagamentos,
	LojaConfigTema,
	LojaEndereco,
	LojaHorario,
} from "../jsonb";

// =============================================
// RPCs de Perfil
// =============================================

/** Parâmetros para fn_rpc_criar_perfil */
export interface RpcCriarPerfilParams {
	nome: string;
	sobrenome?: string;
	email: string;
	whatsapp?: string;
	cargo: string;
	empresa_id?: string;
	loja_id?: string;
}

/** Parâmetros para fn_rpc_atualizar_perfil */
export interface RpcAtualizarPerfilParams {
	perfil_id: string;
	nome?: string;
	sobrenome?: string;
	whatsapp?: string;
	avatar_url?: string;
	config_ui?: Record<string, unknown>;
}

/** Parâmetros para fn_rpc_desativar_perfil */
export interface RpcDesativarPerfilParams {
	perfil_id: string;
	motivo?: string;
}

/** Parâmetros para fn_rpc_verificar_email_disponivel */
export interface RpcVerificarEmailDisponivelParams {
	p_email: string;
}

/** Retorno de fn_rpc_verificar_email_disponivel */
export type RpcVerificarEmailDisponivelResult = boolean;

/** Parâmetros para fn_rpc_registrar_ultimo_acesso */
export interface RpcRegistrarUltimoAcessoParams {
	p_perfil_id?: string;
}

/** Parâmetros para fn_rpc_atualizar_onboarding_status */
export interface RpcAtualizarOnboardingStatusParams {
	p_perfil_id: string;
	p_novo_status: "pendente" | "em_progresso" | "concluido";
}

/** Parâmetros para fn_rpc_atualizar_preferencias */
export interface RpcAtualizarPreferenciasParams {
	p_perfil_id: string;
	p_preferencias: Record<string, unknown>;
}

/** Parâmetros para fn_rpc_aceitar_termos */
export interface RpcAceitarTermosParams {
	p_perfil_id: string;
	p_tipo: "termos" | "privacidade" | "ambos";
}

/** Parâmetros para fn_rpc_listar_preview_delecao */
export interface RpcListarPreviewDelecaoParams {
	p_perfil_id: string;
}

/** Retorno de fn_rpc_listar_preview_delecao */
export interface RpcListarPreviewDelecaoResult {
	empresa_id: string;
	lojas: number;
	funcionarios: number;
	pedidos: number;
	clientes: number;
	produtos: number;
}

/** Parâmetros para fn_rpc_listar_membros_equipe */
export interface RpcListarMembrosEquipeParams {
	p_empresa_id?: string;
	p_loja_id?: string;
	p_limite?: number;
	p_offset?: number;
}

/** Retorno de fn_rpc_listar_membros_equipe */
export interface RpcListarMembrosEquipeResult {
	id: string;
	nome: string;
	sobrenome: string;
	email: string;
	avatar_url: string | null;
	telefone: string | null;
	whatsapp: string | null;
	cargo: string;
	status: string;
	ultimo_acesso_em: string | null;
	created_at: string;
}

// =============================================
// RPCs de Empresa
// =============================================

/** Parâmetros para fn_rpc_criar_empresa */
export interface RpcCriarEmpresaParams {
	nome_fantasia: string;
	razao_social?: string;
	cnpj?: string;
	slug: string;
	logo_url?: string;
}

/** Parâmetros para fn_rpc_atualizar_empresa */
export interface RpcAtualizarEmpresaParams {
	empresa_id: string;
	nome_fantasia?: string;
	razao_social?: string;
	cnpj?: string;
	logo_url?: string;
	config?: Record<string, unknown>;
}

/** Parâmetros para fn_rpc_suspender_empresa */
export interface RpcSuspenderEmpresaParams {
	empresa_id: string;
	motivo?: string;
}

// =============================================
// RPCs de Loja
// =============================================

/** Parâmetros para fn_rpc_criar_loja */
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

/** Parâmetros para fn_rpc_atualizar_loja */
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

/** Parâmetros para fn_rpc_atualizar_config_operacao_loja */
export interface RpcAtualizarConfigOperacaoLojaParams {
	loja_id: string;
	config_operacao: Partial<LojaConfigOperacao>;
}

/** Parâmetros para fn_rpc_atualizar_config_tema_loja */
export interface RpcAtualizarConfigTemaLojaParams {
	loja_id: string;
	config_tema: Partial<LojaConfigTema>;
}

/** Parâmetros para fn_rpc_atualizar_config_pagamentos_loja */
export interface RpcAtualizarConfigPagamentosLojaParams {
	loja_id: string;
	config_pagamentos: Partial<LojaConfigPagamentos>;
}

/** Parâmetros para fn_rpc_atualizar_config_entrega_loja */
export interface RpcAtualizarConfigEntregaLojaParams {
	loja_id: string;
	config_entrega: Partial<LojaConfigEntrega>;
}
