```typescript
/**
 * Row Types — Módulo Catálogo
 *
 * Tipos de leitura (SELECT) para as tabelas:
 * categorias, produtos, produto_variacoes,
 * grupos_adicionais, adicionais, produto_grupos_adicionais
 */

// =============================================
// TABELA: categorias
// =============================================

export interface Categoria {
	id: string;
	loja_id: string;
	nome: string;
	descricao: string | null;
	grupo: string | null; // agrupamento visual (ex: 'Pizzas', 'Bebidas')
	imagem_url: string | null;
	ordem: number;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: produtos
// =============================================

export interface ProdutoConfig {
	tipo_produto?: string; // 'simples', 'pizza', 'bebida', etc
	aceita_sabores?: boolean; // se aceita meios (ex: pizza meio a meio)
	max_sabores?: number; // qtd máxima de sabores
	unidade?: string; // 'un', 'kg', 'ml'
}

export interface Produto {
	id: string;
	loja_id: string;
	categoria_id: string;
	nome: string;
	descricao: string | null;
	imagem_url_light: string | null;
	imagem_url_dark: string | null;
	config: ProdutoConfig;
	ordem: number;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: produto_variacoes
// =============================================

export interface ProdutoVariacao {
	id: string;
	produto_id: string;
	nome: string; // ex: 'Pequena', 'Média', 'Grande'
	preco: number;
	preco_promocional: number | null;
	ordem: number;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: grupos_adicionais (reutilizáveis por loja)
// =============================================

export interface GrupoAdicional {
	id: string;
	loja_id: string;
	nome: string;
	descricao: string | null;
	obrigatorio: boolean;
	min_selecao: number;
	max_selecao: number;
	ordem: number;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: adicionais (itens dentro de um grupo)
// =============================================

export interface Adicional {
	id: string;
	grupo_adicional_id: string;
	nome: string;
	preco: number; // pode ser 0 (ex: molho grátis)
	max_unidades: number;
	ordem: number;
	ativo: boolean;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
}

// =============================================
// TABELA: produto_grupos_adicionais (junção N:N)
// =============================================

export interface ProdutoGrupoAdicional {
	id: string;
	produto_id: string;
	grupo_adicional_id: string;
	ordem: number;
	created_at: string;
}
```
