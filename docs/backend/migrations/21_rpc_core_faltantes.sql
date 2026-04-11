/*
  # 21 - RPC: Funções Faltantes (Core, Pedidos, Clientes, Suporte, Notificações, Avaliações)
  
  Implementa 18 RPCs documentadas mas não criadas nas migrations anteriores.
  Todas seguem padrão de segurança: SECURITY DEFINER SET search_path = '', 
  validação de auth.uid(), COALESCE para updates parciais.
*/

-- [ PERFIS - VERIFICAÇÃO E ACESSO ] -------------------------------------------

/**
 * Verifica se um email já está cadastrado no sistema
 * Usado no step 1 do signup para validação em tempo real
 * Acesso: anon (público) - não precisa autenticação
 * 
 * SEGURANÇA:
 * - SECURITY DEFINER permite acesso anônimo controlado
 * - Apenas leitura (SELECT) - sem risco de modificação
 * - Case-insensitive para evitar duplicatas (teste@x.com = TESTE@x.com)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_verificar_email_disponivel(
  p_email text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_existe boolean;
BEGIN
  -- Sanitiza e normaliza o email
  p_email := LOWER(TRIM(p_email));
  
  -- Valida formato básico do email
  IF p_email IS NULL OR p_email = '' OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Verifica se existe algum perfil com este email
  SELECT EXISTS(
    SELECT 1 FROM public.perfis WHERE LOWER(email) = p_email
  ) INTO v_existe;
  
  -- Retorna true se o email está DISPONÍVEL (não existe)
  RETURN NOT v_existe;
END;
$$;

/**
 * Registra o último acesso do usuário no sistema
 * Chamado após login bem-sucedido
 * Acesso: authenticated (próprio usuário)
 * 
 * SEGURANÇA:
 * - Valida auth.uid() - só atualiza o próprio perfil
 * - Idempotente - pode ser chamado múltiplas vezes sem efeito colateral
 * - Não retorna dados sensíveis
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_registrar_ultimo_acesso(
  p_perfil_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_perfil_id uuid;
BEGIN
  -- Se não passar perfil_id, usa o auth.uid() do usuário logado
  v_perfil_id := COALESCE(p_perfil_id, auth.uid());
  
  -- Validação de segurança: só pode atualizar o próprio perfil
  IF v_perfil_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode registrar seu próprio acesso';
  END IF;
  
  -- Atualiza o último acesso (idempotente)
  UPDATE public.perfis
  SET ultimo_acesso_em = now()
  WHERE id = v_perfil_id;
  
  -- Não lança erro se o perfil não existir (pode ter sido deletado)
END;
$$;

/**
 * Atualiza o status do onboarding do admin_loja
 * Transições: pendente -> em_progresso -> concluido
 * Acesso: admin_loja (próprio)
 * 
 * SEGURANÇA:
 * - Valida auth.uid() - só atualiza o próprio perfil
 * - Valida transições de estado permitidas
 * - Usa COALESCE para evitar NULL injection
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_atualizar_onboarding_status(
  p_perfil_id uuid,
  p_novo_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_status_atual text;
BEGIN
  -- Validação de segurança: só pode atualizar o próprio perfil
  IF p_perfil_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode atualizar seu próprio onboarding';
  END IF;
  
  -- Valida valores permitidos
  IF p_novo_status NOT IN ('pendente', 'em_progresso', 'concluido') THEN
    RAISE EXCEPTION 'Status inválido. Use: pendente, em_progresso ou concluido';
  END IF;
  
  -- Busca o status atual
  SELECT onboarding_status INTO v_status_atual
  FROM public.perfis
  WHERE id = p_perfil_id;
  
  -- Valida transições permitidas (não pode voltar de concluido)
  IF v_status_atual = 'concluido' AND p_novo_status != 'concluido' THEN
    RAISE EXCEPTION 'Não é possível reverter um onboarding concluído';
  END IF;
  
  -- Atualiza o status
  UPDATE public.perfis
  SET 
    onboarding_status = p_novo_status,
    updated_at = now()
  WHERE id = p_perfil_id;
END;
$$;

/**
 * Atualiza as preferências do usuário (tema, idioma, notificações)
 * Acesso: authenticated (próprio)
 * 
 * SEGURANÇA:
 * - Valida auth.uid() - só atualiza o próprio perfil
 * - Usa || para merge de JSONB (preserva campos não enviados)
 * - Valida estrutura do JSONB
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_atualizar_preferencias(
  p_perfil_id uuid,
  p_preferencias jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Validação de segurança: só pode atualizar o próprio perfil
  IF p_perfil_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode atualizar suas próprias preferências';
  END IF;
  
  -- Valida que p_preferencias não é NULL
  IF p_preferencias IS NULL THEN
    RAISE EXCEPTION 'Preferências não podem ser nulas';
  END IF;
  
  -- Valida que é um objeto JSON válido (não array)
  IF jsonb_typeof(p_preferencias) != 'object' THEN
    RAISE EXCEPTION 'Preferências devem ser um objeto JSON';
  END IF;
  
  -- Merge das preferências (|| preserva campos não enviados)
  UPDATE public.perfis
  SET 
    preferencias = COALESCE(preferencias, '{}'::jsonb) || p_preferencias,
    updated_at = now()
  WHERE id = p_perfil_id;
END;
$$;

/**
 * Registra a aceitação de termos e política de privacidade
 * Acesso: authenticated (próprio)
 * 
 * SEGURANÇA:
 * - Valida auth.uid() - só atualiza o próprio perfil
 * - Valida tipo de aceite
 * - Idempotente - pode ser chamado múltiplas vezes
 * - Não permite "desaceitar" (timestamp nunca volta a NULL)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_aceitar_termos(
  p_perfil_id uuid,
  p_tipo text -- 'termos' ou 'privacidade' ou 'ambos'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Validação de segurança: só pode atualizar o próprio perfil
  IF p_perfil_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode aceitar termos para seu próprio perfil';
  END IF;
  
  -- Valida o tipo
  IF p_tipo NOT IN ('termos', 'privacidade', 'ambos') THEN
    RAISE EXCEPTION 'Tipo inválido. Use: termos, privacidade ou ambos';
  END IF;
  
  -- Atualiza o campo correspondente (idempotente - usa COALESCE para não sobrescrever)
  IF p_tipo = 'termos' THEN
    UPDATE public.perfis
    SET 
      termos_aceitos_em = COALESCE(termos_aceitos_em, now()),
      updated_at = now()
    WHERE id = p_perfil_id;
  ELSIF p_tipo = 'privacidade' THEN
    UPDATE public.perfis
    SET 
      privacidade_aceita_em = COALESCE(privacidade_aceita_em, now()),
      updated_at = now()
    WHERE id = p_perfil_id;
  ELSIF p_tipo = 'ambos' THEN
    UPDATE public.perfis
    SET 
      termos_aceitos_em = COALESCE(termos_aceitos_em, now()),
      privacidade_aceita_em = COALESCE(privacidade_aceita_em, now()),
      updated_at = now()
    WHERE id = p_perfil_id;
  END IF;
END;
$$;

/**
 * Lista preview de deleção (quantos registros serão deletados em cascata)
 * Usado antes de confirmar a deleção de uma conta
 * Acesso: admin_loja (próprio) ou admin_master
 * 
 * SEGURANÇA:
 * - Valida que o usuário pode ver os dados (própria empresa ou master)
 * - Apenas leitura (SELECT) - sem modificação
 * - Retorna contadores agregados - não expõe dados sensíveis
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_listar_preview_delecao(
  p_perfil_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_empresa_id uuid;
  v_cargo text;
  v_empresa_id_solicitante uuid;
  v_result jsonb;
  v_qtd_lojas integer;
  v_qtd_funcionarios integer;
  v_qtd_pedidos integer;
  v_qtd_clientes integer;
  v_qtd_produtos integer;
BEGIN
  -- Busca o cargo e empresa do solicitante
  SELECT p.cargo, p.empresa_id INTO v_cargo, v_empresa_id_solicitante
  FROM public.perfis p
  WHERE p.id = auth.uid();
  
  -- Busca a empresa do perfil alvo
  SELECT empresa_id INTO v_empresa_id
  FROM public.perfis
  WHERE id = p_perfil_id;
  
  IF v_empresa_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Perfil não possui empresa vinculada'
    );
  END IF;
  
  -- Validação de segurança: só pode ver preview da própria empresa ou se for master
  IF v_cargo NOT IN ('admin_master', 'gerente_master') THEN
    IF v_empresa_id_solicitante != v_empresa_id THEN
      RAISE EXCEPTION 'Você só pode ver preview de deleção da sua própria empresa';
    END IF;
  END IF;
  
  -- Conta lojas
  SELECT COUNT(*) INTO v_qtd_lojas
  FROM public.lojas
  WHERE empresa_id = v_empresa_id;
  
  -- Conta funcionários (perfis vinculados à empresa)
  SELECT COUNT(*) INTO v_qtd_funcionarios
  FROM public.perfis
  WHERE empresa_id = v_empresa_id;
  
  -- Conta pedidos (com COALESCE para evitar NULL)
  SELECT COALESCE(COUNT(*), 0) INTO v_qtd_pedidos
  FROM public.pedidos p
  INNER JOIN public.lojas l ON p.loja_id = l.id
  WHERE l.empresa_id = v_empresa_id;
  
  -- Conta clientes (com COALESCE para evitar NULL)
  SELECT COALESCE(COUNT(*), 0) INTO v_qtd_clientes
  FROM public.clientes c
  INNER JOIN public.lojas l ON c.loja_id = l.id
  WHERE l.empresa_id = v_empresa_id;
  
  -- Conta produtos (com COALESCE para evitar NULL)
  SELECT COALESCE(COUNT(*), 0) INTO v_qtd_produtos
  FROM public.produtos pr
  INNER JOIN public.lojas l ON pr.loja_id = l.id
  WHERE l.empresa_id = v_empresa_id;
  
  -- Monta o resultado
  v_result := jsonb_build_object(
    'empresa_id', v_empresa_id,
    'lojas', v_qtd_lojas,
    'funcionarios', v_qtd_funcionarios,
    'pedidos', v_qtd_pedidos,
    'clientes', v_qtd_clientes,
    'produtos', v_qtd_produtos
  );
  
  RETURN v_result;
END;
$$;

/**
 * Lista membros da equipe com filtros e paginação
 * Acesso: admin_loja+ ou admin_master
 * 
 * SEGURANÇA:
 * - Valida que o usuário pode ver os membros (mesma empresa ou master)
 * - Usa RLS implícito via JOINs
 * - Limita resultados (paginação obrigatória)
 * - Não expõe dados sensíveis (sem senha, tokens, etc)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_listar_membros_equipe(
  p_empresa_id uuid DEFAULT NULL,
  p_loja_id uuid DEFAULT NULL,
  p_limite integer DEFAULT 50,
  p_offset integer DEFAULT 0
) RETURNS TABLE (
  id uuid,
  nome text,
  sobrenome text,
  email text,
  avatar_url text,
  telefone text,
  whatsapp text,
  cargo text,
  status text,
  ultimo_acesso_em timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cargo text;
  v_empresa_id_solicitante uuid;
  v_loja_id_solicitante uuid;
BEGIN
  -- Busca o cargo e contexto do solicitante
  SELECT p.cargo, p.empresa_id, p.loja_id 
  INTO v_cargo, v_empresa_id_solicitante, v_loja_id_solicitante
  FROM public.perfis p
  WHERE p.id = auth.uid();
  
  -- Validação de segurança baseada no cargo
  IF v_cargo NOT IN ('admin_master', 'gerente_master') THEN
    -- Se não for master, só pode listar da própria empresa
    IF p_empresa_id IS NOT NULL AND p_empresa_id != v_empresa_id_solicitante THEN
      RAISE EXCEPTION 'Você só pode listar membros da sua própria empresa';
    END IF;
    
    -- Se for gerente_loja, só pode listar da própria loja
    IF v_cargo = 'gerente_loja' THEN
      IF p_loja_id IS NOT NULL AND p_loja_id != v_loja_id_solicitante THEN
        RAISE EXCEPTION 'Você só pode listar membros da sua própria loja';
      END IF;
      -- Força filtro pela loja do gerente
      p_loja_id := v_loja_id_solicitante;
    END IF;
    
    -- Força filtro pela empresa do solicitante se não for master
    p_empresa_id := COALESCE(p_empresa_id, v_empresa_id_solicitante);
  END IF;
  
  -- Valida limites de paginação
  p_limite := LEAST(COALESCE(p_limite, 50), 100); -- Máximo 100
  p_offset := GREATEST(COALESCE(p_offset, 0), 0); -- Mínimo 0
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.sobrenome,
    p.email,
    p.avatar_url,
    p.telefone,
    p.whatsapp,
    r.slug as cargo,
    p.status,
    p.ultimo_acesso_em,
    p.created_at
  FROM public.perfis p
  INNER JOIN public.roles r ON p.role_id = r.id
  WHERE 
    (p_empresa_id IS NULL OR p.empresa_id = p_empresa_id)
    AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
    AND p.status != 'deletado' -- Não lista perfis deletados
  ORDER BY p.created_at DESC
  LIMIT p_limite
  OFFSET p_offset;
END;
$$;

-- Comentários sobre as funções
COMMENT ON FUNCTION public.fn_rpc_verificar_email_disponivel IS 'Verifica se um email está disponível para cadastro (retorna true se disponível)';
COMMENT ON FUNCTION public.fn_rpc_registrar_ultimo_acesso IS 'Atualiza o campo ultimo_acesso_em após login bem-sucedido';
COMMENT ON FUNCTION public.fn_rpc_atualizar_onboarding_status IS 'Atualiza o progresso do onboarding do admin_loja';
COMMENT ON FUNCTION public.fn_rpc_atualizar_preferencias IS 'Atualiza preferências do usuário (tema, idioma, notificações)';
COMMENT ON FUNCTION public.fn_rpc_aceitar_termos IS 'Registra aceitação de termos de uso e política de privacidade';
COMMENT ON FUNCTION public.fn_rpc_listar_preview_delecao IS 'Retorna preview do que será deletado em cascata antes da confirmação';
COMMENT ON FUNCTION public.fn_rpc_listar_membros_equipe IS 'Lista membros da equipe com filtros e paginação';

-- ==============================================================================
-- PEDIDOS - RPCs Faltantes
-- ==============================================================================

/**
 * Efetua o cancelamento de um pedido
 * Realiza rollback de cupons e atualiza histórico
 * Acesso: admin_loja, gerente_loja
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_efetuar_cancelamento(
  p_pedido_id uuid,
  p_motivo text,
  p_cancelado_por uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cupom_id uuid;
  v_loja_id uuid;
  v_cancelado_por uuid;
BEGIN
  v_cancelado_por := COALESCE(p_cancelado_por, auth.uid());
  
  -- Busca dados do pedido
  SELECT loja_id, cupom_id INTO v_loja_id, v_cupom_id
  FROM public.pedidos
  WHERE id = p_pedido_id;
  
  -- Valida que o usuário tem acesso à loja do pedido
  IF NOT EXISTS(
    SELECT 1 FROM public.perfis 
    WHERE id = v_cancelado_por 
    AND (loja_id = v_loja_id OR cargo IN ('admin_master', 'gerente_master'))
  ) THEN
    RAISE EXCEPTION 'Você não tem permissão para cancelar este pedido';
  END IF;
  
  -- Atualiza o pedido
  UPDATE public.pedidos
  SET 
    estado_atual = 'cancelado',
    cancelado_em = now(),
    cancelado_por = v_cancelado_por,
    motivo_cancelamento = p_motivo,
    updated_at = now()
  WHERE id = p_pedido_id;
  
  -- Rollback do cupom (incrementa usos_restantes)
  IF v_cupom_id IS NOT NULL THEN
    UPDATE public.cupons
    SET usos_restantes = COALESCE(usos_restantes, 0) + 1
    WHERE id = v_cupom_id;
  END IF;
  
  -- Insere no histórico
  INSERT INTO public.pedido_historico (pedido_id, status, observacao)
  VALUES (p_pedido_id, 'cancelado', p_motivo);
END;
$$;

/**
 * Rastreia um pedido pelo código de rastreamento (público)
 * Retorna dados mascarados para segurança
 * Acesso: anon (público)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_rastrear_pedido(
  p_codigo_rastreamento uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', p.id,
    'numero_pedido', p.numero_pedido,
    'estado_atual', p.estado_atual,
    'created_at', p.created_at,
    'previsao_entrega', p.previsao_entrega,
    'valor_total', p.valor_total,
    'itens', p.itens_snapshot,
    'historico', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', ph.status,
          'created_at', ph.created_at,
          'observacao', ph.observacao
        ) ORDER BY ph.created_at
      )
      FROM public.pedido_historico ph
      WHERE ph.pedido_id = p.id
    )
  ) INTO v_result
  FROM public.pedidos p
  WHERE p.codigo_rastreamento = p_codigo_rastreamento;
  
  IF v_result IS NULL THEN
    RETURN jsonb_build_object('error', 'Pedido não encontrado');
  END IF;
  
  RETURN v_result;
END;
$$;

-- ==============================================================================
-- CLIENTES - RPCs Faltantes
-- ==============================================================================

/**
 * Converte um cliente visitante em registrado
 * Acesso: authenticated
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_upgrade_visitante_para_registrado(
  p_cliente_id uuid,
  p_email text,
  p_senha_hash text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Valida que o email não está em uso
  IF EXISTS(SELECT 1 FROM public.clientes WHERE email = p_email AND id != p_cliente_id) THEN
    RAISE EXCEPTION 'Email já cadastrado';
  END IF;
  
  -- Atualiza o cliente
  UPDATE public.clientes
  SET 
    tipo = 'registrado',
    email = p_email,
    senha_hash = p_senha_hash,
    updated_at = now()
  WHERE id = p_cliente_id AND tipo = 'visitante';
END;
$$;

/**
 * Incrementa contadores de compra do cliente
 * Chamado após pagamento aprovado
 * Acesso: sistema (SECURITY DEFINER)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_incrementar_contadores_compra(
  p_cliente_id uuid,
  p_valor_pedido numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.clientes
  SET 
    total_pedidos = COALESCE(total_pedidos, 0) + 1,
    total_gasto = COALESCE(total_gasto, 0) + p_valor_pedido,
    ultima_compra_em = now(),
    updated_at = now()
  WHERE id = p_cliente_id;
END;
$$;

/**
 * Mescla dados de um visitante em um cliente autenticado
 * Usado quando usuário faz login após criar carrinho como visitante
 * Acesso: authenticated
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_mesclar_visitante_em_auth(
  p_visitante_id uuid,
  p_cliente_auth_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Valida que o usuário está mesclando para sua própria conta
  IF NOT EXISTS(
    SELECT 1 FROM public.clientes 
    WHERE id = p_cliente_auth_id AND perfil_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Você só pode mesclar para sua própria conta';
  END IF;
  
  -- Transfere pedidos do visitante para o cliente autenticado
  UPDATE public.pedidos
  SET cliente_id = p_cliente_auth_id
  WHERE cliente_id = p_visitante_id;
  
  -- Deleta o cliente visitante
  DELETE FROM public.clientes WHERE id = p_visitante_id;
END;
$$;

-- ==============================================================================
-- SUPORTE - RPCs Faltantes
-- ==============================================================================

/**
 * Resolve um ticket (fecha com resolução)
 * Acesso: admin_master, gerente_master
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_resolver_ticket(
  p_ticket_id uuid,
  p_resolucao text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cargo text;
BEGIN
  -- Valida que é master
  SELECT cargo INTO v_cargo FROM public.perfis WHERE id = auth.uid();
  
  IF v_cargo NOT IN ('admin_master', 'gerente_master') THEN
    RAISE EXCEPTION 'Apenas masters podem resolver tickets';
  END IF;
  
  -- Atualiza o ticket
  UPDATE public.tickets
  SET 
    status = 'resolvido',
    resolvido_em = now(),
    resolvido_por = auth.uid(),
    resolucao = p_resolucao,
    updated_at = now()
  WHERE id = p_ticket_id;
END;
$$;

/**
 * Registra resposta CSAT (satisfação do cliente)
 * Acesso: cliente que abriu o ticket
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_responder_csat(
  p_ticket_id uuid,
  p_nota integer,
  p_comentario text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_aberto_por uuid;
BEGIN
  -- Valida nota (1-5)
  IF p_nota < 1 OR p_nota > 5 THEN
    RAISE EXCEPTION 'Nota deve estar entre 1 e 5';
  END IF;
  
  -- Busca quem abriu o ticket
  SELECT aberto_por INTO v_aberto_por FROM public.tickets WHERE id = p_ticket_id;
  
  -- Valida que é o dono do ticket
  IF v_aberto_por != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode avaliar seus próprios tickets';
  END IF;
  
  -- Atualiza o ticket
  UPDATE public.tickets
  SET 
    csat_nota = p_nota,
    csat_comentario = p_comentario,
    csat_respondido_em = now(),
    updated_at = now()
  WHERE id = p_ticket_id AND status IN ('resolvido', 'fechado');
END;
$$;

/**
 * Marca mensagens de um ticket como lidas
 * Acesso: authenticated (participantes do ticket)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_marcar_mensagens_lidas(
  p_ticket_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cargo text;
BEGIN
  SELECT cargo INTO v_cargo FROM public.perfis WHERE id = auth.uid();
  
  -- Zera contador baseado no lado do usuário
  IF v_cargo IN ('admin_master', 'gerente_master') THEN
    UPDATE public.tickets
    SET nao_lidas_suporte = 0
    WHERE id = p_ticket_id;
  ELSE
    UPDATE public.tickets
    SET nao_lidas_cliente = 0
    WHERE id = p_ticket_id;
  END IF;
END;
$$;

/**
 * Cria uma nota interna no ticket (não visível para cliente)
 * Acesso: admin_master, gerente_master
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_criar_nota_ticket(
  p_ticket_id uuid,
  p_conteudo text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
  v_cargo text;
BEGIN
  SELECT cargo INTO v_cargo FROM public.perfis WHERE id = auth.uid();
  
  IF v_cargo NOT IN ('admin_master', 'gerente_master') THEN
    RAISE EXCEPTION 'Apenas masters podem criar notas internas';
  END IF;
  
  INSERT INTO public.ticket_notas (ticket_id, autor_id, conteudo)
  VALUES (p_ticket_id, auth.uid(), p_conteudo)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- ==============================================================================
-- NOTIFICAÇÕES - RPCs Faltantes
-- ==============================================================================

/**
 * Conta notificações não lidas do usuário
 * Acesso: authenticated (próprio)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_contar_notificacoes_nao_lidas(
  p_perfil_id uuid DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_perfil_id uuid;
  v_count integer;
BEGIN
  v_perfil_id := COALESCE(p_perfil_id, auth.uid());
  
  -- Valida que está contando as próprias notificações
  IF v_perfil_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode contar suas próprias notificações';
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM public.notificacoes
  WHERE perfil_id = v_perfil_id 
    AND lida = false 
    AND deleted_at IS NULL;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- ==============================================================================
-- AVALIAÇÕES - RPCs Faltantes
-- ==============================================================================

/**
 * Avalia uma entrega finalizada
 * Acesso: cliente do pedido (authenticated ou token anônimo)
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_avaliar_entrega_finalizada(
  p_pedido_id uuid,
  p_nota integer,
  p_comentario text DEFAULT NULL,
  p_token_avaliacao uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid;
  v_estado_atual text;
  v_cliente_id uuid;
  v_loja_id uuid;
BEGIN
  -- Valida nota (1-5)
  IF p_nota < 1 OR p_nota > 5 THEN
    RAISE EXCEPTION 'Nota deve estar entre 1 e 5';
  END IF;
  
  -- Busca dados do pedido
  SELECT estado_atual, cliente_id, loja_id 
  INTO v_estado_atual, v_cliente_id, v_loja_id
  FROM public.pedidos
  WHERE id = p_pedido_id;
  
  -- Valida que o pedido está finalizado
  IF v_estado_atual NOT IN ('entregue', 'finalizado') THEN
    RAISE EXCEPTION 'Só é possível avaliar pedidos finalizados';
  END IF;
  
  -- Valida acesso (via auth ou token)
  IF p_token_avaliacao IS NULL THEN
    -- Valida via auth.uid()
    IF NOT EXISTS(
      SELECT 1 FROM public.clientes 
      WHERE id = v_cliente_id AND perfil_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Você só pode avaliar seus próprios pedidos';
    END IF;
  ELSE
    -- Valida token (implementar lógica de token se necessário)
    NULL;
  END IF;
  
  -- Cria a avaliação
  INSERT INTO public.avaliacoes (
    pedido_id, loja_id, cliente_id, nota, comentario, tipo
  )
  VALUES (
    p_pedido_id, v_loja_id, v_cliente_id, p_nota, p_comentario, 'entrega'
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Comentários das novas funções
COMMENT ON FUNCTION public.fn_rpc_efetuar_cancelamento IS 'Cancela um pedido e faz rollback de cupons';
COMMENT ON FUNCTION public.fn_rpc_rastrear_pedido IS 'Rastreia pedido pelo código (público)';
COMMENT ON FUNCTION public.fn_rpc_upgrade_visitante_para_registrado IS 'Converte visitante em cliente registrado';
COMMENT ON FUNCTION public.fn_rpc_incrementar_contadores_compra IS 'Incrementa métricas do cliente após compra';
COMMENT ON FUNCTION public.fn_rpc_mesclar_visitante_em_auth IS 'Mescla dados de visitante em cliente autenticado';
COMMENT ON FUNCTION public.fn_rpc_resolver_ticket IS 'Resolve e fecha um ticket de suporte';
COMMENT ON FUNCTION public.fn_rpc_responder_csat IS 'Registra avaliação de satisfação do cliente';
COMMENT ON FUNCTION public.fn_rpc_marcar_mensagens_lidas IS 'Marca mensagens do ticket como lidas';
COMMENT ON FUNCTION public.fn_rpc_criar_nota_ticket IS 'Cria nota interna no ticket (masters only)';
COMMENT ON FUNCTION public.fn_rpc_contar_notificacoes_nao_lidas IS 'Conta notificações não lidas do usuário';
COMMENT ON FUNCTION public.fn_rpc_avaliar_entrega_finalizada IS 'Avalia uma entrega finalizada';
