-- Título: 17 - RPC: Logística
-- Descrição: Funções PL/pgSQL (RPCs) para cadastro de Entregadores e realização de repasses e acertos financeiros.

/**
 * ==============================================================================
 * 17_RPC_LOGISTICA
 * Funções CUD do Módulo Logístico, Frota e Entregadores
 * ==============================================================================
 */

-- [ ENTREGADORES ] -------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_entregador(
  p_loja_id uuid,
  p_nome_completo text,
  p_telefone text,
  p_perfil_logistico jsonb,
  p_email text DEFAULT NULL,
  p_cpf text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.entregadores (
    loja_id, nome_completo, telefone, email, cpf, perfil_logistico, ativo, status_trabalho
  )
  VALUES (
    p_loja_id, p_nome_completo, p_telefone, p_email, p_cpf, p_perfil_logistico, true, 'offline'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_entregador(
  p_entregador_id uuid,
  p_nome_completo text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_cpf text DEFAULT NULL,
  p_perfil_logistico jsonb DEFAULT NULL,
  p_ativo boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.entregadores
  SET
    nome_completo = COALESCE(p_nome_completo, nome_completo),
    telefone = COALESCE(p_telefone, telefone),
    email = COALESCE(p_email, email),
    cpf = COALESCE(p_cpf, cpf),
    perfil_logistico = CASE WHEN p_perfil_logistico IS NOT NULL THEN perfil_logistico || p_perfil_logistico ELSE perfil_logistico END,
    ativo = COALESCE(p_ativo, ativo),
    updated_at = now()
  WHERE id = p_entregador_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_status_entregador(
  p_entregador_id uuid,
  p_status_trabalho text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.entregadores
  SET 
    status_trabalho = p_status_trabalho, 
    updated_at = now()
  WHERE id = p_entregador_id;
END;
$$;

-- [ ACERTOS FINANCEIROS ] ------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_registrar_acerto(
  p_loja_id uuid,
  p_entregador_id uuid,
  p_total_corridas integer,
  p_valor_pago numeric,
  p_fechado_por uuid,
  p_registro_pagamento jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.entregador_acertos (
    loja_id, entregador_id, fechado_por, total_corridas, valor_pago, registro_pagamento
  )
  VALUES (
    p_loja_id, p_entregador_id, p_fechado_por, p_total_corridas, p_valor_pago, p_registro_pagamento
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
