-- Título: 16 - RPC: Pedidos
-- Descrição: Funções PL/pgSQL (RPCs) para o fluxo de vida do pedido: registrar, aceitar, despachar, concluir e avaliar.

/**
 * ==============================================================================
 * 16_RPC_PEDIDOS
 * Funções CUD para fluxo de pedidos, clientes e histórico
 * ==============================================================================
 */

-- [ CLIENTES ] -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_cliente(
  p_loja_id uuid,
  p_nome text,
  p_telefone text,
  p_tipo_cadastro text DEFAULT 'visitante',
  p_email text DEFAULT NULL,
  p_device_token text DEFAULT NULL,
  p_enderecos_salvos jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.clientes (
    loja_id, tipo_cadastro, nome, telefone, email, device_token, enderecos_salvos, total_pedidos, total_gasto
  )
  VALUES (
    p_loja_id, p_tipo_cadastro, p_nome, p_telefone, p_email, p_device_token, p_enderecos_salvos, 0, 0
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_cliente(
  p_cliente_id uuid,
  p_nome text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_enderecos_salvos jsonb DEFAULT NULL,
  p_perfil_crm jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.clientes
  SET
    nome = COALESCE(p_nome, nome),
    telefone = COALESCE(p_telefone, telefone),
    email = COALESCE(p_email, email),
    enderecos_salvos = COALESCE(p_enderecos_salvos, enderecos_salvos),
    -- Operador de concatenação de jsonb para o perfil CRM atualizar chaves seletivamente
    perfil_crm = CASE WHEN p_perfil_crm IS NOT NULL THEN perfil_crm || p_perfil_crm ELSE perfil_crm END,
    updated_at = now()
  WHERE id = p_cliente_id;
END;
$$;

-- [ PEDIDOS ] ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_pedido(
  p_loja_id uuid,
  p_cliente_id uuid,
  p_cliente_nome text,
  p_carrinho jsonb,
  p_logistica jsonb,
  p_subtotal numeric,
  p_desconto numeric,
  p_total numeric,
  p_pagamento jsonb,
  p_cupom_id uuid DEFAULT NULL,
  p_cliente_telefone text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.pedidos (
    loja_id, cliente_id, cupom_id, cliente_nome, cliente_telefone, carrinho, logistica, 
    subtotal, desconto, total, pagamento, estado_atual
  )
  VALUES (
    p_loja_id, p_cliente_id, p_cupom_id, p_cliente_nome, p_cliente_telefone, p_carrinho, p_logistica,
    p_subtotal, p_desconto, p_total, p_pagamento, 
    jsonb_build_object(
      'status', 'pendente',
      'atualizado_em', now(),
      'historico', jsonb_build_array(jsonb_build_object('status', 'pendente', 'timestamp', now()))
    )
  )
  RETURNING id INTO v_id;
  
  -- Atualiza agregados do cliente de forma atômica
  UPDATE public.clientes
  SET 
    total_pedidos = total_pedidos + 1,
    total_gasto = total_gasto + p_total,
    ultimo_pedido_em = now()
  WHERE id = p_cliente_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_status_pedido(
  p_pedido_id uuid,
  p_novo_status text,
  p_motivo_cancelamento text DEFAULT NULL,
  p_cancelado_por text DEFAULT NULL,
  p_tempo_preparo_estimado_min integer DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_novo_historico jsonb;
BEGIN
  v_novo_historico := jsonb_build_object(
    'status', p_novo_status,
    'timestamp', now(),
    'motivo', p_motivo_cancelamento,
    'autor', p_cancelado_por,
    'estimativa_min', p_tempo_preparo_estimado_min
  );

  UPDATE public.pedidos
  SET
    estado_atual = jsonb_set(
      jsonb_set(
        estado_atual, 
        '{status}', 
        to_jsonb(p_novo_status)
      ),
      '{historico}',
      (estado_atual->'historico') || v_novo_historico
    ),
    updated_at = now()
  WHERE id = p_pedido_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atribuir_entregador(
  p_pedido_id uuid,
  p_entregador_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.pedidos
  SET entregador_id = p_entregador_id, updated_at = now()
  WHERE id = p_pedido_id;
END;
$$;

-- [ AVALIACOES ] ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_avaliacao(
  p_pedido_id uuid,
  p_loja_id uuid,
  p_cliente_id uuid,
  p_nota integer,
  p_comentarios_internos text DEFAULT NULL,
  p_tags_problema jsonb DEFAULT '[]'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.pedido_avaliacoes (
    pedido_id, loja_id, cliente_id, nota, comentarios_internos, tags_problema
  )
  VALUES (
    p_pedido_id, p_loja_id, p_cliente_id, p_nota, p_comentarios_internos, p_tags_problema
  );
END;
$$;
