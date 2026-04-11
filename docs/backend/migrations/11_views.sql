-- Título: 11 - Views e Consolidadores
-- Descrição: Visualizações do BD: consolidação de métricas (KPIs), listagens de desempenho de vendas e acessos master.

-- ============================================================
-- Migration: 11_views.sql
-- Módulo: Views (consultas consolidadas)
-- Dependências: TODOS os arquivos anteriores (00-10)
-- Views: vw_master_empresas, vw_loja_dashboard_kpis,
--        vw_extracao_produtos_vendidos,
--        vw_fechamento_caixa_motoboys,
--        vw_master_kpi_assinaturas
-- ============================================================

-- ===========================================
-- VIEW 1: vw_master_empresas
-- Visão consolidada das empresas para o painel Master.
-- Cruza Core + Billing + Perfis para montar o "card de gestão".
-- ===========================================

CREATE OR REPLACE VIEW public.vw_master_empresas
WITH (security_invoker = true)
AS
SELECT
  e.id                    AS empresa_id,
  e.nome                  AS nome_fantasia,
  NULL                    AS cnpj,
  e.status                AS empresa_status,

  -- Dono da conta: primeiro admin_loja vinculado à empresa
  dono.id                 AS dono_id,
  dono.nome || COALESCE(' ' || dono.sobrenome, '') AS dono_nome,
  dono.email              AS dono_email,
  dono.whatsapp           AS dono_whatsapp,

  -- Contagem de lojas
  COALESCE(loja_count.qtd, 0) AS lojas_qtd,

  -- Dados da assinatura
  pl.nome                 AS plano_nome,
  a.status                AS assinatura_status,
  a.renova_em

FROM public.empresas e

-- Subquery LATERAL para achar o "dono" (primeiro admin_loja da empresa)
LEFT JOIN LATERAL (
  SELECT p.id, p.nome, p.sobrenome, p.email, p.whatsapp
    FROM public.perfis p
    JOIN public.roles r ON p.role_id = r.id
   WHERE p.empresa_id = e.id AND r.slug = 'admin_loja'
   ORDER BY p.created_at
   LIMIT 1
) dono ON true

-- Contagem de lojas da empresa
LEFT JOIN LATERAL (
  SELECT COUNT(*)::integer AS qtd
    FROM public.lojas l
   WHERE l.empresa_id = e.id
) loja_count ON true

-- Assinatura (1:1)
LEFT JOIN public.assinaturas a ON a.empresa_id = e.id

-- Plano vinculado à assinatura
LEFT JOIN public.planos pl ON pl.id = a.plano_id;

COMMENT ON VIEW public.vw_master_empresas IS 'Visão consolidada para o painel Master: empresa + dono + lojas + billing. security_invoker herda RLS.';


-- ===========================================
-- VIEW 2: vw_loja_dashboard_kpis
-- KPIs transacionais diários de cada loja.
-- ===========================================

CREATE OR REPLACE VIEW public.vw_loja_dashboard_kpis
WITH (security_invoker = true)
AS
SELECT
  p.loja_id,
  (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS data_referencia,

  -- Contagens
  COUNT(*) FILTER (WHERE (p.estado_atual->>'status') = 'concluido')  AS total_pedidos_concluidos,
  COUNT(*) FILTER (WHERE (p.estado_atual->>'status') = 'cancelado')  AS total_pedidos_cancelados,

  -- Financeiro (apenas concluídos)
  COALESCE(SUM(p.total) FILTER (WHERE (p.estado_atual->>'status') = 'concluido'), 0) AS faturamento_bruto,

  -- Taxas de entrega somadas (dos concluídos)
  COALESCE(
    SUM((p.logistica->>'taxa')::numeric) FILTER (WHERE (p.estado_atual->>'status') = 'concluido'),
    0
  ) AS taxas_entrega_somadas,

  -- Ticket médio
  CASE
    WHEN COUNT(*) FILTER (WHERE (p.estado_atual->>'status') = 'concluido') > 0
    THEN ROUND(
      SUM(p.total) FILTER (WHERE (p.estado_atual->>'status') = 'concluido')
      / COUNT(*) FILTER (WHERE (p.estado_atual->>'status') = 'concluido'),
      2
    )
    ELSE 0
  END AS ticket_medio

FROM public.pedidos p
GROUP BY p.loja_id, data_referencia;

COMMENT ON VIEW public.vw_loja_dashboard_kpis IS 'KPIs diários de pedidos por loja. security_invoker herda RLS de pedidos — loja vê apenas os seus.';


-- ===========================================
-- VIEW 3: vw_extracao_produtos_vendidos
-- Expande o JSONB do carrinho imutável para tabulação.
-- ===========================================

CREATE OR REPLACE VIEW public.vw_extracao_produtos_vendidos
WITH (security_invoker = true)
AS
SELECT
  p.id                            AS id_pedido,
  p.loja_id,
  (item->>'produto_id')::uuid     AS produto_original_id,
  item->>'nome'                   AS nome_produto,
  (item->>'quantidade')::numeric  AS quantidade_comprada,
  (item->>'subtotal')::numeric    AS valor_total_item

FROM public.pedidos p,
     jsonb_array_elements(p.carrinho) AS item

-- Apenas pedidos concluídos para ranking relevante
WHERE (p.estado_atual->>'status') = 'concluido';

COMMENT ON VIEW public.vw_extracao_produtos_vendidos IS 'Expansão do carrinho JSONB para ranking de produtos mais vendidos. Filtra apenas concluídos.';


-- ===========================================
-- VIEW 4: vw_fechamento_caixa_motoboys
-- Compilação diária da produtividade logística.
-- ===========================================

CREATE OR REPLACE VIEW public.vw_fechamento_caixa_motoboys
WITH (security_invoker = true)
AS
SELECT
  (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS data_fechamento,
  p.loja_id,
  p.entregador_id,
  e.nome_completo                  AS nome_entregador,

  -- Total de corridas concluídas do dia
  COUNT(*)::integer                AS total_corridas,

  -- Valor que o motoboy ganha (soma das taxas de entrega)
  COALESCE(SUM((p.logistica->>'taxa')::numeric), 0) AS valor_liquido_taxas,

  -- Valor que o motoboy coletou em dinheiro (precisa devolver ao lojista)
  COALESCE(
    SUM(p.total) FILTER (WHERE (p.pagamento->>'metodo') = 'dinheiro'),
    0
  ) AS valor_retido_dinheiro,

  -- Saldo do dia: quanto a loja deve ao motoboy (negativo = motoboy deve)
  COALESCE(SUM((p.logistica->>'taxa')::numeric), 0)
  - COALESCE(
      SUM(p.total) FILTER (WHERE (p.pagamento->>'metodo') = 'dinheiro'),
      0
    ) AS saldo_do_dia

FROM public.pedidos p
JOIN public.entregadores e ON e.id = p.entregador_id

-- Apenas entregas concluídas
WHERE (p.estado_atual->>'status') = 'concluido'
  AND p.entregador_id IS NOT NULL
  AND (p.logistica->>'tipo_entrega') = 'delivery'

GROUP BY data_fechamento, p.loja_id, p.entregador_id, e.nome_completo;

COMMENT ON VIEW public.vw_fechamento_caixa_motoboys IS 'Fechamento diário de caixa de motoboys. Cruza pedidos + entregadores para acerto financeiro.';


-- ===========================================
-- VIEW 5: vw_master_kpi_assinaturas
-- Métricas de billing SaaS para o painel Master.
-- ===========================================

CREATE OR REPLACE VIEW public.vw_master_kpi_assinaturas
WITH (security_invoker = true)
AS
SELECT
  -- MRR estimado (soma do valor_atual das assinaturas ativas)
  COALESCE(SUM(a.valor_atual) FILTER (WHERE a.status = 'ativa'), 0) AS mrr_estimado,

  -- Total de assinaturas ativas
  COUNT(*) FILTER (WHERE a.status = 'ativa')          AS total_planos_ativos,

  -- Total de empresas inadimplentes
  COUNT(*) FILTER (WHERE a.status = 'atrasada')       AS total_empresas_inadimplentes,

  -- Volume faturado neste mês (faturas pagas)
  COALESCE(
    (SELECT SUM(f.valor)
       FROM public.faturas f
      WHERE f.status = 'paga'
        AND DATE_TRUNC('month', f.paga_em) = DATE_TRUNC('month', now())),
    0
  ) AS volume_faturado_neste_mes,

  -- Plano mais vendido (nome do plano com mais assinaturas ativas)
  (SELECT pl.nome
     FROM public.assinaturas a2
     JOIN public.planos pl ON pl.id = a2.plano_id
    WHERE a2.status = 'ativa'
    GROUP BY pl.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) AS plano_mais_vendido

FROM public.assinaturas a;

COMMENT ON VIEW public.vw_master_kpi_assinaturas IS 'KPIs globais de billing SaaS. Exclusivo para admin_master. security_invoker herda RLS das tabelas base.';
