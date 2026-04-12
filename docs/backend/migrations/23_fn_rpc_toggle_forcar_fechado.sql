/*
  # 23 - RPC: fn_rpc_toggle_forcar_fechado

  Alterna o campo forcar_fechado da loja (toggle aberto/fechado do header).
  Documentada em docs/backend/database/core/04-lojas.md mas ausente nas migrations anteriores.
*/

/**
 * fn_rpc_toggle_forcar_fechado
 * Alterna o campo forcar_fechado da loja (toggle aberto/fechado do header).
 * Quando forcar_fechado = true → loja fechada imediatamente, independente do horário.
 * Quando forcar_fechado = false → loja segue horario_funcionamento.
 * O campo `aberto` é recalculado automaticamente pelo sistema.
 * Acesso: admin_loja, gerente_loja
 */
CREATE OR REPLACE FUNCTION public.fn_rpc_toggle_forcar_fechado(
  p_loja_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_forcar_fechado_atual boolean;
  v_novo_forcar_fechado boolean;
  v_cargo text;
BEGIN
  -- Valida cargo do usuário autenticado
  SELECT r.slug INTO v_cargo
  FROM public.perfis p
  INNER JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  IF v_cargo NOT IN ('admin_loja', 'gerente_loja', 'admin_master', 'gerente_master') THEN
    RAISE EXCEPTION 'Sem permissão para alterar status da loja';
  END IF;

  -- Lê estado atual
  SELECT forcar_fechado INTO v_forcar_fechado_atual
  FROM public.lojas WHERE id = p_loja_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loja não encontrada';
  END IF;

  v_novo_forcar_fechado := NOT v_forcar_fechado_atual;

  UPDATE public.lojas
  SET
    forcar_fechado = v_novo_forcar_fechado,
    -- forcar_fechado = true  → fecha imediatamente (aberto = false)
    -- forcar_fechado = false → abre imediatamente (aberto = true)
    aberto = NOT v_novo_forcar_fechado,
    updated_at = now()
  WHERE id = p_loja_id;

  RETURN jsonb_build_object(
    'forcar_fechado', v_novo_forcar_fechado,
    'aberto', NOT v_novo_forcar_fechado
  );
END;
$$;
