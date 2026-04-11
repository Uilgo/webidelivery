-- Título: 14 - RPC: Catálogo
-- Descrição: Funções PL/pgSQL (RPCs) para controle transacional do cardápio: Categorias, Produtos e Variações/Opções.

/**
 * ==============================================================================
 * 14_RPC_CATALOGO
 * Funções CUD para controle de cardápios (Categorias, Produtos, Variacoes, Adicionais)
 * ==============================================================================
 */

-- [ CATEGORIAS ] ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_categoria(
  p_loja_id uuid,
  p_nome text,
  p_descricao text DEFAULT NULL,
  p_grupo text DEFAULT NULL,
  p_imagem_url text DEFAULT NULL,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.categorias (loja_id, nome, descricao, grupo, imagem_url, ordem, ativo)
  VALUES (p_loja_id, p_nome, p_descricao, p_grupo, p_imagem_url, p_ordem, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_categoria(
  p_categoria_id uuid,
  p_nome text DEFAULT NULL,
  p_descricao text DEFAULT NULL,
  p_grupo text DEFAULT NULL,
  p_imagem_url text DEFAULT NULL,
  p_ativo boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.categorias
  SET
    nome = COALESCE(p_nome, nome),
    descricao = COALESCE(p_descricao, descricao),
    grupo = COALESCE(p_grupo, grupo),
    imagem_url = COALESCE(p_imagem_url, imagem_url),
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_categoria_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_categoria(p_categoria_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.categorias SET deleted_at = now() WHERE id = p_categoria_id;
  -- Opcional: cascade soft delete para os produtos (geralmente gerido pelo frontend)
END;
$$;

-- [ PRODUTOS ] -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_produto(
  p_loja_id uuid,
  p_categoria_id uuid,
  p_nome text,
  p_descricao text DEFAULT NULL,
  p_imagem_url_light text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_config jsonb DEFAULT '{}'::jsonb,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.produtos (
    loja_id, categoria_id, nome, descricao, imagem_url_light, imagem_url_dark, config, ordem, ativo
  )
  VALUES (
    p_loja_id, p_categoria_id, p_nome, p_descricao, p_imagem_url_light, p_imagem_url_dark, p_config, p_ordem, true
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_produto(
  p_produto_id uuid,
  p_categoria_id uuid DEFAULT NULL,
  p_nome text DEFAULT NULL,
  p_descricao text DEFAULT NULL,
  p_imagem_url_light text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_config jsonb DEFAULT NULL,
  p_ativo boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.produtos
  SET
    categoria_id = COALESCE(p_categoria_id, categoria_id),
    nome = COALESCE(p_nome, nome),
    descricao = COALESCE(p_descricao, descricao),
    imagem_url_light = COALESCE(p_imagem_url_light, imagem_url_light),
    imagem_url_dark = COALESCE(p_imagem_url_dark, imagem_url_dark),
    config = CASE WHEN p_config IS NOT NULL THEN config || p_config ELSE config END,
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_produto_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_produto(p_produto_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.produtos SET deleted_at = now() WHERE id = p_produto_id;
END;
$$;

-- [ VARIACOES E ADICIONAIS ] ---------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_variacao(
  p_produto_id uuid,
  p_nome text,
  p_preco numeric,
  p_preco_promocional numeric DEFAULT NULL,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.produto_variacoes (produto_id, nome, preco, preco_promocional, ordem, ativo)
  VALUES (p_produto_id, p_nome, p_preco, p_preco_promocional, p_ordem, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_criar_grupo_adicional(
  p_loja_id uuid,
  p_nome text,
  p_descricao text DEFAULT NULL,
  p_obrigatorio boolean DEFAULT false,
  p_min_selecao integer DEFAULT 0,
  p_max_selecao integer DEFAULT 1,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.grupos_adicionais (loja_id, nome, descricao, obrigatorio, min_selecao, max_selecao, ordem, ativo)
  VALUES (p_loja_id, p_nome, p_descricao, p_obrigatorio, p_min_selecao, p_max_selecao, p_ordem, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_criar_adicional(
  p_grupo_adicional_id uuid,
  p_nome text,
  p_preco numeric,
  p_max_unidades integer DEFAULT 1,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.adicionais (grupo_adicional_id, nome, preco, max_unidades, ordem, ativo)
  VALUES (p_grupo_adicional_id, p_nome, p_preco, p_max_unidades, p_ordem, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_vincular_grupo_produto(
  p_produto_id uuid,
  p_grupo_adicional_id uuid,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.produto_grupos_adicionais (produto_id, grupo_adicional_id, ordem)
  VALUES (p_produto_id, p_grupo_adicional_id, p_ordem)
  ON CONFLICT (produto_id, grupo_adicional_id) DO UPDATE SET ordem = EXCLUDED.ordem
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_desvincular_grupo_produto(
  p_produto_id uuid,
  p_grupo_adicional_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.produto_grupos_adicionais
  WHERE produto_id = p_produto_id AND grupo_adicional_id = p_grupo_adicional_id;
END;
$$;
