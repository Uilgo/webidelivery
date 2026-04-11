```typescript
/**
 * Tipos JSONB — Configurações de Plano
 *
 * Shapes para os campos JSONB da tabela `planos`.
 * Estrutura flexível para precificação e limites.
 */

// =============================================
// Precificação flexível (planos.preco)
// Suporta múltiplos ciclos sem migration DDL
// =============================================

export interface PlanoPrecoCiclo {
	valor: number; // ex: 99.90
	desconto_percentual?: number; // ex: 20 (20% off no anual)
	promocional?: number; // preço promocional temporário
}

export interface PlanoPreco {
	mensal: PlanoPrecoCiclo;
	trimestral?: PlanoPrecoCiclo;
	semestral?: PlanoPrecoCiclo;
	anual?: PlanoPrecoCiclo;
}

// =============================================
// Limites do plano (planos.limites)
// Define o teto de recursos por plano
// =============================================

export interface PlanoLimites {
	max_lojas: number; // número máximo de lojas
	max_produtos: number; // produtos por loja
	max_categorias: number; // categorias por loja
	max_usuarios: number; // usuários admin/staff por loja
	max_pedidos_mes: number; // pedidos mensais (-1 = ilimitado)
	max_entregadores: number; // entregadores por loja
	max_combos: number; // combos por loja
	max_cupons: number; // cupons ativos por loja
	max_banners: number; // banners por loja
	storage_mb: number; // armazenamento de imagens em MB
}

// =============================================
// Recursos/features do plano (planos.recursos)
// Array de feature flags habilitadas
// =============================================

export type PlanoRecurso =
	| "cardapio_digital"
	| "pedidos_delivery"
	| "pedidos_retirada"
	| "pedidos_mesa"
	| "painel_admin"
	| "relatorios_basicos"
	| "relatorios_avancados"
	| "cupons_desconto"
	| "combos"
	| "promocoes_automaticas"
	| "banners_carrossel"
	| "gestao_entregadores"
	| "fechamento_caixa"
	| "suporte_chat"
	| "suporte_prioritario"
	| "notificacoes_push"
	| "integracao_gateway"
	| "tema_personalizado"
	| "dominio_personalizado"
	| "api_webhooks"
	| "multi_lojas"
	| "importacao_cardapio";
```
