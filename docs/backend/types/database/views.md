```typescript
/**
 * Row Types — Views
 *
 * Tipos de leitura (SELECT) para as 5 views.
 * Todas usam security_invoker — RLS herdado.
 */

// =============================================
// VIEW: vw_master_empresas
// Painel Master — gestão consolidada de empresas
// =============================================

export interface VwMasterEmpresas {
	empresa_id: string;
	nome_fantasia: string;
	cnpj: string | null;
	empresa_status: string;
	dono_id: string | null;
	dono_nome: string | null;
	dono_email: string | null;
	dono_whatsapp: string | null;
	lojas_qtd: number;
	plano_nome: string | null;
	assinatura_status: string | null;
	renova_em: string | null;
}

// =============================================
// VIEW: vw_loja_dashboard_kpis
// KPIs transacionais diários por loja
// =============================================

export interface VwLojaDashboardKpis {
	loja_id: string;
	data_referencia: string; // formato date (YYYY-MM-DD)
	total_pedidos_concluidos: number;
	total_pedidos_cancelados: number;
	faturamento_bruto: number;
	taxas_entrega_somadas: number;
	ticket_medio: number;
}

// =============================================
// VIEW: vw_extracao_produtos_vendidos
// Expansão do carrinho JSONB para ranking
// =============================================

export interface VwExtracaoProdutosVendidos {
	id_pedido: string;
	loja_id: string;
	produto_original_id: string | null;
	nome_produto: string;
	quantidade_comprada: number;
	valor_total_item: number;
}

// =============================================
// VIEW: vw_fechamento_caixa_motoboys
// Fechamento diário de caixa por entregador
// =============================================

export interface VwFechamentoCaixaMotoboys {
	data_fechamento: string; // formato date (YYYY-MM-DD)
	loja_id: string;
	entregador_id: string;
	nome_entregador: string;
	total_corridas: number;
	valor_liquido_taxas: number;
	valor_retido_dinheiro: number;
	saldo_do_dia: number; // positivo = loja deve ao motoboy
}

// =============================================
// VIEW: vw_master_kpi_assinaturas
// KPIs globais de billing SaaS — Master only
// =============================================

export interface VwMasterKpiAssinaturas {
	mrr_estimado: number;
	total_planos_ativos: number;
	total_empresas_inadimplentes: number;
	volume_faturado_neste_mes: number;
	plano_mais_vendido: string | null;
}
```
