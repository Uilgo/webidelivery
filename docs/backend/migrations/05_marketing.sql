-- Título: 05 - Marketing
-- Descrição: Recursos de marketing e atração para as lojas: banners em destaque e gerenciamento de cupons de desconto.

-- ============================================================
-- Migration: 05_marketing.sql
-- Módulo: Marketing
-- Dependências: 01_core.sql (lojas)
-- Tabelas: banners, cupons
-- ============================================================

-- ===========================================
-- TABELA: banners
-- Carrossel promocional do cardápio público.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.banners (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id         uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  titulo          text,
  imagem_url_light text NOT NULL,               -- imagem para temas claros
  imagem_url_dark  text,                        -- imagem para temas escuros (opcional)
  link_tipo       text,                         -- produto, categoria, combo, link_externo, sem_link
  link_id         uuid,                         -- ID da entidade destino (polimórfico, sem FK)
  link_url        text,                         -- URL externa (apenas para link_externo)
  ordem           integer NOT NULL DEFAULT 0,
  inicio          timestamptz,                  -- null = exibe imediatamente
  fim             timestamptz,                  -- null = sem expiração
  ativo           boolean NOT NULL DEFAULT true,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Se for link_externo, link_url é obrigatório
  CONSTRAINT check_banners_link_url CHECK (link_tipo != 'link_externo' OR link_url IS NOT NULL),
  CONSTRAINT check_banners_periodo CHECK (inicio IS NULL OR fim IS NULL OR fim > inicio)
);

COMMENT ON TABLE public.banners IS 'Banners do carrossel do cardápio público. Suporta links polimórficos e período de vigência.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_banners_loja_id ON public.banners (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_banners_ativos ON public.banners (loja_id, ativo, ordem) WHERE deleted_at IS NULL AND ativo = true;
CREATE INDEX IF NOT EXISTS idx_banners_periodo ON public.banners (loja_id, inicio, fim);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_banners_modtime ON public.banners;
CREATE TRIGGER trg_banners_modtime
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_banners" ON public.banners;
CREATE POLICY "admin_master_pode_visualizar_banners" ON public.banners
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_banners" ON public.banners;
CREATE POLICY "equipe_loja_pode_visualizar_banners" ON public.banners
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_banners_ativos" ON public.banners;
CREATE POLICY "publico_pode_visualizar_banners_ativos" ON public.banners
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = banners.loja_id AND lojas.status = 'ativo')
  );

-- ===========================================
-- TABELA: cupons
-- Cupons de desconto por código.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.cupons (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id             uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  codigo              text NOT NULL,              -- normalizado para lowercase
  tipo                text NOT NULL,              -- percentual, valor_fixo, frete_gratis
  valor               numeric,                    -- null para frete_gratis
  valor_minimo        numeric,                    -- valor mínimo do pedido (null = sem mínimo)
  limite_total        integer,                    -- máximo usos totais (null = ilimitado)
  limite_por_cliente  integer DEFAULT 1,          -- máximo por cliente (null = ilimitado)
  usos                integer NOT NULL DEFAULT 0, -- contador atômico
  inicio              timestamptz,
  fim                 timestamptz,
  ativo               boolean NOT NULL DEFAULT true,
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Validações financeiras
  CONSTRAINT check_cupons_valor CHECK (tipo = 'frete_gratis' OR valor > 0),
  CONSTRAINT check_cupons_percentual CHECK (tipo != 'percentual' OR (valor > 0 AND valor <= 100)),
  CONSTRAINT check_cupons_periodo CHECK (inicio IS NULL OR fim IS NULL OR fim > inicio),
  CONSTRAINT check_cupons_usos CHECK (usos >= 0)
);

COMMENT ON TABLE public.cupons IS 'Cupons de desconto por código. Diferente de promoções (automáticas). Suporta frete grátis.';

-- Unique: código único por loja (case-insensitive), excluindo deletados
CREATE UNIQUE INDEX IF NOT EXISTS cupons_codigo_loja_unique
  ON public.cupons (loja_id, lower(codigo))
  WHERE deleted_at IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_cupons_loja_id ON public.cupons (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cupons_codigo_loja ON public.cupons (loja_id, lower(codigo)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cupons_ativos ON public.cupons (loja_id, ativo, fim);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_cupons_modtime ON public.cupons;
CREATE TRIGGER trg_cupons_modtime
  BEFORE UPDATE ON public.cupons
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_cupons" ON public.cupons;
CREATE POLICY "admin_master_pode_visualizar_cupons" ON public.cupons
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_cupons" ON public.cupons;
CREATE POLICY "equipe_loja_pode_visualizar_cupons" ON public.cupons
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

-- Público NÃO tem SELECT direto — validação via RPC exclusivamente
