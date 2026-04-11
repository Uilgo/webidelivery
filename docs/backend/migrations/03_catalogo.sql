-- Título: 03 - Catálogo (Cardápio)
-- Descrição: Tabelas do cardápio das lojas: categorias, produtos, grupos de opções (adicionais) e opções de produtos.

-- ============================================================
-- Migration: 03_catalogo.sql
-- Módulo: Catálogo (Cardápio)
-- Dependências: 01_core.sql (lojas)
-- Tabelas: categorias, produtos, produto_variacoes,
--          grupos_adicionais, adicionais, produto_grupos_adicionais
-- ============================================================

-- ===========================================
-- TABELA: categorias
-- Agrupamento de produtos no cardápio.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.categorias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id     uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  descricao   text,
  grupo       text,                           -- agrupamento visual na UI (ex: 'Pizzas', 'Bebidas')
  imagem_url  text,
  ordem       integer NOT NULL DEFAULT 0,
  ativo       boolean NOT NULL DEFAULT true,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categorias IS 'Categorias do cardápio de uma loja. Suporta soft delete e reordenação.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_loja_id ON public.categorias (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categorias_ativas ON public.categorias (loja_id, ativo, ordem) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_categorias_modtime ON public.categorias;
CREATE TRIGGER trg_categorias_modtime
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_categorias" ON public.categorias;
CREATE POLICY "admin_master_pode_visualizar_categorias" ON public.categorias
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_categorias" ON public.categorias;
CREATE POLICY "equipe_loja_pode_visualizar_categorias" ON public.categorias
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_categorias_ativas" ON public.categorias;
CREATE POLICY "publico_pode_visualizar_categorias_ativas" ON public.categorias
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = categorias.loja_id AND lojas.status = 'ativo')
  );

-- ===========================================
-- TABELA: produtos
-- Itens do cardápio vinculados a uma categoria.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.produtos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id         uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  categoria_id    uuid NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  descricao       text,
  imagem_url_light text,
  imagem_url_dark  text,
  config          jsonb NOT NULL DEFAULT '{}',   -- tipo_produto, aceita_sabores, max_sabores, etc
  ordem           integer NOT NULL DEFAULT 0,
  ativo           boolean NOT NULL DEFAULT true,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.produtos IS 'Produtos do cardápio. Preço definido pelas variações. Config flexível via JSONB.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtos_loja_id ON public.produtos (loja_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON public.produtos (categoria_id, ordem) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_ativos ON public.produtos (loja_id, ativo) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_produtos_modtime ON public.produtos;
CREATE TRIGGER trg_produtos_modtime
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_produtos" ON public.produtos;
CREATE POLICY "admin_master_pode_visualizar_produtos" ON public.produtos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_produtos" ON public.produtos;
CREATE POLICY "equipe_loja_pode_visualizar_produtos" ON public.produtos
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_produtos_ativos" ON public.produtos;
CREATE POLICY "publico_pode_visualizar_produtos_ativos" ON public.produtos
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = produtos.loja_id AND lojas.status = 'ativo')
  );

-- ===========================================
-- TABELA: produto_variacoes
-- Variações de preço de um produto (ex: tamanhos).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.produto_variacoes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id  uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome        text NOT NULL,              -- ex: 'Pequena', 'Média', 'Grande'
  preco       numeric NOT NULL,
  preco_promocional numeric,              -- preço com desconto (null = sem promoção direta)
  ordem       integer NOT NULL DEFAULT 0,
  ativo       boolean NOT NULL DEFAULT true,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_produto_variacoes_preco CHECK (preco > 0),
  CONSTRAINT check_produto_variacoes_promo CHECK (preco_promocional IS NULL OR preco_promocional > 0)
);

COMMENT ON TABLE public.produto_variacoes IS 'Variações (tamanhos/sabores) que definem o preço real do produto. Mínimo obrigatório: 1 variação ativa.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_produto_variacoes_produto_id ON public.produto_variacoes (produto_id, ordem) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_produto_variacoes_modtime ON public.produto_variacoes;
CREATE TRIGGER trg_produto_variacoes_modtime
  BEFORE UPDATE ON public.produto_variacoes
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.produto_variacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_produto_variacoes" ON public.produto_variacoes;
CREATE POLICY "admin_master_pode_visualizar_produto_variacoes" ON public.produto_variacoes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_produto_variacoes" ON public.produto_variacoes;
CREATE POLICY "equipe_loja_pode_visualizar_produto_variacoes" ON public.produto_variacoes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (SELECT 1 FROM public.produtos WHERE produtos.id = produto_variacoes.produto_id AND produtos.loja_id = public.fn_get_perfil_loja_id())
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_produto_variacoes_ativas" ON public.produto_variacoes;
CREATE POLICY "publico_pode_visualizar_produto_variacoes_ativas" ON public.produto_variacoes
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.produtos p
      JOIN public.lojas l ON l.id = p.loja_id
      WHERE p.id = produto_variacoes.produto_id AND p.ativo = true AND p.deleted_at IS NULL AND l.status = 'ativo'
    )
  );

-- ===========================================
-- TABELA: grupos_adicionais
-- Grupos reutilizáveis de adicionais por loja.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.grupos_adicionais (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id         uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  descricao       text,
  obrigatorio     boolean NOT NULL DEFAULT false,
  min_selecao     integer NOT NULL DEFAULT 0,
  max_selecao     integer NOT NULL DEFAULT 1,
  ordem           integer NOT NULL DEFAULT 0,
  ativo           boolean NOT NULL DEFAULT true,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_grupos_adicionais_selecao CHECK (min_selecao >= 0 AND max_selecao >= min_selecao AND max_selecao >= 1)
);

COMMENT ON TABLE public.grupos_adicionais IS 'Grupos de adicionais reutilizáveis por loja. Vinculados a produtos via tabela de junção.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_grupos_adicionais_loja_id ON public.grupos_adicionais (loja_id) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_grupos_adicionais_modtime ON public.grupos_adicionais;
CREATE TRIGGER trg_grupos_adicionais_modtime
  BEFORE UPDATE ON public.grupos_adicionais
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.grupos_adicionais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_grupos_adicionais" ON public.grupos_adicionais;
CREATE POLICY "admin_master_pode_visualizar_grupos_adicionais" ON public.grupos_adicionais
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_grupos_adicionais" ON public.grupos_adicionais;
CREATE POLICY "equipe_loja_pode_visualizar_grupos_adicionais" ON public.grupos_adicionais
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_grupos_adicionais_ativos" ON public.grupos_adicionais;
CREATE POLICY "publico_pode_visualizar_grupos_adicionais_ativos" ON public.grupos_adicionais
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = grupos_adicionais.loja_id AND lojas.status = 'ativo')
  );

-- ===========================================
-- TABELA: adicionais
-- Itens individuais dentro de um grupo de adicionais.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.adicionais (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_adicional_id  uuid NOT NULL REFERENCES public.grupos_adicionais(id) ON DELETE CASCADE,
  nome                text NOT NULL,
  preco               numeric NOT NULL DEFAULT 0,
  max_unidades        integer NOT NULL DEFAULT 1,
  ordem               integer NOT NULL DEFAULT 0,
  ativo               boolean NOT NULL DEFAULT true,
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_adicionais_preco CHECK (preco >= 0),
  CONSTRAINT check_adicionais_max_unidades CHECK (max_unidades >= 1)
);

COMMENT ON TABLE public.adicionais IS 'Itens individuais de um grupo de adicionais. Preço pode ser zero (ex: molho grátis).';

-- Índices
CREATE INDEX IF NOT EXISTS idx_adicionais_grupo_id ON public.adicionais (grupo_adicional_id, ordem) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_adicionais_modtime ON public.adicionais;
CREATE TRIGGER trg_adicionais_modtime
  BEFORE UPDATE ON public.adicionais
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.adicionais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_adicionais" ON public.adicionais;
CREATE POLICY "admin_master_pode_visualizar_adicionais" ON public.adicionais
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_adicionais" ON public.adicionais;
CREATE POLICY "equipe_loja_pode_visualizar_adicionais" ON public.adicionais
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (
      SELECT 1 FROM public.grupos_adicionais ga
      WHERE ga.id = adicionais.grupo_adicional_id AND ga.loja_id = public.fn_get_perfil_loja_id()
    )
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_adicionais_ativos" ON public.adicionais;
CREATE POLICY "publico_pode_visualizar_adicionais_ativos" ON public.adicionais
  FOR SELECT USING (
    ativo = true AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.grupos_adicionais ga
      JOIN public.lojas l ON l.id = ga.loja_id
      WHERE ga.id = adicionais.grupo_adicional_id AND ga.ativo = true AND ga.deleted_at IS NULL AND l.status = 'ativo'
    )
  );

-- ===========================================
-- TABELA: produto_grupos_adicionais
-- Junção N:N entre produtos e grupos de adicionais.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.produto_grupos_adicionais (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id          uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  grupo_adicional_id  uuid NOT NULL REFERENCES public.grupos_adicionais(id) ON DELETE CASCADE,
  ordem               integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Um grupo só pode ser vinculado uma vez ao mesmo produto
  CONSTRAINT pga_produto_grupo_unique UNIQUE (produto_id, grupo_adicional_id)
);

COMMENT ON TABLE public.produto_grupos_adicionais IS 'Junção N:N entre produtos e grupos de adicionais. Ordem é por vínculo (por produto).';

-- Índices
CREATE INDEX IF NOT EXISTS idx_pga_produto_id ON public.produto_grupos_adicionais (produto_id, ordem);
CREATE INDEX IF NOT EXISTS idx_pga_grupo_adicional_id ON public.produto_grupos_adicionais (grupo_adicional_id);

-- RLS
ALTER TABLE public.produto_grupos_adicionais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_produto_grupos_adicionais" ON public.produto_grupos_adicionais;
CREATE POLICY "admin_master_pode_visualizar_produto_grupos_adicionais" ON public.produto_grupos_adicionais
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_produto_grupos_adicionais" ON public.produto_grupos_adicionais;
CREATE POLICY "equipe_loja_pode_visualizar_produto_grupos_adicionais" ON public.produto_grupos_adicionais
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (
      SELECT 1 FROM public.produtos p
      WHERE p.id = produto_grupos_adicionais.produto_id AND p.loja_id = public.fn_get_perfil_loja_id()
    )
  );

DROP POLICY IF EXISTS "publico_pode_visualizar_produto_grupos_adicionais_ativos" ON public.produto_grupos_adicionais;
CREATE POLICY "publico_pode_visualizar_produto_grupos_adicionais_ativos" ON public.produto_grupos_adicionais
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.produtos p
      JOIN public.lojas l ON l.id = p.loja_id
      WHERE p.id = produto_grupos_adicionais.produto_id AND p.ativo = true AND p.deleted_at IS NULL AND l.status = 'ativo'
    )
  );
