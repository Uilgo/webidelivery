/**
 * RPC Types — Módulo Marketing
 *
 * Tipos de entrada para as funções RPC de CUD:
 * banners, cupons
 */

// =============================================
// RPCs de Banner
// =============================================

/** Parâmetros para rpc_criar_banner */
export interface RpcCriarBannerParams {
	loja_id: string;
	titulo?: string;
	imagem_url_light: string;
	imagem_url_dark?: string;
	link_tipo?: string;
	link_id?: string;
	link_url?: string;
	ordem?: number;
	inicio?: string;
	fim?: string;
}

/** Parâmetros para rpc_atualizar_banner */
export interface RpcAtualizarBannerParams {
	banner_id: string;
	titulo?: string;
	imagem_url_light?: string;
	imagem_url_dark?: string;
	link_tipo?: string;
	link_id?: string | null;
	link_url?: string | null;
	inicio?: string | null;
	fim?: string | null;
	ativo?: boolean;
}

/** Parâmetros para rpc_reordenar_banners */
export interface RpcReordenarBannersParams {
	loja_id: string;
	ordens: Array<{ id: string; ordem: number }>;
}

/** Parâmetros para rpc_soft_delete_banner */
export interface RpcSoftDeleteBannerParams {
	banner_id: string;
}

// =============================================
// RPCs de Cupom
// =============================================

/** Parâmetros para rpc_criar_cupom */
export interface RpcCriarCupomParams {
	loja_id: string;
	codigo: string;
	tipo: string; // 'percentual', 'valor_fixo', 'frete_gratis'
	valor?: number; // null para frete_gratis
	valor_minimo?: number;
	limite_total?: number;
	limite_por_cliente?: number;
	inicio?: string;
	fim?: string;
}

/** Parâmetros para rpc_atualizar_cupom */
export interface RpcAtualizarCupomParams {
	cupom_id: string;
	codigo?: string;
	tipo?: string;
	valor?: number | null;
	valor_minimo?: number | null;
	limite_total?: number | null;
	limite_por_cliente?: number | null;
	inicio?: string | null;
	fim?: string | null;
	ativo?: boolean;
}

/** Parâmetros para rpc_soft_delete_cupom */
export interface RpcSoftDeleteCupomParams {
	cupom_id: string;
}

/** Parâmetros para rpc_validar_cupom (leitura com lógica — via RPC) */
export interface RpcValidarCupomParams {
	loja_id: string;
	codigo: string;
	valor_pedido: number;
	cliente_id?: string;
}

/** Retorno da validação de cupom */
export interface RpcValidarCupomRetorno {
	valido: boolean;
	cupom_id?: string;
	tipo?: string;
	valor_desconto?: number;
	mensagem_erro?: string;
}
