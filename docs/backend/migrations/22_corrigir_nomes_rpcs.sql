/*
  # 22 - Correção: Renomear RPCs de rpc_* para fn_rpc_*
  
  Renomeia todas as 66 RPCs existentes para seguir o padrão da documentação.
  Usa ALTER FUNCTION RENAME TO (operação atômica e segura).
  Execute ANTES da migration 21.
*/

-- [ CORE - Perfis, Empresas, Lojas ] ------------------------------------------

ALTER FUNCTION public.rpc_criar_perfil RENAME TO fn_rpc_criar_perfil;
ALTER FUNCTION public.rpc_atualizar_perfil RENAME TO fn_rpc_atualizar_perfil;
ALTER FUNCTION public.rpc_desativar_perfil RENAME TO fn_rpc_desativar_perfil;

ALTER FUNCTION public.rpc_criar_empresa RENAME TO fn_rpc_criar_empresa;
ALTER FUNCTION public.rpc_atualizar_empresa RENAME TO fn_rpc_atualizar_empresa;
ALTER FUNCTION public.rpc_suspender_empresa RENAME TO fn_rpc_suspender_empresa;

ALTER FUNCTION public.rpc_criar_loja RENAME TO fn_rpc_criar_loja;
ALTER FUNCTION public.rpc_atualizar_loja RENAME TO fn_rpc_atualizar_loja;
ALTER FUNCTION public.rpc_atualizar_config_geral_loja RENAME TO fn_rpc_atualizar_config_geral_loja;
ALTER FUNCTION public.rpc_atualizar_config_tema_loja RENAME TO fn_rpc_atualizar_config_tema_loja;
ALTER FUNCTION public.rpc_atualizar_setup_status_loja RENAME TO fn_rpc_atualizar_setup_status_loja;

-- [ ASSINATURAS ] --------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_plano RENAME TO fn_rpc_criar_plano;
ALTER FUNCTION public.rpc_atualizar_plano RENAME TO fn_rpc_atualizar_plano;
ALTER FUNCTION public.rpc_criar_assinatura RENAME TO fn_rpc_criar_assinatura;
ALTER FUNCTION public.rpc_atualizar_assinatura RENAME TO fn_rpc_atualizar_assinatura;
ALTER FUNCTION public.rpc_registrar_fatura RENAME TO fn_rpc_registrar_fatura;
ALTER FUNCTION public.rpc_confirmar_pagamento_fatura RENAME TO fn_rpc_confirmar_pagamento_fatura;
ALTER FUNCTION public.rpc_processar_webhook_gateway RENAME TO fn_rpc_processar_webhook_gateway;

-- [ CATÁLOGO ] -----------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_categoria RENAME TO fn_rpc_criar_categoria;
ALTER FUNCTION public.rpc_atualizar_categoria RENAME TO fn_rpc_atualizar_categoria;
ALTER FUNCTION public.rpc_soft_delete_categoria RENAME TO fn_rpc_soft_delete_categoria;

ALTER FUNCTION public.rpc_criar_produto RENAME TO fn_rpc_criar_produto;
ALTER FUNCTION public.rpc_atualizar_produto RENAME TO fn_rpc_atualizar_produto;
ALTER FUNCTION public.rpc_soft_delete_produto RENAME TO fn_rpc_soft_delete_produto;

ALTER FUNCTION public.rpc_criar_variacao RENAME TO fn_rpc_criar_variacao;

ALTER FUNCTION public.rpc_criar_grupo_adicional RENAME TO fn_rpc_criar_grupo_adicional;
ALTER FUNCTION public.rpc_criar_adicional RENAME TO fn_rpc_criar_adicional;
ALTER FUNCTION public.rpc_vincular_grupo_produto RENAME TO fn_rpc_vincular_grupo_produto;
ALTER FUNCTION public.rpc_desvincular_grupo_produto RENAME TO fn_rpc_desvincular_grupo_produto;

-- [ COMBOS E PROMOÇÕES ] -------------------------------------------------------

ALTER FUNCTION public.rpc_criar_combo RENAME TO fn_rpc_criar_combo;
ALTER FUNCTION public.rpc_atualizar_combo RENAME TO fn_rpc_atualizar_combo;
ALTER FUNCTION public.rpc_soft_delete_combo RENAME TO fn_rpc_soft_delete_combo;
ALTER FUNCTION public.rpc_criar_combo_grupo RENAME TO fn_rpc_criar_combo_grupo;
ALTER FUNCTION public.rpc_criar_combo_grupo_opcao RENAME TO fn_rpc_criar_combo_grupo_opcao;

ALTER FUNCTION public.rpc_criar_promocao RENAME TO fn_rpc_criar_promocao;
ALTER FUNCTION public.rpc_soft_delete_promocao RENAME TO fn_rpc_soft_delete_promocao;

-- [ MARKETING ] ----------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_banner RENAME TO fn_rpc_criar_banner;
ALTER FUNCTION public.rpc_atualizar_banner RENAME TO fn_rpc_atualizar_banner;
ALTER FUNCTION public.rpc_soft_delete_banner RENAME TO fn_rpc_soft_delete_banner;

ALTER FUNCTION public.rpc_criar_cupom RENAME TO fn_rpc_criar_cupom;
ALTER FUNCTION public.rpc_soft_delete_cupom RENAME TO fn_rpc_soft_delete_cupom;
ALTER FUNCTION public.rpc_validar_cupom RENAME TO fn_rpc_validar_cupom;

-- [ PEDIDOS E CLIENTES ] -------------------------------------------------------

ALTER FUNCTION public.rpc_criar_cliente RENAME TO fn_rpc_criar_cliente;
ALTER FUNCTION public.rpc_atualizar_cliente RENAME TO fn_rpc_atualizar_cliente;

ALTER FUNCTION public.rpc_criar_pedido RENAME TO fn_rpc_criar_pedido;
ALTER FUNCTION public.rpc_atualizar_status_pedido RENAME TO fn_rpc_atualizar_status_pedido;
ALTER FUNCTION public.rpc_atribuir_entregador RENAME TO fn_rpc_atribuir_entregador;

ALTER FUNCTION public.rpc_criar_avaliacao RENAME TO fn_rpc_criar_avaliacao;

-- [ LOGÍSTICA ] ----------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_entregador RENAME TO fn_rpc_criar_entregador;
ALTER FUNCTION public.rpc_atualizar_entregador RENAME TO fn_rpc_atualizar_entregador;
ALTER FUNCTION public.rpc_atualizar_status_entregador RENAME TO fn_rpc_atualizar_status_entregador;
ALTER FUNCTION public.rpc_registrar_acerto RENAME TO fn_rpc_registrar_acerto;

-- [ SUPORTE ] ------------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_ticket RENAME TO fn_rpc_criar_ticket;
ALTER FUNCTION public.rpc_atualizar_ticket RENAME TO fn_rpc_atualizar_ticket;
ALTER FUNCTION public.rpc_atribuir_ticket RENAME TO fn_rpc_atribuir_ticket;
ALTER FUNCTION public.rpc_enviar_mensagem_ticket RENAME TO fn_rpc_enviar_mensagem_ticket;

-- [ NOTIFICAÇÕES ] -------------------------------------------------------------

ALTER FUNCTION public.rpc_criar_notificacao RENAME TO fn_rpc_criar_notificacao;
ALTER FUNCTION public.rpc_marcar_notificacao_lida RENAME TO fn_rpc_marcar_notificacao_lida;
ALTER FUNCTION public.rpc_marcar_todas_lidas RENAME TO fn_rpc_marcar_todas_lidas;

-- [ AUDITORIA ] ----------------------------------------------------------------

ALTER FUNCTION public.rpc_registrar_log_loja RENAME TO fn_rpc_registrar_log_loja;
ALTER FUNCTION public.rpc_registrar_audit_log RENAME TO fn_rpc_registrar_audit_log;
ALTER FUNCTION public.rpc_registrar_consentimento RENAME TO fn_rpc_registrar_consentimento;
ALTER FUNCTION public.rpc_solicitar_exclusao_dados RENAME TO fn_rpc_solicitar_exclusao_dados;
ALTER FUNCTION public.rpc_processar_exclusao RENAME TO fn_rpc_processar_exclusao;
ALTER FUNCTION public.rpc_solicitar_impersonation RENAME TO fn_rpc_solicitar_impersonation;
ALTER FUNCTION public.rpc_responder_impersonation RENAME TO fn_rpc_responder_impersonation;

-- ==============================================================================
-- VERIFICAÇÃO
-- ==============================================================================

-- Lista todas as funções renomeadas para confirmar
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'fn_rpc_%'
ORDER BY routine_name;

-- Deve retornar aproximadamente 66 funções (todas as existentes + as 18 novas da migration 21)
