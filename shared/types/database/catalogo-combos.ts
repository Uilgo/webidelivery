/**
 * Row Types — Módulo Catálogo Combos e Promoções
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * combos, combo_grupos, combo_grupo_opcoes, promocoes
 */

// =============================================
// TABELA: combos
// =============================================

export interface Combo {
	id: string;
	loja_id: string;
	nome: string;
	descricao: string | null;
	imagem_url_light: string | null;
	imagem_url_dark: string | null;
	preco: number; // preço fixo do combo
	inicio: string | null; // vigência
	fim: string | null;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: combo_grupos (grupos de escolha)
// =============================================

export interface ComboGrupo {
	id: string;
	combo_id: string;
	nome: string; // ex: 'Escolha sua bebida'
	descricao: string | null;
	obrigatorio: boolean;
	min_selecao: number;
	max_selecao: number;
	ordem: number;
	created_at: string;
}

// =============================================
// TABELA: combo_grupo_opcoes (opções dentro do grupo)
// =============================================

export interface ComboGrupoOpcao {
	id: string;
	grupo_id: string;
	produto_id: string;
	variacao_id: string | null; // null = cliente escolhe
	preco_extra: number; // acréscimo para opções premium
	ordem: number;
	ativo: boolean;
	created_at: string;
}

// =============================================
// TABELA: promocoes (promoções automáticas)
// =============================================

export interface Promocao {
	id: string;
	loja_id: string;
	entidade_tipo: string; // 'produto' | 'categoria'
	entidade_id: string; // ID polimórfico (sem FK)
	tipo: string; // 'percentual' | 'valor_fixo'
	valor: number; // porcentagem ou valor em reais
	inicio: string | null;
	fim: string | null;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}
