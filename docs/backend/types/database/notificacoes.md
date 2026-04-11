```typescript
/**
 * Row Types — Módulo Notificações
 *
 * Tipos de leitura (SELECT) para a tabela: notificacoes
 */

import type { NotificacaoPayload } from "../jsonb";

// =============================================
// TABELA: notificacoes (sino 🔔 in-app)
// =============================================

export interface Notificacao {
	id: string;
	perfil_id: string;
	loja_id: string | null; // null = notificação de sistema
	tipo: string; // 'pedido_novo', 'sistema_aviso', 'ticket_respondido', etc
	payload: NotificacaoPayload;
	lida: boolean;
	lida_em: string | null;
	deleted_at: string | null;
	created_at: string;
}
```
