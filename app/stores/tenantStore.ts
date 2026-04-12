/**
 * 📌 Store de Tenant
 *
 * Gerencia o contexto do tenant atual baseado no domínio/slug acessado.
 * Populado pelo middleware global `01.tenant.global.ts` antes de qualquer rota.
 *
 * Tipos de tenant:
 * - "loja"  → estabelecimento acessando /[slug]/* ou domínio próprio
 * - null    → painel master/plataforma (sem tenant específico)
 */

import type { LojaConfigTema } from "~~/shared/types/jsonb";

// Subconjunto dos dados da loja necessários para o contexto público
export interface TenantLoja {
	id: string;
	empresa_id: string;
	nome_estabelecimento: string;
	slug: string;
	logo_light_url: string | null;
	logo_dark_url: string | null;
	config_tema: LojaConfigTema | null;
}

export const useTenantStore = defineStore("tenant", () => {
	// ─── Estado ───────────────────────────────────────────────────────────────

	const tipo = ref<"loja" | null>(null);
	const loja = ref<TenantLoja | null>(null);
	const carregando = ref(false);

	// ─── Computed ─────────────────────────────────────────────────────────────

	const isLoja = computed(() => tipo.value === "loja");
	const isMaster = computed(() => tipo.value === null);

	const nome = computed(() => loja.value?.nome_estabelecimento ?? null);
	const tenantId = computed(() => loja.value?.id ?? null);
	const logoUrl = computed(() => loja.value?.logo_light_url ?? null);

	// ─── Actions ──────────────────────────────────────────────────────────────

	function setLoja(data: TenantLoja): void {
		tipo.value = "loja";
		loja.value = data;
	}

	function clearTenant(): void {
		tipo.value = null;
		loja.value = null;
		carregando.value = false;
	}

	/**
	 * Aplica variáveis CSS do tema da loja no :root.
	 * Chamado pelo middleware de tenant após setLoja().
	 */
	function aplicarTema(): void {
		if (import.meta.server) return;
		if (!loja.value?.config_tema) return;

		const tema = loja.value.config_tema;
		const root = document.documentElement;

		if (tema.cor_primaria) root.style.setProperty("--color-primary", tema.cor_primaria);
		if (tema.cor_secundaria) root.style.setProperty("--color-secondary", tema.cor_secundaria);
	}

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		// Estado
		tipo,
		loja,
		carregando,

		// Computed
		isLoja,
		isMaster,
		nome,
		tenantId,
		logoUrl,

		// Actions
		setLoja,
		clearTenant,
		aplicarTema,
	};
});
