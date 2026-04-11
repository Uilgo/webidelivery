/**
 * RPC Types — Módulo Catálogo
 *
 * Tipos de entrada para as funções RPC de CUD:
 * categorias, produtos, variações, grupos adicionais,
 * adicionais, combos, promoções
 */

import type { ProdutoConfig } from "../database/catalogo";

// =============================================
// RPCs de Categoria
// =============================================

/** Parâmetros para rpc_criar_categoria */
export interface RpcCriarCategoriaParams {
	loja_id: string;
	nome: string;
	descricao?: string;
	grupo?: string;
	imagem_url?: string;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_categoria */
export interface RpcAtualizarCategoriaParams {
	categoria_id: string;
	nome?: string;
	descricao?: string;
	grupo?: string;
	imagem_url?: string;
	ativo?: boolean;
}

/** Parâmetros para rpc_reordenar_categorias */
export interface RpcReordenarCategoriasParams {
	loja_id: string;
	ordens: Array<{ id: string; ordem: number }>;
}

/** Parâmetros para rpc_soft_delete_categoria */
export interface RpcSoftDeleteCategoriaParams {
	categoria_id: string;
}

// =============================================
// RPCs de Produto
// =============================================

/** Parâmetros para rpc_criar_produto */
export interface RpcCriarProdutoParams {
	loja_id: string;
	categoria_id: string;
	nome: string;
	descricao?: string;
	imagem_url_light?: string;
	imagem_url_dark?: string;
	config?: ProdutoConfig;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_produto */
export interface RpcAtualizarProdutoParams {
	produto_id: string;
	categoria_id?: string;
	nome?: string;
	descricao?: string;
	imagem_url_light?: string;
	imagem_url_dark?: string;
	config?: Partial<ProdutoConfig>;
	ativo?: boolean;
}

/** Parâmetros para rpc_soft_delete_produto */
export interface RpcSoftDeleteProdutoParams {
	produto_id: string;
}

// =============================================
// RPCs de Variação de Produto
// =============================================

/** Parâmetros para rpc_criar_variacao */
export interface RpcCriarVariacaoParams {
	produto_id: string;
	nome: string;
	preco: number;
	preco_promocional?: number;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_variacao */
export interface RpcAtualizarVariacaoParams {
	variacao_id: string;
	nome?: string;
	preco?: number;
	preco_promocional?: number | null; // null para remover
	ativo?: boolean;
}

/** Parâmetros para rpc_soft_delete_variacao */
export interface RpcSoftDeleteVariacaoParams {
	variacao_id: string;
}

// =============================================
// RPCs de Grupo Adicional
// =============================================

/** Parâmetros para rpc_criar_grupo_adicional */
export interface RpcCriarGrupoAdicionalParams {
	loja_id: string;
	nome: string;
	descricao?: string;
	obrigatorio?: boolean;
	min_selecao?: number;
	max_selecao?: number;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_grupo_adicional */
export interface RpcAtualizarGrupoAdicionalParams {
	grupo_adicional_id: string;
	nome?: string;
	descricao?: string;
	obrigatorio?: boolean;
	min_selecao?: number;
	max_selecao?: number;
	ativo?: boolean;
}

// =============================================
// RPCs de Adicional
// =============================================

/** Parâmetros para rpc_criar_adicional */
export interface RpcCriarAdicionalParams {
	grupo_adicional_id: string;
	nome: string;
	preco: number;
	max_unidades?: number;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_adicional */
export interface RpcAtualizarAdicionalParams {
	adicional_id: string;
	nome?: string;
	preco?: number;
	max_unidades?: number;
	ativo?: boolean;
}

// =============================================
// RPCs de Junção Produto ↔ Grupo Adicional
// =============================================

/** Parâmetros para rpc_vincular_grupo_produto */
export interface RpcVincularGrupoProdutoParams {
	produto_id: string;
	grupo_adicional_id: string;
	ordem?: number;
}

/** Parâmetros para rpc_desvincular_grupo_produto */
export interface RpcDesvincularGrupoProdutoParams {
	produto_id: string;
	grupo_adicional_id: string;
}

// =============================================
// RPCs de Combo
// =============================================

/** Parâmetros para rpc_criar_combo */
export interface RpcCriarComboParams {
	loja_id: string;
	nome: string;
	preco: number;
	descricao?: string;
	imagem_url_light?: string;
	imagem_url_dark?: string;
	inicio?: string;
	fim?: string;
}

/** Subparâmetro: grupo dentro do combo */
export interface RpcCriarComboGrupoParams {
	nome: string;
	descricao?: string;
	obrigatorio?: boolean;
	min_selecao?: number;
	max_selecao?: number;
	ordem?: number;
	opcoes?: RpcCriarComboGrupoOpcaoParams[];
}

/** Subparâmetro: opção dentro do grupo */
export interface RpcCriarComboGrupoOpcaoParams {
	produto_id: string;
	variacao_id?: string;
	preco_extra?: number;
	ordem?: number;
}

/** Parâmetros para rpc_atualizar_combo */
export interface RpcAtualizarComboParams {
	combo_id: string;
	nome?: string;
	descricao?: string;
	imagem_url_light?: string;
	imagem_url_dark?: string;
	preco?: number;
	inicio?: string;
	fim?: string;
	ativo?: boolean;
}

/** Parâmetros para rpc_soft_delete_combo */
export interface RpcSoftDeleteComboParams {
	combo_id: string;
}

// =============================================
// RPCs de Promoção
// =============================================

/** Parâmetros para rpc_criar_promocao */
export interface RpcCriarPromocaoParams {
	loja_id: string;
	entidade_tipo: string; // 'produto' | 'categoria'
	entidade_id: string;
	tipo: string; // 'percentual' | 'valor_fixo'
	valor: number;
	inicio?: string;
	fim?: string;
}

/** Parâmetros para rpc_atualizar_promocao */
export interface RpcAtualizarPromocaoParams {
	promocao_id: string;
	tipo?: string;
	valor?: number;
	inicio?: string;
	fim?: string;
	ativo?: boolean;
}

/** Parâmetros para rpc_soft_delete_promocao */
export interface RpcSoftDeletePromocaoParams {
	promocao_id: string;
}
