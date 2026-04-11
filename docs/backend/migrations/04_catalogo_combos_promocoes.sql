-- Título: 04 - Catálogo (Combos e Promoções)
-- Descrição: Tabelas auxiliares do catálogo: combos de produtos, regras de grupos de combos e promoções ativas.

-- ============================================================
-- Migration: 04_catalogo_combos_promocoes.sql
-- Módulo: Catálogo Extras (Combos + Promoções)
-- Dependências: 03_catalogo.sql (produtos, produto_variacoes)
-- Tabelas: combos, combo_grupos, combo_grupo_opcoes, promocoes
-- ============================================================

-- ===========================================
-- TABELA: combos
-- Combos com preço fixo definido pelo admin.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.combos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id         uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  descricao       text,
  imagem_url_light text,
  imagem_url_dark  text,
  preco           numeric NOT NULL,
  inicio          timestamptz,                  -- null = sem restrição de início
  fim             timestamptz,                  -- null = combo permanente
  ativo           boolean NOT NULL DEFAULT true,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_combos_preco CHECK (preco > 0),
  CONSTRAINT check_combos_periodo CHECK (inicio IS NULL OR fim IS NULL OR fim > inicio)
);

COMMENT ON TABLE public.combos IS 'Combos com preço fixo. Preço original calculado via RPC (não armazenado). Suporta período de vigência.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_combos_loja_id ON public.combos (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_combos_ativos ON public.combos (loja_id, ativo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_combos_periodo ON public.combos (loja_id, inicio, fim);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_combos_modtime ON public.combos;
CREATE TRIGGER trg_combos_modtime
  BEFORE UPDATE ON public.combos
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_combos" ON public.combos;
CREATE POLICY "admin_master_pode_visualizar_combos" ON public.combos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_combos" ON public.combos;
CREATE POLICY "equipe_loja_pode_visualizar_combos" ON public.combos
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_combos_ativos" ON public.combos;
CREATE POLICY "publico_pode_visualizar_combos_ativos" ON public.combos
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = combos.loja_id AND lojas.status = 'ativo')
  );

-- ===========================================
-- TABELA: combo_grupos
-- Grupos de escolha dentro de um combo.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.combo_grupos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id      uuid NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  nome          text NOT NULL,              -- ex: 'Escolha sua bebida'
  descricao     text,
  obrigatorio   boolean NOT NULL DEFAULT true,
  min_selecao   integer NOT NULL DEFAULT 1,
  max_selecao   integer NOT NULL DEFAULT 1,
  ordem         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_combo_grupos_selecao CHECK (min_selecao >= 0 AND max_selecao >= min_selecao AND max_selecao >= 1)
);

COMMENT ON TABLE public.combo_grupos IS 'Grupos de escolha dentro de um combo. Sem updated_at/deleted_at — gerenciado via RPC do combo pai.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_combo_grupos_combo_id ON public.combo_grupos (combo_id, ordem);

-- RLS
ALTER TABLE public.combo_grupos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_combo_grupos" ON public.combo_grupos;
CREATE POLICY "admin_master_pode_visualizar_combo_grupos" ON public.combo_grupos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_combo_grupos" ON public.combo_grupos;
CREATE POLICY "equipe_loja_pode_visualizar_combo_grupos" ON public.combo_grupos
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (
      SELECT 1 FROM public.combos c
      WHERE c.id = combo_grupos.combo_id AND c.loja_id = public.fn_get_perfil_loja_id()
    )
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_combo_grupos_ativos" ON public.combo_grupos;
CREATE POLICY "publico_pode_visualizar_combo_grupos_ativos" ON public.combo_grupos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.combos c
      JOIN public.lojas l ON l.id = c.loja_id
      WHERE c.id = combo_grupos.combo_id AND c.ativo = true AND c.deleted_at IS NULL AND l.status = 'ativo'
    )
  );

-- ===========================================
-- TABELA: combo_grupo_opcoes
-- Produtos disponíveis em cada grupo de combo.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.combo_grupo_opcoes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id      uuid NOT NULL REFERENCES public.combo_grupos(id) ON DELETE CASCADE,
  produto_id    uuid NOT NULL REFERENCES public.produtos(id),
  variacao_id   uuid REFERENCES public.produto_variacoes(id),   -- null = cliente escolhe a variação
  preco_extra   numeric NOT NULL DEFAULT 0,                     -- acréscimo para opções premium
  ordem         integer NOT NULL DEFAULT 0,
  ativo         boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Mesma opção (produto+variação) não pode ser duplicada no grupo
  CONSTRAINT cgo_grupo_produto_unique UNIQUE (grupo_id, produto_id, variacao_id),
  CONSTRAINT check_cgo_preco_extra CHECK (preco_extra >= 0)
);

COMMENT ON TABLE public.combo_grupo_opcoes IS 'Opções de produtos dentro de um grupo de combo. preco_extra para opções premium.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_cgo_grupo_id ON public.combo_grupo_opcoes (grupo_id, ordem);
CREATE INDEX IF NOT EXISTS idx_cgo_produto_id ON public.combo_grupo_opcoes (produto_id);

-- RLS
ALTER TABLE public.combo_grupo_opcoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_combo_grupo_opcoes" ON public.combo_grupo_opcoes;
CREATE POLICY "admin_master_pode_visualizar_combo_grupo_opcoes" ON public.combo_grupo_opcoes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_combo_grupo_opcoes" ON public.combo_grupo_opcoes;
CREATE POLICY "equipe_loja_pode_visualizar_combo_grupo_opcoes" ON public.combo_grupo_opcoes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (
      SELECT 1 FROM public.combo_grupos cg
      JOIN public.combos c ON c.id = cg.combo_id
      WHERE cg.id = combo_grupo_opcoes.grupo_id AND c.loja_id = public.fn_get_perfil_loja_id()
    )
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_combo_grupo_opcoes_ativas" ON public.combo_grupo_opcoes;
CREATE POLICY "publico_pode_visualizar_combo_grupo_opcoes_ativas" ON public.combo_grupo_opcoes
  FOR SELECT USING (
    ativo = true
    AND EXISTS (
      SELECT 1 FROM public.combo_grupos cg
      JOIN public.combos c ON c.id = cg.combo_id
      JOIN public.lojas l ON l.id = c.loja_id
      WHERE cg.id = combo_grupo_opcoes.grupo_id AND c.ativo = true AND c.deleted_at IS NULL AND l.status = 'ativo'
    )
  );

-- ===========================================
-- TABELA: promocoes
-- Promoções automáticas em produtos ou categorias.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.promocoes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id         uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  entidade_tipo   text NOT NULL,                -- 'produto' ou 'categoria' (polimórfico)
  entidade_id     uuid NOT NULL,                -- ID da entidade alvo (sem FK — polimórfico)
  tipo            text NOT NULL,                -- 'percentual' ou 'valor_fixo'
  valor           numeric NOT NULL,
  inicio          timestamptz,
  fim             timestamptz,
  ativo           boolean NOT NULL DEFAULT true,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Validações financeiras blindadas no banco
  CONSTRAINT check_promocoes_percentual CHECK (tipo != 'percentual' OR (valor > 0 AND valor <= 100)),
  CONSTRAINT check_promocoes_valor_fixo CHECK (tipo != 'valor_fixo' OR valor > 0),
  CONSTRAINT check_promocoes_periodo CHECK (inicio IS NULL OR fim IS NULL OR fim > inicio)
);

COMMENT ON TABLE public.promocoes IS 'Promoções automáticas em produtos ou categorias. Combos NÃO recebem promoção. loja_id desnormalizado para RLS direto.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_promocoes_loja_id ON public.promocoes (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promocoes_entidade ON public.promocoes (entidade_tipo, entidade_id) WHERE deleted_at IS NULL AND ativo = true;
CREATE INDEX IF NOT EXISTS idx_promocoes_ativas ON public.promocoes (loja_id, ativo, inicio, fim);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_promocoes_modtime ON public.promocoes;
CREATE TRIGGER trg_promocoes_modtime
  BEFORE UPDATE ON public.promocoes
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_promocoes" ON public.promocoes;
CREATE POLICY "admin_master_pode_visualizar_promocoes" ON public.promocoes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_promocoes" ON public.promocoes;
CREATE POLICY "equipe_loja_pode_visualizar_promocoes" ON public.promocoes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_promocoes_ativas" ON public.promocoes;
CREATE POLICY "publico_pode_visualizar_promocoes_ativas" ON public.promocoes
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = promocoes.loja_id AND lojas.status = 'ativo')
  );
