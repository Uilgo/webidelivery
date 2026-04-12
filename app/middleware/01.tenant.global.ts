/**
 * 01.tenant.global.ts — Middleware de resolução de tenant
 *
 * Extrai o slug da URL e popula o tenantStore com os dados da loja.
 * Executado antes de qualquer rota — necessário para o cardápio público
 * e para aplicar o tema dinâmico da loja.
 *
 * Rotas com slug: /{slug}/* → resolve a loja pelo slug
 * Demais rotas: limpa o tenant (painel admin/plataforma não tem tenant)
 */

import { useTenantStore } from "~/stores/tenantStore";
import type { TenantLoja } from "~/stores/tenantStore";
import type { Loja } from "~~/shared/types/database/core";
import type { LojaConfigTema } from "~~/shared/types/jsonb";

export default defineNuxtRouteMiddleware(async (to) => {
	const tenantStore = useTenantStore();

	// Extrai o slug da rota (parâmetro dinâmico [slug])
	const slug = to.params.slug as string | undefined;

	// Rotas sem slug (admin, plataforma, auth) — limpa o tenant
	if (!slug) {
		tenantStore.clearTenant();
		return;
	}

	// Cache: já tem o tenant correto carregado
	if (tenantStore.loja?.slug === slug) {
		tenantStore.aplicarTema();
		return;
	}

	// Busca a loja pelo slug via Supabase
	tenantStore.carregando = true;

	try {
		const supabase = useSupabaseClient();
		const { data: rawData, error } = await supabase
			.from("lojas")
			.select("*")
			.eq("slug", slug)
			.eq("status", "ativo")
			.single();

		if (error || !rawData) {
			tenantStore.clearTenant();
			return abortNavigation(
				createError({ statusCode: 404, statusMessage: "Loja não encontrada" }),
			);
		}

		// Tipagem explícita via shared/types — fonte de verdade do banco
		const data = rawData as unknown as Loja;

		const lojaData: TenantLoja = {
			id: data.id,
			empresa_id: data.empresa_id,
			nome_estabelecimento: data.nome_estabelecimento,
			slug: data.slug,
			logo_light_url: data.logo_light_url,
			logo_dark_url: data.logo_dark_url,
			config_tema: data.config_tema as unknown as LojaConfigTema | null,
		};

		tenantStore.setLoja(lojaData);
		tenantStore.aplicarTema();
	} finally {
		tenantStore.carregando = false;
	}
});
