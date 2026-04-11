-- Título: 19 - RPC: Catálogo (Combos/Promo)
-- Descrição: Funções PL/pgSQL (RPCs) adicionais para lidar com combinações complexas de cardápio (Combos e Promoções).

/**
 * ==============================================================================
 * 19_RPC_CATALOGO_COMBOS
 * Funções CUD (Create, Update, Delete) complementares do Catálogo:
 * Combos, Grupos de Combos e Promoções
 * ==============================================================================
 */

-- [ COMBOS ] -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_combo(
  p_loja_id uuid,
  p_nome text,
  p_preco numeric,
  p_descricao text DEFAULT NULL,
  p_imagem_url_light text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.combos (loja_id, nome, preco, descricao, imagem_url_light, imagem_url_dark, inicio, fim, ativo)
  VALUES (p_loja_id, p_nome, p_preco, p_descricao, p_imagem_url_light, p_imagem_url_dark, p_inicio, p_fim, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_combo(
  p_combo_id uuid,
  p_nome text DEFAULT NULL,
  p_preco numeric DEFAULT NULL,
  p_descricao text DEFAULT NULL,
  p_imagem_url_light text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL,
  p_ativo boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.combos
  SET
    nome = COALESCE(p_nome, nome),
    preco = COALESCE(p_preco, preco),
    descricao = COALESCE(p_descricao, descricao),
    imagem_url_light = COALESCE(p_imagem_url_light, imagem_url_light),
    imagem_url_dark = COALESCE(p_imagem_url_dark, imagem_url_dark),
    inicio = COALESCE(p_inicio, inicio),
    fim = COALESCE(p_fim, fim),
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_combo_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_combo(p_combo_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.combos SET deleted_at = now() WHERE id = p_combo_id;
END;
$$;

-- [ GRUPOS DE COMBO ] ----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_combo_grupo(
  p_combo_id uuid,
  p_nome text,
  p_descricao text DEFAULT NULL,
  p_obrigatorio boolean DEFAULT true,
  p_min_selecao integer DEFAULT 1,
  p_max_selecao integer DEFAULT 1,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.combo_grupos (combo_id, nome, descricao, obrigatorio, min_selecao, max_selecao, ordem)
  VALUES (p_combo_id, p_nome, p_descricao, p_obrigatorio, p_min_selecao, p_max_selecao, p_ordem)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_criar_combo_grupo_opcao(
  p_grupo_id uuid,
  p_produto_id uuid,
  p_variacao_id uuid DEFAULT NULL,
  p_preco_extra numeric DEFAULT 0,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.combo_grupo_opcoes (grupo_id, produto_id, variacao_id, preco_extra, ordem, ativo)
  VALUES (p_grupo_id, p_produto_id, p_variacao_id, p_preco_extra, p_ordem, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- [ PROMOCOES AUTOMATICAS ] ----------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_promocao(
  p_loja_id uuid,
  p_entidade_tipo text,
  p_entidade_id uuid,
  p_tipo text,
  p_valor numeric,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.promocoes (loja_id, entidade_tipo, entidade_id, tipo, valor, inicio, fim, ativo)
  VALUES (p_loja_id, p_entidade_tipo, p_entidade_id, p_tipo, p_valor, p_inicio, p_fim, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_promocao(p_promocao_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.promocoes SET deleted_at = now() WHERE id = p_promocao_id;
END;
$$;
