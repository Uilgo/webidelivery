/**
 * Row Types — Módulo Auditoria e LGPD
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * audit_logs, logs_lojas, lgpd_consentimentos,
 * lgpd_solicitacoes_exclusao, impersonation_solicitacoes
 */

// =============================================
// TABELA: audit_logs (trilha de auditoria global)
// =============================================

export interface AuditLog {
	id: string;
	perfil_id: string | null; // null = ação do sistema
	acao: string; // ex: 'login', 'cancelar_assinatura'
	tabela: string | null;
	registro_id: string | null;
	dados_antes: Record<string, unknown> | null;
	dados_depois: Record<string, unknown> | null;
	ip: string | null;
	user_agent: string | null;
	origem: string; // 'usuario', 'sistema', 'webhook_gateway', 'impersonation'
	contexto: Record<string, unknown>;
	created_at: string;
}

// =============================================
// TABELA: logs_lojas (auditoria do painel da loja)
// =============================================

export interface LogLoja {
	id: string;
	loja_id: string;
	perfil_id: string | null;
	usuario_email: string | null; // snapshot
	usuario_nome: string | null; // snapshot
	usuario_cargo: string | null; // snapshot
	acao: string;
	tabela: string | null;
	registro_id: string | null;
	dados_antes: Record<string, unknown> | null;
	dados_depois: Record<string, unknown> | null;
	ip: string | null;
	user_agent: string | null;
	tipo_impersonation: string | null; // null = ação normal, 'master' = impersonation
	tinha_permissao_cud: boolean;
	contexto: Record<string, unknown>;
	created_at: string;
}

// =============================================
// TABELA: lgpd_consentimentos (registro LGPD)
// =============================================

export interface LGPDConsentimento {
	id: string;
	perfil_id: string;
	tipo: string; // 'termos_uso', 'politica_privacidade', 'marketing_email', etc
	versao: string; // versão do documento (ex: 'v1.0')
	aceito: boolean; // true = aceitou, false = revogou
	ip_address: string;
	user_agent: string;
	created_at: string;
}

// =============================================
// TABELA: lgpd_solicitacoes_exclusao (direito ao esquecimento)
// =============================================

export interface LGPDSolicitacaoExclusao {
	id: string;
	perfil_id: string | null;
	usuario_email: string; // snapshot
	usuario_nome: string; // snapshot
	status: string; // 'pendente', 'em_analise', 'concluida', 'cancelada'
	motivo: string | null;
	observacoes: string | null; // notas internas
	processada_por: string | null; // perfil_id
	processada_em: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: impersonation_solicitacoes
// =============================================

export interface ImpersonationSolicitacao {
	id: string;
	solicitante_id: string; // analista Master
	loja_id: string;
	motivo: string | null;
	status: string; // 'pendente', 'aprovada', 'recusada', 'expirada', 'revogada'
	respondido_por: string | null; // dono da loja
	respondido_em: string | null;
	expira_em: string; // deadline para aceitar
	acesso_expira_em: string | null; // prazo de segurança após aprovação
	created_at: string;
}
