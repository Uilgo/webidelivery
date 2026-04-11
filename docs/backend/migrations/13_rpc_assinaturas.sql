-- Título: 13 - RPC: Assinaturas
-- Descrição: Funções PL/pgSQL (RPCs) para a gestão de registros financeiros do SaaS: planos e faturas.

/**
 * ==============================================================================
 * 13_RPC_ASSINATURAS
 * Funções CUD (Create, Update, Delete) do Módulo SaaS Financeiro
 * ==============================================================================
 */

-- [ PLANOS ] -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_plano(
  p_nome text,
  p_preco jsonb,
  p_limites jsonb,
  p_recursos jsonb,
  p_descricao text DEFAULT NULL,
  p_destaque boolean DEFAULT false,
  p_ordem integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.planos (nome, descricao, preco, limites, recursos, destaque, ordem, status)
  VALUES (p_nome, p_descricao, p_preco, p_limites, p_recursos, p_destaque, p_ordem, 'ativo')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_plano(
  p_plano_id uuid,
  p_nome text DEFAULT NULL,
  p_descricao text DEFAULT NULL,
  p_preco jsonb DEFAULT NULL,
  p_limites jsonb DEFAULT NULL,
  p_recursos jsonb DEFAULT NULL,
  p_destaque boolean DEFAULT NULL,
  p_ordem integer DEFAULT NULL,
  p_status text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.planos
  SET
    nome = COALESCE(p_nome, nome),
    descricao = COALESCE(p_descricao, descricao),
    preco = COALESCE(p_preco, preco),
    limites = COALESCE(p_limites, limites),
    recursos = COALESCE(p_recursos, recursos),
    destaque = COALESCE(p_destaque, destaque),
    ordem = COALESCE(p_ordem, ordem),
    status = COALESCE(p_status, status),
    updated_at = now()
  WHERE id = p_plano_id;
END;
$$;

-- [ ASSINATURAS ] --------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_assinatura(
  p_empresa_id uuid,
  p_plano_id uuid,
  p_ciclo text,
  p_valor_atual numeric,
  p_trial_fim_em timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.assinaturas (
    empresa_id, plano_id, ciclo, valor_atual, trial_fim_em, status
  )
  VALUES (
    p_empresa_id, p_plano_id, p_ciclo, p_valor_atual, p_trial_fim_em, 
    CASE WHEN p_trial_fim_em IS NOT NULL THEN 'trial' ELSE 'ativa' END
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_assinatura(
  p_assinatura_id uuid,
  p_plano_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_ciclo text DEFAULT NULL,
  p_valor_atual numeric DEFAULT NULL,
  p_gateway_customer_id text DEFAULT NULL,
  p_gateway_subscription_id text DEFAULT NULL,
  p_renova_em timestamptz DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.assinaturas
  SET
    plano_id = COALESCE(p_plano_id, plano_id),
    status = COALESCE(p_status, status),
    ciclo = COALESCE(p_ciclo, ciclo),
    valor_atual = COALESCE(p_valor_atual, valor_atual),
    gateway_customer_id = COALESCE(p_gateway_customer_id, gateway_customer_id),
    gateway_subscription_id = COALESCE(p_gateway_subscription_id, gateway_subscription_id),
    renova_em = COALESCE(p_renova_em, renova_em),
    updated_at = now(),
    cancelada_em = CASE WHEN p_status = 'cancelada' THEN COALESCE(cancelada_em, now()) ELSE cancelada_em END
  WHERE id = p_assinatura_id;
END;
$$;

-- [ FATURAS & GATEWAY ] --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_registrar_fatura(
  p_assinatura_id uuid,
  p_empresa_id uuid,
  p_valor numeric,
  p_gateway_invoice_id text DEFAULT NULL,
  p_gateway_provider text DEFAULT NULL,
  p_vencimento_em timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.faturas (
    assinatura_id, empresa_id, valor, status, gateway_invoice_id, gateway_provider, vencimento_em
  )
  VALUES (
    p_assinatura_id, p_empresa_id, p_valor, 'pendente', p_gateway_invoice_id, p_gateway_provider, p_vencimento_em
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_confirmar_pagamento_fatura(
  p_fatura_id uuid,
  p_metodo_pagamento text,
  p_dados_gateway jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.faturas
  SET
    status = 'paga',
    metodo_pagamento = p_metodo_pagamento,
    dados_gateway = COALESCE(p_dados_gateway, dados_gateway),
    paga_em = now(),
    updated_at = now()
  WHERE id = p_fatura_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_processar_webhook_gateway(
  p_gateway_provider text,
  p_event_id text,
  p_event_type text,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.gateway_eventos (
    gateway_provider, event_id, event_type, payload
  )
  VALUES (
    p_gateway_provider, p_event_id, p_event_type, p_payload
  )
  RETURNING id INTO v_id;
  
  -- NOTA: O processamento específico (que atualiza assinaturas com base no payload)
  -- fica de forma ideal no Worker Node via API Server ouvindo eventos deste insert.
  
  RETURN v_id;
END;
$$;
