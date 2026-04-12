/**
 * Row Types — Módulo Core
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * roles, perfis, empresas, lojas
 *
 * Sincronizado com o banco real via MCP Supabase.
 */

// =============================================
// TABELA: roles (catálogo fixo de 6 cargos)
// =============================================

export interface Role {
	id: string;
	slug: string; // 'admin_master', 'gerente_master', etc.
	nome: string;
	descricao: string | null;
	permissoes: string[]; // jsonb — array de slugs de permissão
	painel: "master" | "loja";
	nivel: number; // 1 = maior poder
	acesso_total: boolean;
	ativo: boolean;
	created_at: string;
	updated_at: string;
}

// =============================================
// JSONB: preferencias (campo de perfis)
// =============================================

/** Tipagem do JSONB `preferencias` da tabela `perfis` */
export interface PreferenciasUsuario {
	/** Timezone IANA (ex: "America/Sao_Paulo") */
	timezone?: string;
	/** Locale BCP 47 (ex: "pt-BR") */
	locale?: string;
	/** Moeda preferida (ex: "BRL") */
	currency?: string;
	/** Tema da interface */
	theme?: "light" | "dark" | "system";
	/** Sidebar colapsada */
	sidebar_collapsed?: boolean;
	/** Notificações habilitadas */
	notifications_enabled?: boolean;
	/** Som de notificações habilitado */
	sound_enabled?: boolean;
	/** Layout do dashboard */
	dashboard_layout?: "grid" | "list";
	/** Itens por página em tabelas */
	items_per_page?: number;
	/** Outras preferências customizadas */
	[key: string]: unknown;
}

// =============================================
// TABELA: perfis (espelho de auth.users)
// =============================================

export interface Perfil {
	id: string;
	role_id: string; // FK → roles.id
	permissoes_customizadas: Record<string, unknown> | null; // jsonb
	empresa_id: string | null;
	loja_id: string | null;
	nome: string;
	sobrenome: string;
	email: string;
	avatar_url: string | null;
	telefone: string | null;
	whatsapp: string | null;
	is_demo: boolean;
	status: string; // 'ativo', 'inativo', 'suspenso', 'bloqueado'
	onboarding_status: string | null; // 'pendente', 'em_progresso', 'concluido'
	senha_temporaria: boolean;
	ultimo_acesso_em: string | null;
	termos_aceitos_em: string | null;
	privacidade_aceita_em: string | null;
	preferencias: PreferenciasUsuario; // jsonb
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: empresas (tenant principal)
// =============================================

export interface Empresa {
	id: string;
	plano_id: string | null;
	nome: string;
	slug: string;
	status: string; // 'ativa', 'suspensa', 'cancelada'
	dominio_personalizado: string | null;
	dominio_ssl_ativo: boolean;
	dominio_ssl_expira_em: string | null;
	dominio_verificado_em: string | null;
	configuracoes: Record<string, unknown>; // jsonb
	impersonation_cud_master: boolean;
	impersonation_cud_master_concedido_em: string | null;
	impersonation_cud_master_concedido_por: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: lojas (unidade operacional)
// =============================================

export interface Loja {
	id: string;
	empresa_id: string;
	is_matriz: boolean;
	nome_estabelecimento: string;
	slug: string;
	status: string; // 'rascunho', 'ativo', 'inativo', 'suspenso'
	categoria: string | null;
	descricao: string | null;
	logo_light_url: string | null;
	logo_dark_url: string | null;
	banner_light_url: string | null;
	banner_dark_url: string | null;
	cpf: string | null;
	cnpj: string | null;
	telefone: string | null;
	whatsapp: string | null;
	email: string | null;
	redes_sociais: Record<string, unknown>; // jsonb
	endereco_rua: string | null;
	endereco_numero: string | null;
	endereco_complemento: string | null;
	endereco_bairro: string | null;
	endereco_cidade: string | null;
	endereco_estado: string | null;
	endereco_cep: string | null;
	endereco_referencia: string | null;
	aberto: boolean;
	forcar_fechado: boolean;
	horario_funcionamento: Record<string, unknown>; // jsonb
	config_geral: Record<string, unknown>; // jsonb
	config_tema: Record<string, unknown>; // jsonb
	setup_status: Record<string, unknown>; // jsonb
	created_at: string;
	updated_at: string;
}
