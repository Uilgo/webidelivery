```typescript
/**
 * Row Types — Módulo Suporte
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * tickets, ticket_mensagens, ticket_notas
 */

import type { TicketMetadata, TicketAnexo } from "../jsonb";

// =============================================
// TABELA: tickets
// =============================================

export interface Ticket {
	id: string;
	loja_id: string;
	aberto_por: string; // perfil_id
	atribuido_a: string | null; // membro master responsável
	numero: number; // sequência global
	titulo: string;
	categoria: string | null;
	prioridade: string; // 'baixa', 'normal', 'alta', 'urgente'
	status: string; // 'aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado'
	resolvido_em: string | null;
	fechado_em: string | null;
	csat_nota: number | null; // 1 a 5
	csat_comentario: string | null;
	csat_respondido_em: string | null;
	canal: string; // 'chat', 'email', 'telefone'
	ultima_mensagem_em: string | null;
	nao_lidas_cliente: number;
	nao_lidas_suporte: number;
	metadata: TicketMetadata;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: ticket_mensagens (thread append-only)
// =============================================

export interface TicketMensagem {
	id: string;
	ticket_id: string;
	autor_id: string;
	lado: string; // 'cliente' | 'suporte'
	conteudo: string | null; // null aceito se tiver anexo
	anexos: TicketAnexo[];
	lida_em: string | null;
	created_at: string;
}

// =============================================
// TABELA: ticket_notas (notas internas — somente Master)
// =============================================

export interface TicketNota {
	id: string;
	ticket_id: string;
	autor_id: string;
	conteudo: string;
	created_at: string;
}
```
