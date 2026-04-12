/**
 * 📌 Store do Carrinho de Compras
 *
 * Carrinho do cardápio público com persistência SSR-safe via cookie.
 *
 * PERSISTÊNCIA: useCookie() — lido no servidor e no cliente sem piscado.
 * ISOLAMENTO: vinculado a uma loja específica via loja_id.
 *             Ao trocar de loja, o carrinho é limpo automaticamente.
 *
 * REGRAS:
 * - Itens com adicionais têm quantidade fixa (requer reabrir o drawer para alterar)
 * - Itens sem adicionais podem ter quantidade alterada via +/-
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AdicionalSelecionado {
	id: string;
	nome: string;
	preco: number;
}

export interface ItemCarrinho {
	id: string;
	produto_id: string;
	nome: string;
	imagem_url: string | null;
	variacao: {
		id: string;
		nome: string;
		preco: number;
	};
	adicionais: AdicionalSelecionado[];
	observacao: string;
	quantidade: number;
	preco_unitario: number;
	preco_total: number;
}

interface EstadoCarrinhoCookie {
	loja_id: string | null;
	loja_slug: string | null;
	itens: ItemCarrinho[];
}

export interface AdicionarItemPayload {
	produto_id: string;
	nome: string;
	imagem_url: string | null;
	variacao: { id: string; nome: string; preco: number };
	adicionais: AdicionalSelecionado[];
	observacao: string;
	quantidade: number;
	preco_unitario: number;
	preco_total: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCarrinhoStore = defineStore("carrinho", () => {
	/**
	 * Cookie SSR-safe — lido no servidor e no cliente sem piscado.
	 * maxAge: 24h | sameSite: lax | path: / (disponível em todas as rotas)
	 */
	const cookie = useCookie<EstadoCarrinhoCookie>("wbd_carrinho", {
		maxAge: 60 * 60 * 24,
		sameSite: "lax",
		path: "/",
		default: () => ({ loja_id: null, loja_slug: null, itens: [] }),
	});

	// ─── Getters ──────────────────────────────────────────────────────────────

	const itens = computed(() => cookie.value.itens);
	const lojaId = computed(() => cookie.value.loja_id);
	const lojaSlug = computed(() => cookie.value.loja_slug);
	const estaVazio = computed(() => cookie.value.itens.length === 0);

	const quantidadeTotal = computed(() =>
		cookie.value.itens.reduce((acc, item) => acc + item.quantidade, 0),
	);

	const subtotal = computed(() =>
		cookie.value.itens.reduce((acc, item) => acc + item.preco_total, 0),
	);

	const taxaEntrega = ref(0);
	const total = computed(() => subtotal.value + taxaEntrega.value);

	// ─── Helpers ──────────────────────────────────────────────────────────────

	const gerarId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

	const atualizar = (novoEstado: Partial<EstadoCarrinhoCookie>) => {
		cookie.value = { ...cookie.value, ...novoEstado };
	};

	// ─── Actions ──────────────────────────────────────────────────────────────

	/**
	 * Define a loja do carrinho.
	 * Se a loja mudar, limpa o carrinho automaticamente.
	 */
	function setLoja(id: string, slug: string): void {
		if (cookie.value.loja_id && cookie.value.loja_id !== id) {
			atualizar({ loja_id: id, loja_slug: slug, itens: [] });
		} else {
			atualizar({ loja_id: id, loja_slug: slug });
		}
	}

	/**
	 * Adiciona item ao carrinho.
	 * Itens com mesma variação e sem adicionais são agrupados (quantidade++).
	 */
	function adicionarItem(payload: AdicionarItemPayload): void {
		const itensAtuais = [...cookie.value.itens];

		// Tenta agrupar se não tem adicionais e mesma variação
		if (payload.adicionais.length === 0) {
			const existente = itensAtuais.find(
				(i) =>
					i.produto_id === payload.produto_id &&
					i.variacao.id === payload.variacao.id &&
					i.adicionais.length === 0 &&
					i.observacao === payload.observacao,
			);

			if (existente) {
				existente.quantidade += payload.quantidade;
				existente.preco_total = existente.preco_unitario * existente.quantidade;
				atualizar({ itens: itensAtuais });
				return;
			}
		}

		const novoItem: ItemCarrinho = {
			id: gerarId(),
			...payload,
		};

		atualizar({ itens: [...itensAtuais, novoItem] });
	}

	function removerItem(itemId: string): void {
		atualizar({ itens: cookie.value.itens.filter((i) => i.id !== itemId) });
	}

	/** Incrementa quantidade (apenas itens sem adicionais) */
	function incrementar(itemId: string): void {
		const itensAtuais = cookie.value.itens.map((i) => {
			if (i.id !== itemId || i.adicionais.length > 0) return i;
			const novaQtd = i.quantidade + 1;
			return { ...i, quantidade: novaQtd, preco_total: i.preco_unitario * novaQtd };
		});
		atualizar({ itens: itensAtuais });
	}

	/** Decrementa quantidade (mínimo 1, apenas itens sem adicionais) */
	function decrementar(itemId: string): void {
		const itensAtuais = cookie.value.itens.map((i) => {
			if (i.id !== itemId || i.adicionais.length > 0 || i.quantidade <= 1) return i;
			const novaQtd = i.quantidade - 1;
			return { ...i, quantidade: novaQtd, preco_total: i.preco_unitario * novaQtd };
		});
		atualizar({ itens: itensAtuais });
	}

	function setTaxaEntrega(taxa: number): void {
		taxaEntrega.value = taxa;
	}

	function limpar(): void {
		atualizar({ loja_id: null, loja_slug: null, itens: [] });
		taxaEntrega.value = 0;
	}

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		// Estado
		itens,
		lojaId,
		lojaSlug,
		estaVazio,
		quantidadeTotal,
		subtotal,
		taxaEntrega,
		total,

		// Actions
		setLoja,
		adicionarItem,
		removerItem,
		incrementar,
		decrementar,
		setTaxaEntrega,
		limpar,
	};
});
