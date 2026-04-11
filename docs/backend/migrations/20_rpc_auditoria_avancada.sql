-- Título: 20 - RPC: Auditoria Avançada
-- Descrição: Funções PL/pgSQL (RPCs) do fluxo de segurança: registro de LGPD, controle de Impersonation (acesso delegado) e logs de falhas.

/**
 * ==============================================================================
 * 20_RPC_AUDITORIA_AVANCADA
 * Funções CUD complementares para Auditoria Global, LGPD e Impersonation
 * ==============================================================================
 */

-- [ AUDITORIA GLOBAL (MASTER) ] ------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_registrar_audit_log(
  p_acao text,
  p_origem text,
  p_perfil_id uuid DEFAULT NULL,
  p_tabela text DEFAULT NULL,
  p_registro_id text DEFAULT NULL,
  p_dados_antes jsonb DEFAULT NULL,
  p_dados_depois jsonb DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_contexto jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    perfil_id, acao, tabela, registro_id, dados_antes, dados_depois, ip, user_agent, origem, contexto
  ) VALUES (
    p_perfil_id, p_acao, p_tabela, p_registro_id, p_dados_antes, p_dados_depois, p_ip, p_user_agent, p_origem, p_contexto
  );
END;
$$;

-- [ LGPD - CONSENTIMENTOS ] ----------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_registrar_consentimento(
  p_perfil_id uuid,
  p_tipo text,
  p_versao text,
  p_aceito boolean,
  p_ip_address text,
  p_user_agent text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.lgpd_consentimentos (perfil_id, tipo, versao, aceito, ip_address, user_agent)
  VALUES (p_perfil_id, p_tipo, p_versao, p_aceito, p_ip_address, p_user_agent)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- [ LGPD - EXCLUSAO DE DADOS (Direito ao Esquecimento) ] -----------------------

CREATE OR REPLACE FUNCTION public.rpc_solicitar_exclusao_dados(
  p_usuario_email text,
  p_usuario_nome text,
  p_perfil_id uuid DEFAULT NULL,
  p_motivo text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.lgpd_solicitacoes_exclusao (perfil_id, usuario_email, usuario_nome, status, motivo)
  VALUES (p_perfil_id, p_usuario_email, p_usuario_nome, 'pendente', p_motivo)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_processar_exclusao(
  p_solicitacao_id uuid,
  p_processada_por uuid,
  p_status text,
  p_observacoes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.lgpd_solicitacoes_exclusao
  SET
    status = p_status,
    observacoes = p_observacoes,
    processada_por = p_processada_por,
    processada_em = CASE WHEN p_status IN ('concluida', 'cancelada') THEN now() ELSE processada_em END,
    updated_at = now()
  WHERE id = p_solicitacao_id;
END;
$$;

-- [ IMPERSONATION ] ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_solicitar_impersonation(
  p_solicitante_id uuid,
  p_loja_id uuid,
  p_motivo text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.impersonation_solicitacoes (
    solicitante_id, loja_id, motivo, status, expira_em
  )
  VALUES (
    p_solicitante_id, p_loja_id, p_motivo, 'pendente', now() + interval '24 hours'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_responder_impersonation(
  p_solicitacao_id uuid,
  p_respondido_por uuid,
  p_aprovar boolean,
  p_prazo_horas integer DEFAULT 8
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.impersonation_solicitacoes
  SET 
    status = CASE WHEN p_aprovar THEN 'aprovada' ELSE 'recusada' END,
    respondido_por = p_respondido_por,
    respondido_em = now(),
    -- Se aprovado, define até quando será válido o impersonation CUD (padrão de 8 horas)
    acesso_expira_em = CASE WHEN p_aprovar THEN now() + make_interval(hours := p_prazo_horas) ELSE NULL END
  WHERE id = p_solicitacao_id;
  
  -- Se p_aprovar = false, poderia disparar aqui uma notificação para o Master.
END;
$$;
