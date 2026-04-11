/**
 * ==============================================================================
 * CUSTOM SUPABASE DATABASE TYPE (GLOBAL WRAPPER)
 * ==============================================================================
 *
 * Mapeamento arquitetural personalizado global.
 * Como nossa aplicação utiliza RLS estrito (Somente Leituras) e concentra
 * todas as operações CUD unicamente nas funções RPC (SECURITY DEFINER),
 * as operações de Insert e Update na raiz das tabelas estão bloqueadas
 * estruturalmente usando o tipo 'never' no TypeScript.
 *
 * Uso no Nuxt:
 * const supabase = useSupabaseClient<Database>()
 */

import type * as RowTypes from "./database/index";
import type * as RpcTypes from "./rpc/index";

export interface Database {
	public: {
		Tables: {
			// -------------------------------------------------------------
			// CORE
			// -------------------------------------------------------------
			roles: { Row: RowTypes.Role; Insert: never; Update: never };
			perfis: { Row: RowTypes.Perfil; Insert: never; Update: never };
			empresas: { Row: RowTypes.Empresa; Insert: never; Update: never };
			lojas: { Row: RowTypes.Loja; Insert: never; Update: never };

			// -------------------------------------------------------------
			// ASSINATURAS
			// -------------------------------------------------------------
			planos: { Row: RowTypes.Plano; Insert: never; Update: never };
			assinaturas: { Row: RowTypes.Assinatura; Insert: never; Update: never };
			faturas: { Row: RowTypes.Fatura; Insert: never; Update: never };
			gateway_eventos: { Row: RowTypes.GatewayEvento; Insert: never; Update: never };

			// -------------------------------------------------------------
			// CATÁLOGO
			// -------------------------------------------------------------
			categorias: { Row: RowTypes.Categoria; Insert: never; Update: never };
			produtos: { Row: RowTypes.Produto; Insert: never; Update: never };
			produto_variacoes: { Row: RowTypes.ProdutoVariacao; Insert: never; Update: never };
			grupos_adicionais: { Row: RowTypes.GrupoAdicional; Insert: never; Update: never };
			adicionais: { Row: RowTypes.Adicional; Insert: never; Update: never };
			produto_grupos_adicionais: {
				Row: RowTypes.ProdutoGrupoAdicional;
				Insert: never;
				Update: never;
			};
			combos: { Row: RowTypes.Combo; Insert: never; Update: never };
			combo_grupos: { Row: RowTypes.ComboGrupo; Insert: never; Update: never };
			combo_grupo_opcoes: { Row: RowTypes.ComboGrupoOpcao; Insert: never; Update: never };
			promocoes: { Row: RowTypes.Promocao; Insert: never; Update: never };

			// -------------------------------------------------------------
			// MARKETING
			// -------------------------------------------------------------
			banners: { Row: RowTypes.Banner; Insert: never; Update: never };
			cupons: { Row: RowTypes.Cupom; Insert: never; Update: never };

			// -------------------------------------------------------------
			// PEDIDOS
			// -------------------------------------------------------------
			clientes: { Row: RowTypes.Cliente; Insert: never; Update: never };
			pedidos: { Row: RowTypes.Pedido; Insert: never; Update: never };
			pedido_historico: { Row: RowTypes.PedidoHistorico; Insert: never; Update: never };
			pedido_avaliacoes: { Row: RowTypes.PedidoAvaliacao; Insert: never; Update: never };

			// -------------------------------------------------------------
			// LÓGISTICA
			// -------------------------------------------------------------
			entregadores: { Row: RowTypes.Entregador; Insert: never; Update: never };
			entregador_acertos: { Row: RowTypes.EntregadorAcerto; Insert: never; Update: never };

			// -------------------------------------------------------------
			// SUPORTE
			// -------------------------------------------------------------
			tickets: { Row: RowTypes.Ticket; Insert: never; Update: never };
			ticket_mensagens: { Row: RowTypes.TicketMensagem; Insert: never; Update: never };
			ticket_notas: { Row: RowTypes.TicketNota; Insert: never; Update: never };

			// -------------------------------------------------------------
			// NOTIFICAÇÕES & AUDITORIA & LGPD
			// -------------------------------------------------------------
			notificacoes: { Row: RowTypes.Notificacao; Insert: never; Update: never };
			audit_logs: { Row: RowTypes.AuditLog; Insert: never; Update: never };
			logs_lojas: { Row: RowTypes.LogLoja; Insert: never; Update: never };
			lgpd_consentimentos: { Row: RowTypes.LGPDConsentimento; Insert: never; Update: never };
			lgpd_solicitacoes_exclusao: {
				Row: RowTypes.LGPDSolicitacaoExclusao;
				Insert: never;
				Update: never;
			};
			impersonation_solicitacoes: {
				Row: RowTypes.ImpersonationSolicitacao;
				Insert: never;
				Update: never;
			};
		};

		Views: {
			vw_master_empresas: { Row: RowTypes.VwMasterEmpresas };
			vw_loja_dashboard_kpis: { Row: RowTypes.VwLojaDashboardKpis };
			vw_fechamento_caixa_motoboys: { Row: RowTypes.VwFechamentoCaixaMotoboys };
			vw_extracao_produtos_vendidos: { Row: RowTypes.VwExtracaoProdutosVendidos };
			vw_master_kpi_assinaturas: { Row: RowTypes.VwMasterKpiAssinaturas };
		};

		Functions: {
			// -- CORE -------------------------------------------------------------
			rpc_criar_perfil: { Args: RpcTypes.RpcCriarPerfilParams; Returns: string };
			rpc_atualizar_perfil: { Args: RpcTypes.RpcAtualizarPerfilParams; Returns: undefined };
			rpc_desativar_perfil: { Args: RpcTypes.RpcDesativarPerfilParams; Returns: undefined };
			rpc_criar_empresa: { Args: RpcTypes.RpcCriarEmpresaParams; Returns: string };
			rpc_atualizar_empresa: { Args: RpcTypes.RpcAtualizarEmpresaParams; Returns: undefined };
			rpc_suspender_empresa: { Args: RpcTypes.RpcSuspenderEmpresaParams; Returns: undefined };
			rpc_criar_loja: { Args: RpcTypes.RpcCriarLojaParams; Returns: string };
			rpc_atualizar_loja: { Args: RpcTypes.RpcAtualizarLojaParams; Returns: undefined };
			rpc_atualizar_config_operacao_loja: {
				Args: RpcTypes.RpcAtualizarConfigOperacaoLojaParams;
				Returns: undefined;
			};
			rpc_atualizar_config_tema_loja: {
				Args: RpcTypes.RpcAtualizarConfigTemaLojaParams;
				Returns: undefined;
			};
			rpc_atualizar_config_pagamentos_loja: {
				Args: RpcTypes.RpcAtualizarConfigPagamentosLojaParams;
				Returns: undefined;
			};
			rpc_atualizar_config_entrega_loja: {
				Args: RpcTypes.RpcAtualizarConfigEntregaLojaParams;
				Returns: undefined;
			};

			// -- ASSINATURAS ------------------------------------------------------
			rpc_criar_plano: { Args: RpcTypes.RpcCriarPlanoParams; Returns: string };
			rpc_atualizar_plano: { Args: RpcTypes.RpcAtualizarPlanoParams; Returns: undefined };
			rpc_criar_assinatura: { Args: RpcTypes.RpcCriarAssinaturaParams; Returns: string };
			rpc_atualizar_assinatura: { Args: RpcTypes.RpcAtualizarAssinaturaParams; Returns: undefined };
			rpc_registrar_fatura: { Args: RpcTypes.RpcRegistrarFaturaParams; Returns: string };
			rpc_confirmar_pagamento_fatura: {
				Args: RpcTypes.RpcConfirmarPagamentoFaturaParams;
				Returns: undefined;
			};
			rpc_processar_webhook_gateway: {
				Args: RpcTypes.RpcProcessarWebhookGatewayParams;
				Returns: string;
			};

			// -- CATÁLOGO ---------------------------------------------------------
			rpc_criar_categoria: { Args: RpcTypes.RpcCriarCategoriaParams; Returns: string };
			rpc_atualizar_categoria: { Args: RpcTypes.RpcAtualizarCategoriaParams; Returns: undefined };
			rpc_reordenar_categorias: { Args: RpcTypes.RpcReordenarCategoriasParams; Returns: undefined };
			rpc_soft_delete_categoria: {
				Args: RpcTypes.RpcSoftDeleteCategoriaParams;
				Returns: undefined;
			};
			rpc_criar_produto: { Args: RpcTypes.RpcCriarProdutoParams; Returns: string };
			rpc_atualizar_produto: { Args: RpcTypes.RpcAtualizarProdutoParams; Returns: undefined };
			rpc_soft_delete_produto: { Args: RpcTypes.RpcSoftDeleteProdutoParams; Returns: undefined };
			rpc_criar_variacao: { Args: RpcTypes.RpcCriarVariacaoParams; Returns: string };
			rpc_atualizar_variacao: { Args: RpcTypes.RpcAtualizarVariacaoParams; Returns: undefined };
			rpc_soft_delete_variacao: { Args: RpcTypes.RpcSoftDeleteVariacaoParams; Returns: undefined };
			rpc_criar_grupo_adicional: { Args: RpcTypes.RpcCriarGrupoAdicionalParams; Returns: string };
			rpc_atualizar_grupo_adicional: {
				Args: RpcTypes.RpcAtualizarGrupoAdicionalParams;
				Returns: undefined;
			};
			rpc_criar_adicional: { Args: RpcTypes.RpcCriarAdicionalParams; Returns: string };
			rpc_atualizar_adicional: { Args: RpcTypes.RpcAtualizarAdicionalParams; Returns: undefined };
			rpc_vincular_grupo_produto: { Args: RpcTypes.RpcVincularGrupoProdutoParams; Returns: string };
			rpc_desvincular_grupo_produto: {
				Args: RpcTypes.RpcDesvincularGrupoProdutoParams;
				Returns: undefined;
			};

			// -- COMBOS E PROMOÇÕES -----------------------------------------------
			rpc_criar_combo: { Args: RpcTypes.RpcCriarComboParams; Returns: string };
			rpc_atualizar_combo: { Args: RpcTypes.RpcAtualizarComboParams; Returns: undefined };
			rpc_soft_delete_combo: { Args: RpcTypes.RpcSoftDeleteComboParams; Returns: undefined };
			rpc_criar_combo_grupo: { Args: RpcTypes.RpcCriarComboGrupoParams; Returns: string };
			rpc_criar_combo_grupo_opcao: {
				Args: RpcTypes.RpcCriarComboGrupoOpcaoParams;
				Returns: string;
			};
			rpc_criar_promocao: { Args: RpcTypes.RpcCriarPromocaoParams; Returns: string };
			rpc_soft_delete_promocao: { Args: RpcTypes.RpcSoftDeletePromocaoParams; Returns: undefined };

			// -- MARKETING --------------------------------------------------------
			rpc_criar_banner: { Args: RpcTypes.RpcCriarBannerParams; Returns: string };
			rpc_atualizar_banner: { Args: RpcTypes.RpcAtualizarBannerParams; Returns: undefined };
			rpc_reordenar_banners: { Args: RpcTypes.RpcReordenarBannersParams; Returns: undefined };
			rpc_soft_delete_banner: { Args: RpcTypes.RpcSoftDeleteBannerParams; Returns: undefined };
			rpc_criar_cupom: { Args: RpcTypes.RpcCriarCupomParams; Returns: string };
			rpc_atualizar_cupom: { Args: RpcTypes.RpcAtualizarCupomParams; Returns: undefined };
			rpc_soft_delete_cupom: { Args: RpcTypes.RpcSoftDeleteCupomParams; Returns: undefined };
			rpc_validar_cupom: {
				Args: RpcTypes.RpcValidarCupomParams;
				Returns: RpcTypes.RpcValidarCupomRetorno;
			}; // Exceção de Leitura

			// -- PEDIDOS ----------------------------------------------------------
			rpc_criar_cliente: { Args: RpcTypes.RpcCriarClienteParams; Returns: string };
			rpc_atualizar_cliente: { Args: RpcTypes.RpcAtualizarClienteParams; Returns: undefined };
			rpc_criar_pedido: { Args: RpcTypes.RpcCriarPedidoParams; Returns: string };
			rpc_atualizar_status_pedido: {
				Args: RpcTypes.RpcAtualizarStatusPedidoParams;
				Returns: undefined;
			};
			rpc_atribuir_entregador: { Args: RpcTypes.RpcAtribuirEntregadorParams; Returns: undefined };
			rpc_criar_avaliacao: { Args: RpcTypes.RpcCriarAvaliacaoParams; Returns: undefined };

			// -- LOGÍSTICA --------------------------------------------------------
			rpc_criar_entregador: { Args: RpcTypes.RpcCriarEntregadorParams; Returns: string };
			rpc_atualizar_entregador: { Args: RpcTypes.RpcAtualizarEntregadorParams; Returns: undefined };
			rpc_atualizar_status_entregador: {
				Args: RpcTypes.RpcAtualizarStatusEntregadorParams;
				Returns: undefined;
			};
			rpc_registrar_acerto: { Args: RpcTypes.RpcRegistrarAcertoParams; Returns: string };

			// -- SUPORTE ----------------------------------------------------------
			rpc_criar_ticket: { Args: RpcTypes.RpcCriarTicketParams; Returns: string };
			rpc_atualizar_ticket: { Args: RpcTypes.RpcAtualizarTicketParams; Returns: undefined };
			rpc_atribuir_ticket: { Args: RpcTypes.RpcAtribuirTicketParams; Returns: undefined };
			rpc_enviar_mensagem_ticket: { Args: RpcTypes.RpcEnviarMensagemTicketParams; Returns: string };
			rpc_criar_nota_ticket: { Args: RpcTypes.RpcCriarNotaTicketParams; Returns: undefined };
			rpc_responder_csat: { Args: RpcTypes.RpcResponderCsatParams; Returns: undefined };

			// -- NOTIFICAÇÕES -----------------------------------------------------
			rpc_criar_notificacao: { Args: RpcTypes.RpcCriarNotificacaoParams; Returns: string };
			rpc_marcar_notificacao_lida: {
				Args: RpcTypes.RpcMarcarNotificacaoLidaParams;
				Returns: undefined;
			};
			rpc_marcar_todas_lidas: { Args: RpcTypes.RpcMarcarTodasLidasParams; Returns: undefined };
			rpc_deletar_notificacao: { Args: RpcTypes.RpcDeletarNotificacaoParams; Returns: undefined };

			// -- AUDITORIA & LGPD -------------------------------------------------
			rpc_registrar_audit_log: { Args: RpcTypes.RpcRegistrarAuditLogParams; Returns: undefined };
			rpc_registrar_log_loja: { Args: RpcTypes.RpcRegistrarLogLojaParams; Returns: undefined };
			rpc_registrar_consentimento: {
				Args: RpcTypes.RpcRegistrarConsentimentoParams;
				Returns: string;
			};
			rpc_solicitar_exclusao_dados: {
				Args: RpcTypes.RpcSolicitarExclusaoDadosParams;
				Returns: string;
			};
			rpc_processar_exclusao: { Args: RpcTypes.RpcProcessarExclusaoParams; Returns: undefined };
			rpc_solicitar_impersonation: {
				Args: RpcTypes.RpcSolicitarImpersonationParams;
				Returns: string;
			};
			rpc_responder_impersonation: {
				Args: RpcTypes.RpcResponderImpersonationParams;
				Returns: undefined;
			};
		};
	};
}
