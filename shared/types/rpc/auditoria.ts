/**
 * RPC Types — Módulo Auditoria e LGPD
 *
 * Tipos de entrada para as funções RPC de CUD:
 * audit logs, logs lojas, LGPD, impersonation
 */

// =============================================
// RPCs de Audit Log (nível plataforma)
// =============================================

/** Parâmetros para rpc_registrar_audit_log */
export interface RpcRegistrarAuditLogParams {
	acao: string;
	origem: string; // 'usuario', 'sistema', 'webhook_gateway', 'impersonation'
	perfil_id?: string; // null = ação do sistema
	tabela?: string;
	registro_id?: string;
	dados_antes?: Record<string, unknown>;
	dados_depois?: Record<string, unknown>;
	ip?: string;
	user_agent?: string;
	contexto?: Record<string, unknown>;
}

// =============================================
// RPCs de Log Loja (nível loja)
// =============================================

/** Parâmetros para rpc_registrar_log_loja */
export interface RpcRegistrarLogLojaParams {
	loja_id: string;
	perfil_id?: string;
	usuario_email?: string;
	usuario_nome?: string;
	usuario_cargo?: string;
	acao: string;
	tabela?: string;
	registro_id?: string;
	dados_antes?: Record<string, unknown>;
	dados_depois?: Record<string, unknown>;
	ip?: string;
	user_agent?: string;
	tipo_impersonation?: string; // null | 'master'
	tinha_permissao_cud?: boolean;
	contexto?: Record<string, unknown>;
}

// =============================================
// RPCs de LGPD
// =============================================

/** Parâmetros para rpc_registrar_consentimento */
export interface RpcRegistrarConsentimentoParams {
	perfil_id: string;
	tipo: string; // 'termos_uso', 'politica_privacidade', etc
	versao: string; // versão do documento
	aceito: boolean;
	ip_address: string;
	user_agent: string;
}

/** Parâmetros para rpc_solicitar_exclusao_dados */
export interface RpcSolicitarExclusaoDadosParams {
	perfil_id: string;
	usuario_email: string;
	usuario_nome: string;
	motivo?: string;
}

/** Parâmetros para rpc_processar_exclusao */
export interface RpcProcessarExclusaoParams {
	solicitacao_id: string;
	processada_por: string;
	status: string; // 'em_analise', 'concluida', 'cancelada'
	observacoes?: string;
}

// =============================================
// RPCs de Impersonation
// =============================================

/** Parâmetros para rpc_solicitar_impersonation */
export interface RpcSolicitarImpersonationParams {
	loja_id: string;
	motivo?: string;
}

/** Parâmetros para rpc_responder_impersonation */
export interface RpcResponderImpersonationParams {
	solicitacao_id: string;
	respondido_por: string;
	aprovar: boolean; // true = aprovada, false = recusada
	prazo_horas?: number; // ex: 8 (duração do acesso CUD)
}
