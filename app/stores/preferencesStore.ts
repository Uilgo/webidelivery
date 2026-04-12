/**
 * 📌 Store de Preferências do Usuário
 *
 * Gerencia preferências de UI (tema, sidebar, layout, etc).
 *
 * Estratégia:
 * 1. Cookie SSR-safe → carregado no servidor, sem piscado de hidratação
 * 2. preferencias do perfil no banco → fonte de verdade
 * 3. Toda escrita vai via RPC rpc_atualizar_preferencias (campo preferencias)
 *
 * Nota: preferências ficam em perfis.preferencias (JSONB) — sem tabela separada.
 */

import type { RpcAtualizarPreferenciasParams } from "~~/shared/types/rpc/core";
import type { Perfil, PreferenciasUsuario } from "~~/shared/types/database/core";
import { DEFAULT_PREFERENCES, isValidPreferences } from "~~/shared/constants/preferences";

const COOKIE_KEY = "webi-preferences";

export const usePreferencesStore = defineStore("preferences", () => {
	// ─── Estado ───────────────────────────────────────────────────────────────
	// useCookie é lido no servidor e no cliente — sem piscado de hidratação

	const cookie = useCookie<PreferenciasUsuario>(COOKIE_KEY, {
		maxAge: 60 * 60 * 24 * 365, // 1 ano
		sameSite: "lax",
		default: () => ({ ...DEFAULT_PREFERENCES }),
	});

	const carregando = ref(false);
	const sincronizando = ref(false);
	const jaCarregado = ref(false); // evita recarregar em cada navegação

	// ─── Computed ─────────────────────────────────────────────────────────────

	const theme = computed(() => cookie.value.theme ?? DEFAULT_PREFERENCES.theme);
	const sidebarCollapsed = computed(
		() => cookie.value.sidebar_collapsed ?? DEFAULT_PREFERENCES.sidebar_collapsed,
	);
	const dashboardLayout = computed(
		() => cookie.value.dashboard_layout ?? DEFAULT_PREFERENCES.dashboard_layout,
	);
	const itemsPerPage = computed(
		() => cookie.value.items_per_page ?? DEFAULT_PREFERENCES.items_per_page,
	);
	const timezone = computed(() => cookie.value.timezone ?? DEFAULT_PREFERENCES.timezone);
	const locale = computed(() => cookie.value.locale ?? DEFAULT_PREFERENCES.locale);

	// ─── Helpers privados ─────────────────────────────────────────────────────

	function detectarNavegador(): Partial<PreferenciasUsuario> {
		if (import.meta.server) return {};
		try {
			return {
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				locale: navigator.language || navigator.languages?.[0],
			};
		} catch {
			return {};
		}
	}

	// ─── Actions ──────────────────────────────────────────────────────────────

	async function carregarPreferences(userId?: string): Promise<void> {
		if (jaCarregado.value) return; // já carregado nesta sessão
		carregando.value = true;

		try {
			// v2: useSupabaseUser() retorna JWT claims — o id está em .sub
			const claims = useSupabaseUser().value;
			const claimsId = (claims as Record<string, unknown> | null)?.sub as string | undefined;
			const id = userId ?? claimsId;

			// Busca preferencias do perfil no banco (fonte de verdade)
			if (id) {
				const supabase = useSupabaseClient();
				const { data } = await supabase.from("perfis").select("*").eq("id", id).single();

				const configUi: unknown = (data as Perfil | null)?.preferencias;
				const temDadosNoBanco =
					configUi &&
					typeof configUi === "object" &&
					Object.keys(configUi).length > 0 &&
					isValidPreferences(configUi);

				if (temDadosNoBanco) {
					// Banco tem dados válidos → usa como fonte de verdade
					const merged: PreferenciasUsuario = { ...DEFAULT_PREFERENCES, ...configUi };
					cookie.value = merged;
					return;
				}
			}

			// Sem dados no banco → detecta do navegador, persiste no cookie e no banco
			const detectado = detectarNavegador();
			cookie.value = { ...DEFAULT_PREFERENCES, ...detectado };
			await sincronizarComBanco(cookie.value);
		} catch (e: unknown) {
			console.error("[preferencesStore] Erro ao carregar preferências:", e);
		} finally {
			carregando.value = false;
			jaCarregado.value = true;
		}
	}

	async function sincronizarComBanco(prefs: PreferenciasUsuario): Promise<void> {
		// RPC requer auth.uid() — só funciona no cliente com sessão ativa
		if (import.meta.server) return;
		if (sincronizando.value) return;
		sincronizando.value = true;

		try {
			const supabase = useSupabaseClient();
			// v2: useSupabaseUser() retorna JWT claims — o id está em .sub
			const claims = useSupabaseUser().value;
			const id = (claims as Record<string, unknown> | null)?.sub as string | undefined;
			if (!id) return;

			const params: RpcAtualizarPreferenciasParams = {
				p_perfil_id: id,
				p_preferencias: prefs as unknown as Record<string, unknown>,
			};

			const { error } = await supabase.rpc("fn_rpc_atualizar_preferencias", params as never);
			if (error) console.error("[preferencesStore] Erro no RPC:", error);
		} catch (e: unknown) {
			console.error("[preferencesStore] Erro ao sincronizar:", e);
		} finally {
			sincronizando.value = false;
		}
	}

	async function atualizarPreferences(updates: Partial<PreferenciasUsuario>): Promise<void> {
		// Atualiza cookie de imediato (otimista — SSR-safe)
		cookie.value = { ...cookie.value, ...updates };
		await sincronizarComBanco(cookie.value);
	}

	async function resetarPreferences(): Promise<void> {
		cookie.value = { ...DEFAULT_PREFERENCES };
		await sincronizarComBanco(cookie.value);
	}

	// Atalhos para campos comuns
	const setTheme = (t: "light" | "dark" | "system") => atualizarPreferences({ theme: t });
	const setSidebarCollapsed = (v: boolean) => atualizarPreferences({ sidebar_collapsed: v });
	const setDashboardLayout = (v: "grid" | "list") => atualizarPreferences({ dashboard_layout: v });
	const setTimezone = (tz: string) => atualizarPreferences({ timezone: tz });
	const setLocale = (lc: string) => atualizarPreferences({ locale: lc });

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		// Estado
		preferences: cookie, // expõe o cookie diretamente como "preferences"
		carregando,
		sincronizando,

		// Computed
		theme,
		sidebarCollapsed,
		dashboardLayout,
		itemsPerPage,
		timezone,
		locale,

		// Actions
		carregarPreferences,
		atualizarPreferences,
		resetarPreferences,
		setTheme,
		setSidebarCollapsed,
		setDashboardLayout,
		setTimezone,
		setLocale,
	};
});
