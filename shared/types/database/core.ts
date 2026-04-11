/**
 * Row Types — Módulo Core
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * roles, perfis, empresas, lojas
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
// TABELA: roles (catálogo fixo de cargos)
// =============================================

export interface Role {
	id: string;
	nome: string;
	descricao: string | null;
	painel: string; // 'master' | 'loja'
	nivel: number; // 1 = maior poder
	created_at: string;
}

// =============================================
// TABELA: perfis (espelho de auth.users)
// =============================================

export interface Perfil {
	id: string;
	empresa_id: string | null;
	loja_id: string | null;
	cargo: string; // admin_master, gerente_master, admin_loja, gerente_loja, staff_loja, entregador
	nome: string;
	sobrenome: string | null;
	email: string;
	whatsapp: string | null;
	avatar_url: string | null;
	status: string; // ativo, inativo, suspenso, bloqueado
	onboarding_status: string | null; // pendente, em_progresso, concluido (apenas admin_loja)
	config_ui: Record<string, unknown>; // preferências de UI do painel
	impersonation_ativo: boolean;
	impersonation_por: string | null;
	impersonation_cud_master_ativo: boolean;
	termos_aceitos_em: string | null;
	privacidade_aceita_em: string | null;
	ultimo_acesso_em: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: empresas (tenant principal)
// =============================================

export interface Empresa {
	id: string;
	nome_fantasia: string;
	razao_social: string | null;
	cnpj: string | null;
	slug: string;
	logo_url: string | null;
	status: string; // ativa, suspensa, cancelada
	config: Record<string, unknown>; // configurações gerais da empresa
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: lojas (unidade operacional)
// =============================================

export interface Loja {
	id: string;
	empresa_id: string;
	nome: string;
	slug: string;
	logo_url: string | null;
	telefone: string | null;
	whatsapp: string | null;
	email: string | null;
	endereco: LojaEndereco;
	horarios: LojaHorario[];
	config_operacao: LojaConfigOperacao;
	config_tema: LojaConfigTema;
	config_pagamentos: LojaConfigPagamentos;
	config_entrega: LojaConfigEntrega;
	status: string; // ativo, inativo, suspenso
	aberta_manualmente: boolean;
	created_at: string;
	updated_at: string;
}
