/**
 * Tipos JSONB — Payload de Notificação
 *
 * Shape para o campo JSONB `notificacoes.payload`.
 * Conteúdo dinâmico que alimenta o sino 🔔 do painel.
 */

// =============================================
// Payload da notificação (notificacoes.payload)
// =============================================

export interface NotificacaoPayload {
	titulo: string; // título exibido no card
	mensagem: string; // corpo da notificação
	link?: string; // rota interna para navegação (ex: '/pedidos/abc-123')
	icone?: string; // nome do ícone Lucide (ex: 'ShoppingBag')
	cor?: string; // cor do badge/ícone (hex)
	meta?: Record<string, unknown>; // dados extras para a lógica do frontend
}

// =============================================
// Anexo de mensagem de ticket (ticket_mensagens.anexos → array)
// =============================================

export interface TicketAnexo {
	nome: string; // nome do arquivo
	url: string; // URL no Supabase Storage
	tipo: string; // MIME type (ex: 'image/png', 'application/pdf')
	tamanho_bytes?: number;
}

// =============================================
// Metadata de ticket (tickets.metadata)
// Contexto técnico coletado automaticamente
// =============================================

export interface TicketMetadata {
	browser?: string; // ex: 'Chrome 120'
	os?: string; // ex: 'Windows 11'
	url_origem?: string; // URL de onde o ticket foi aberto
	resolucao_tela?: string; // ex: '1920x1080'
	versao_app?: string; // versão do painel (se disponível)
	dispositivo?: string; // 'desktop', 'mobile', 'tablet'
}
