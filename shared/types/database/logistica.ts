/**
 * Row Types — Módulo Logística
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * entregadores, entregador_acertos
 */

import type { PerfilLogistico, RegistroPagamentoAcerto } from "../jsonb";

// =============================================
// TABELA: entregadores
// =============================================

export interface Entregador {
	id: string;
	loja_id: string;
	auth_user_id: string | null; // vínculo com Supabase Auth (login PWA)
	email: string | null;
	telefone: string;
	cpf: string | null;
	nome_completo: string;
	perfil_logistico: PerfilLogistico;
	status_trabalho: string; // 'offline', 'disponivel', 'ocupado_em_corrida'
	ativo: boolean;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: entregador_acertos (livro-razão logístico)
// =============================================

export interface EntregadorAcerto {
	id: string;
	loja_id: string;
	entregador_id: string;
	fechado_por: string; // perfil_id do gerente
	total_corridas: number;
	valor_pago: number;
	registro_pagamento: RegistroPagamentoAcerto | null;
	criado_em: string;
}
