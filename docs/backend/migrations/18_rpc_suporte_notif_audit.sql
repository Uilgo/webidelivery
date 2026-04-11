-- Título: 18 - RPC: Suporte e Notificações
-- Descrição: Funções PL/pgSQL (RPCs) para interação do backoffice: abertura de tickets e envio de mensagens.

/**
 * ==============================================================================
 * 18_RPC_SUPORTE_NOTIF_AUDIT
 * Funções CUD dos 3 Módulos Restantes em um único batch focado no backoffice Master
 * ==============================================================================
 */

-- [ SUPORTE : TICKETS ] --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_ticket(
  p_loja_id uuid,
  p_aberto_por uuid,
  p_titulo text,
  p_categoria text DEFAULT NULL,
  p_prioridade text DEFAULT 'normal',
  p_canal text DEFAULT 'chat',
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.tickets (loja_id, aberto_por, titulo, categoria, prioridade, canal, metadata, status)
  VALUES (p_loja_id, p_aberto_por, p_titulo, p_categoria, p_prioridade, p_canal, p_metadata, 'aberto')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_ticket(
  p_ticket_id uuid,
  p_categoria text DEFAULT NULL,
  p_prioridade text DEFAULT NULL,
  p_status text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.tickets
  SET
    categoria = COALESCE(p_categoria, categoria),
    prioridade = COALESCE(p_prioridade, prioridade),
    status = COALESCE(p_status, status),
    resolvido_em = CASE WHEN p_status = 'resolvido' THEN coalesce(resolvido_em, now()) ELSE resolvido_em END,
    updated_at = now()
  WHERE id = p_ticket_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atribuir_ticket(
  p_ticket_id uuid,
  p_atribuido_a uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.tickets SET atribuido_a = p_atribuido_a, updated_at = now() WHERE id = p_ticket_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_enviar_mensagem_ticket(
  p_ticket_id uuid,
  p_autor_id uuid,
  p_lado text,
  p_conteudo text DEFAULT NULL,
  p_anexos jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.ticket_mensagens (ticket_id, autor_id, lado, conteudo, anexos)
  VALUES (p_ticket_id, p_autor_id, p_lado, p_conteudo, p_anexos)
  RETURNING id INTO v_id;
  
  -- Atualiza o último toque no ticket e os contadores unread
  UPDATE public.tickets
  SET 
    ultima_mensagem_em = now(),
    nao_lidas_suporte = CASE WHEN p_lado = 'cliente' THEN coalesce(nao_lidas_suporte, 0) + 1 ELSE nao_lidas_suporte END,
    nao_lidas_cliente = CASE WHEN p_lado = 'suporte' THEN coalesce(nao_lidas_cliente, 0) + 1 ELSE nao_lidas_cliente END
  WHERE id = p_ticket_id;

  RETURN v_id;
END;
$$;

-- [ NOTIFICACOES ] -------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_notificacao(
  p_perfil_id uuid,
  p_tipo text,
  p_payload jsonb,
  p_loja_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notificacoes (perfil_id, loja_id, tipo, payload, lida)
  VALUES (p_perfil_id, p_loja_id, p_tipo, p_payload, false)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_marcar_notificacao_lida(p_notificacao_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.notificacoes SET lida = true, lida_em = now() WHERE id = p_notificacao_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_marcar_todas_lidas(p_perfil_id uuid) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.notificacoes SET lida = true, lida_em = now() WHERE perfil_id = p_perfil_id AND lida = false;
END;
$$;

-- [ AUDITORIA E LGPD ] ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_registrar_log_loja(
  p_loja_id uuid,
  p_acao text,
  p_perfil_id uuid DEFAULT NULL,
  p_usuario_email text DEFAULT NULL,
  p_usuario_nome text DEFAULT NULL,
  p_usuario_cargo text DEFAULT NULL,
  p_tabela text DEFAULT NULL,
  p_registro_id text DEFAULT NULL,
  p_dados_antes jsonb DEFAULT NULL,
  p_dados_depois jsonb DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_tipo_impersonation text DEFAULT NULL,
  p_tinha_permissao_cud boolean DEFAULT false,
  p_contexto jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.logs_lojas (
    loja_id, perfil_id, usuario_email, usuario_nome, usuario_cargo, acao, tabela, registro_id, 
    dados_antes, dados_depois, ip, user_agent, tipo_impersonation, tinha_permissao_cud, contexto
  ) VALUES (
    p_loja_id, p_perfil_id, p_usuario_email, p_usuario_nome, p_usuario_cargo, p_acao, p_tabela, p_registro_id,
    p_dados_antes, p_dados_depois, p_ip, p_user_agent, p_tipo_impersonation, p_tinha_permissao_cud, p_contexto
  );
END;
$$;
