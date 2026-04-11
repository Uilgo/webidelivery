-- Título: 12 - RPC: Core
-- Descrição: Funções PL/pgSQL encapsuladas (RPCs) para gerenciar Perfis, Empresas e Lojas via Supabase de forma segura.

/**
 * ==============================================================================
 * 12_RPC_CORE
 * Funções CUD (Create, Update, Delete) do Módulo Core (Perfis, Empresas, Lojas)
 * ==============================================================================
 */

-- [ PERFIS ] -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_perfil(
  p_nome text,
  p_email text,
  p_cargo text,
  p_sobrenome text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_empresa_id uuid DEFAULT NULL,
  p_loja_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE slug = p_cargo;

  INSERT INTO public.perfis (nome, sobrenome, email, whatsapp, role_id, empresa_id, loja_id, status)
  VALUES (p_nome, p_sobrenome, p_email, p_whatsapp, v_role_id, p_empresa_id, p_loja_id, 'ativo')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_perfil(
  p_perfil_id uuid,
  p_nome text DEFAULT NULL,
  p_sobrenome text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_config_ui jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.perfis
  SET
    nome = COALESCE(p_nome, nome),
    sobrenome = COALESCE(p_sobrenome, sobrenome),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    config_ui = COALESCE(p_config_ui, config_ui),
    updated_at = now()
  WHERE id = p_perfil_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_desativar_perfil(
  p_perfil_id uuid,
  p_motivo text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.perfis
  SET status = 'inativo', updated_at = now()
  WHERE id = p_perfil_id;
END;
$$;

-- [ EMPRESAS ] -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_empresa(
  p_nome text,
  p_slug text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.empresas (nome, slug, status)
  VALUES (p_nome, p_slug, 'ativa')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_empresa(
  p_empresa_id uuid,
  p_nome text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_configuracoes jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.empresas
  SET
    nome = COALESCE(p_nome, nome),
    slug = COALESCE(p_slug, slug),
    configuracoes = COALESCE(p_configuracoes, configuracoes),
    updated_at = now()
  WHERE id = p_empresa_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_suspender_empresa(
  p_empresa_id uuid,
  p_motivo text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.empresas
  SET status = 'suspensa', updated_at = now()
  WHERE id = p_empresa_id;
END;
$$;

-- [ LOJAS ] --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_criar_loja(
  p_empresa_id uuid,
  p_nome_estabelecimento text,
  p_slug text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.lojas (
    empresa_id, nome_estabelecimento, slug, status
  )
  VALUES (
    p_empresa_id, p_nome_estabelecimento, p_slug, 'rascunho'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_loja(
  p_loja_id uuid,
  p_nome_estabelecimento text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_logo_light_url text DEFAULT NULL,
  p_logo_dark_url text DEFAULT NULL,
  p_horario_funcionamento jsonb DEFAULT NULL,
  p_aberto boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.lojas
  SET
    nome_estabelecimento = COALESCE(p_nome_estabelecimento, nome_estabelecimento),
    telefone = COALESCE(p_telefone, telefone),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    email = COALESCE(p_email, email),
    logo_light_url = COALESCE(p_logo_light_url, logo_light_url),
    logo_dark_url = COALESCE(p_logo_dark_url, logo_dark_url),
    horario_funcionamento = COALESCE(p_horario_funcionamento, horario_funcionamento),
    aberto = COALESCE(p_aberto, aberto),
    updated_at = now()
  WHERE id = p_loja_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_config_geral_loja(
  p_loja_id uuid,
  p_config_geral jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.lojas
  SET 
    config_geral = config_geral || p_config_geral,
    updated_at = now()
  WHERE id = p_loja_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_config_tema_loja(
  p_loja_id uuid,
  p_config_tema jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.lojas
  SET 
    config_tema = config_tema || p_config_tema,
    updated_at = now()
  WHERE id = p_loja_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_atualizar_setup_status_loja(
  p_loja_id uuid,
  p_setup_status jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.lojas
  SET 
    setup_status = setup_status || p_setup_status,
    updated_at = now()
  WHERE id = p_loja_id;
END;
$$;
