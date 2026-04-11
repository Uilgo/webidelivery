```typescript
/**
 * Row Types — Módulo Marketing
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * banners, cupons
 */

// =============================================
// TABELA: banners (carrossel do cardápio público)
// =============================================

export interface Banner {
	id: string;
	loja_id: string;
	titulo: string | null;
	imagem_url_light: string;
	imagem_url_dark: string | null;
	link_tipo: string | null; // 'produto', 'categoria', 'combo', 'link_externo', 'sem_link'
	link_id: string | null; // ID polimórfico da entidade destino
	link_url: string | null; // URL externa (se link_tipo = 'link_externo')
	ordem: number;
	inicio: string | null;
	fim: string | null;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: cupons (cupons de desconto por código)
// =============================================

export interface Cupom {
	id: string;
	loja_id: string;
	codigo: string; // normalizado para lowercase
	tipo: string; // 'percentual', 'valor_fixo', 'frete_gratis'
	valor: number | null; // null para frete_gratis
	valor_minimo: number | null; // valor mínimo do pedido
	limite_total: number | null; // usos totais (null = ilimitado)
	limite_por_cliente: number | null;
	usos: number; // contador atômico atual
	inicio: string | null;
	fim: string | null;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}
```
