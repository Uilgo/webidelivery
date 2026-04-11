-- Título: 02 - Assinaturas e Billing
-- Descrição: Estrutura financeira do SaaS: planos do sistema, assinaturas das empresas, faturas e controle de eventos de gateway (Stripe/Asaas).

-- ============================================================
-- Migration: 02_assinaturas.sql
-- Módulo: Assinaturas / Billing
-- Dependências: 01_core.sql (empresas)
-- Tabelas: planos, assinaturas, faturas, gateway_eventos
-- ============================================================

-- ===========================================
-- TABELA: planos
-- Catálogo de planos SaaS disponíveis.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.planos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  descricao   text,
  preco       jsonb NOT NULL DEFAULT '{}',    -- estrutura flexível de preços (mensal, anual, etc)
  limites     jsonb NOT NULL DEFAULT '{}',    -- limites do plano (lojas, produtos, pedidos/mês, etc)
  recursos    jsonb NOT NULL DEFAULT '[]',    -- features habilitadas (array de strings)
  destaque    boolean NOT NULL DEFAULT false, -- se aparece destacado na tela de planos
  status      text NOT NULL DEFAULT 'ativo',  -- ativo, inativo, descontinuado
  ordem       integer NOT NULL DEFAULT 0,     -- ordem de exibição
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.planos IS 'Catálogo de planos SaaS. Preços e limites em JSONB para máxima flexibilidade sem migrations.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_planos_status ON public.planos (status);
CREATE INDEX IF NOT EXISTS idx_planos_ordem ON public.planos (ordem) WHERE status = 'ativo';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_planos_modtime ON public.planos;
CREATE TRIGGER trg_planos_modtime
  BEFORE UPDATE ON public.planos
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Policy: Master vê todos os planos
DROP POLICY IF EXISTS "admin_master_pode_visualizar_planos" ON public.planos;
CREATE POLICY "admin_master_pode_visualizar_planos" ON public.planos
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

-- Policy: Público vê planos ativos (landing page / onboarding)
DROP POLICY IF EXISTS "publico_pode_visualizar_planos_ativos" ON public.planos;
CREATE POLICY "publico_pode_visualizar_planos_ativos" ON public.planos
  FOR SELECT
  USING (status = 'ativo');

-- ===========================================
-- TABELA: assinaturas
-- Relação 1:1 com empresas. Controla acesso.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.assinaturas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          uuid NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
  plano_id            uuid NOT NULL REFERENCES public.planos(id),
  status              text NOT NULL DEFAULT 'trial',              -- trial, ativa, atrasada, cancelada, suspensa
  ciclo               text NOT NULL DEFAULT 'mensal',             -- mensal, anual, etc
  valor_atual         numeric NOT NULL DEFAULT 0,                 -- valor cobrado no ciclo atual
  gateway_customer_id text,                                        -- ID do cliente no gateway
  gateway_subscription_id text,                                    -- ID da assinatura no gateway
  trial_fim_em        timestamptz,                                 -- quando o trial expira
  renova_em           timestamptz,                                 -- data de renovação — gatekeeper principal
  cancelada_em        timestamptz,                                 -- quando foi cancelada
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.assinaturas IS 'Assinatura 1:1 com empresa. renova_em é o gatekeeper principal de acesso ao sistema.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_assinaturas_empresa_id ON public.assinaturas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_plano_id ON public.assinaturas (plano_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON public.assinaturas (status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_renova_em ON public.assinaturas (renova_em);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_assinaturas_modtime ON public.assinaturas;
CREATE TRIGGER trg_assinaturas_modtime
  BEFORE UPDATE ON public.assinaturas
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Policy: Master vê todas as assinaturas
DROP POLICY IF EXISTS "admin_master_pode_visualizar_assinaturas" ON public.assinaturas;
CREATE POLICY "admin_master_pode_visualizar_assinaturas" ON public.assinaturas
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

-- Policy: Admin da empresa vê a própria assinatura
DROP POLICY IF EXISTS "empresa_pode_visualizar_propria_assinatura" ON public.assinaturas;
CREATE POLICY "empresa_pode_visualizar_propria_assinatura" ON public.assinaturas
  FOR SELECT
  USING (
    empresa_id = public.fn_get_perfil_empresa_id()
  );

-- ===========================================
-- TABELA: faturas
-- Histórico financeiro de cobranças.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.faturas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id       uuid NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
  empresa_id          uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  gateway_invoice_id  text UNIQUE,                                 -- idempotência — impede fatura duplicada
  valor               numeric NOT NULL,
  status              text NOT NULL DEFAULT 'pendente',            -- pendente, paga, cancelada, estornada
  metodo_pagamento    text,                                        -- pix, cartao, boleto, etc
  gateway_provider    text,                                        -- asaas, stripe, manual
  paga_em             timestamptz,                                 -- quando o pagamento foi confirmado
  vencimento_em       timestamptz,                                 -- data de vencimento
  dados_gateway       jsonb NOT NULL DEFAULT '{}',                 -- payload bruto do gateway
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Constraint: valor deve ser positivo
  CONSTRAINT check_faturas_valor CHECK (valor > 0)
);

COMMENT ON TABLE public.faturas IS 'Histórico de faturas/cobranças. gateway_invoice_id garante idempotência de webhooks.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_faturas_assinatura_id ON public.faturas (assinatura_id);
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_id ON public.faturas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON public.faturas (status);
CREATE INDEX IF NOT EXISTS idx_faturas_gateway_invoice_id ON public.faturas (gateway_invoice_id);
CREATE INDEX IF NOT EXISTS idx_faturas_vencimento ON public.faturas (vencimento_em) WHERE status = 'pendente';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_faturas_modtime ON public.faturas;
CREATE TRIGGER trg_faturas_modtime
  BEFORE UPDATE ON public.faturas
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Policy: Master vê todas as faturas
DROP POLICY IF EXISTS "admin_master_pode_visualizar_faturas" ON public.faturas;
CREATE POLICY "admin_master_pode_visualizar_faturas" ON public.faturas
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

-- Policy: Empresa vê as próprias faturas
DROP POLICY IF EXISTS "empresa_pode_visualizar_proprias_faturas" ON public.faturas;
CREATE POLICY "empresa_pode_visualizar_proprias_faturas" ON public.faturas
  FOR SELECT
  USING (
    empresa_id = public.fn_get_perfil_empresa_id()
  );

-- ===========================================
-- TABELA: gateway_eventos
-- Log append-only de webhooks recebidos.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.gateway_eventos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_provider  text NOT NULL,                                 -- asaas, stripe, etc (sem CHECK — flexível)
  event_id          text NOT NULL,                                 -- ID único do evento no gateway
  event_type        text NOT NULL,                                 -- tipo do evento (ex: PAYMENT_RECEIVED)
  payload           jsonb NOT NULL DEFAULT '{}',                   -- corpo bruto do webhook
  processado        boolean NOT NULL DEFAULT false,                -- se já foi processado pela aplicação
  processado_em     timestamptz,                                   -- quando foi processado
  erro              text,                                          -- mensagem de erro se falhou
  created_at        timestamptz NOT NULL DEFAULT now(),

  -- Idempotência: mesmo evento do mesmo gateway não é duplicado
  CONSTRAINT gateway_eventos_provider_event_unique UNIQUE (gateway_provider, event_id)
);

COMMENT ON TABLE public.gateway_eventos IS 'Log append-only de webhooks de gateways de pagamento. UNIQUE (provider, event_id) garante idempotência.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_gateway_eventos_processado ON public.gateway_eventos (processado) WHERE processado = false;
CREATE INDEX IF NOT EXISTS idx_gateway_eventos_provider ON public.gateway_eventos (gateway_provider);
CREATE INDEX IF NOT EXISTS idx_gateway_eventos_created_at ON public.gateway_eventos (created_at DESC);

-- RLS
ALTER TABLE public.gateway_eventos ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas Master vê eventos de gateway
DROP POLICY IF EXISTS "admin_master_pode_visualizar_gateway_eventos" ON public.gateway_eventos;
CREATE POLICY "admin_master_pode_visualizar_gateway_eventos" ON public.gateway_eventos
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );
