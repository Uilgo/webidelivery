-- Título: 15 - RPC: Marketing
-- Descrição: Funções PL/pgSQL (RPCs) de criação, edição e remoção para Banners e Cupons de desconto.

/**
 * ==============================================================================
 * 15_RPC_MARKETING
 * Funções CUD (Create, Update, Delete) do Módulo de Ferramentas de Crescimento
 * ==============================================================================
 */

-- [ BANNERS ] ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_banner(
  p_loja_id uuid,
  p_imagem_url_light text,
  p_titulo text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_link_tipo text DEFAULT 'sem_link',
  p_link_id uuid DEFAULT NULL,
  p_link_url text DEFAULT NULL,
  p_ordem integer DEFAULT 0,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.banners (
    loja_id, titulo, imagem_url_light, imagem_url_dark, link_tipo, link_id, link_url, ordem, inicio, fim, ativo
  )
  VALUES (
    p_loja_id, p_titulo, p_imagem_url_light, p_imagem_url_dark, p_link_tipo, p_link_id, p_link_url, p_ordem, p_inicio, p_fim, true
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_banner(
  p_banner_id uuid,
  p_titulo text DEFAULT NULL,
  p_imagem_url_light text DEFAULT NULL,
  p_imagem_url_dark text DEFAULT NULL,
  p_link_tipo text DEFAULT NULL,
  p_link_id uuid DEFAULT NULL,
  p_link_url text DEFAULT NULL,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL,
  p_ativo boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.banners
  SET
    titulo = COALESCE(p_titulo, titulo),
    imagem_url_light = COALESCE(p_imagem_url_light, imagem_url_light),
    imagem_url_dark = COALESCE(p_imagem_url_dark, imagem_url_dark),
    link_tipo = COALESCE(p_link_tipo, link_tipo),
    link_id = COALESCE(p_link_id, link_id),
    link_url = COALESCE(p_link_url, link_url),
    inicio = COALESCE(p_inicio, inicio),
    fim = COALESCE(p_fim, fim),
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_banner(p_banner_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.banners SET deleted_at = now() WHERE id = p_banner_id;
END;
$$;

-- [ CUPONS ] -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_cupom(
  p_loja_id uuid,
  p_codigo text,
  p_tipo text,
  p_valor numeric DEFAULT NULL,
  p_valor_minimo numeric DEFAULT NULL,
  p_limite_total integer DEFAULT NULL,
  p_limite_por_cliente integer DEFAULT NULL,
  p_inicio timestamptz DEFAULT NULL,
  p_fim timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.cupons (
    loja_id, codigo, tipo, valor, valor_minimo, limite_total, limite_por_cliente, inicio, fim, ativo, usos
  )
  VALUES (
    p_loja_id, lower(p_codigo), p_tipo, p_valor, p_valor_minimo, p_limite_total, p_limite_por_cliente, p_inicio, p_fim, true, 0
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_soft_delete_cupom(p_cupom_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.cupons SET deleted_at = now() WHERE id = p_cupom_id;
END;
$$;

-- [ VALIDACAO (Função hibrida) ] -----------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_validar_cupom(
  p_loja_id uuid,
  p_codigo text,
  p_valor_pedido numeric,
  p_cliente_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cupom RECORD;
BEGIN
  SELECT * INTO v_cupom 
  FROM public.cupons 
  WHERE loja_id = p_loja_id 
    AND lower(codigo) = lower(p_codigo) 
    AND deleted_at IS NULL
    AND ativo = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valido', false, 'mensagem_erro', 'Cupom inválido ou não existe');
  END IF;

  IF v_cupom.inicio IS NOT NULL AND now() < v_cupom.inicio THEN
    RETURN jsonb_build_object('valido', false, 'mensagem_erro', 'Cupom ainda não está ativo');
  END IF;

  IF v_cupom.fim IS NOT NULL AND now() > v_cupom.fim THEN
    RETURN jsonb_build_object('valido', false, 'mensagem_erro', 'Cupom expirado');
  END IF;

  IF v_cupom.valor_minimo IS NOT NULL AND p_valor_pedido < v_cupom.valor_minimo THEN
    RETURN jsonb_build_object('valido', false, 'mensagem_erro', 'O pedido não atingiu o valor mínimo');
  END IF;

  IF v_cupom.limite_total IS NOT NULL AND v_cupom.usos >= v_cupom.limite_total THEN
    RETURN jsonb_build_object('valido', false, 'mensagem_erro', 'O limite global de uso do cupom foi atingido');
  END IF;

  -- Para avaliar o uso por cliente requereríamos puxar no histórico de pedidos deste p_cliente_id
  -- Mantemos simplificado por agora, ou no back-end Zod checa
  
  RETURN jsonb_build_object(
    'valido', true, 
    'cupom_id', v_cupom.id, 
    'tipo', v_cupom.tipo, 
    'valor_desconto', v_cupom.valor
  );
END;
$$;
