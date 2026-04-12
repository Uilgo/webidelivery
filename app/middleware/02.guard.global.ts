/**
 * 02.guard.global.ts — Pipeline de segurança de negócio (Fail-fast cascade)
 *
 * O módulo @nuxtjs/supabase já cuida do redirect para /login quando não autenticado
 * (via redirect: true + exclude no nuxt.config.ts).
 *
 * Este middleware cuida do que o módulo NÃO faz:
 * 1. Busca e valida o perfil do usuário autenticado
 * 2. First-Access → trava admin_loja com onboarding pendente
 * 3. Onboarding → trava admin_loja se setup não concluído
 * 4. RBAC → valida se o cargo tem acesso à rota destino
 */

import { usePerfilStore } from "~/stores/perfilStore";
import { useLojaStore } from "~/stores/lojaStore";
import { CARGOS_PLATAFORMA, CARGOS_LOJA } from "~~/shared/constants/rbac";

// ─── Rotas que não precisam de verificação de perfil/RBAC ─────────────────────

const ROTAS_SEM_GUARD = [
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/first-access",
	"/confirm",
	"/plataforma/login",
	"/plataforma/signup",
	"/plataforma/forgot-password",
];

function isRotaSemGuard(path: string): boolean {
	if (ROTAS_SEM_GUARD.includes(path)) return true;
	// Cardápio público e rotas de slug são públicas
	if (!path.startsWith("/admin") && !path.startsWith("/plataforma")) return true;
	return false;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

function cargoTemAcessoRota(cargo: string, path: string): boolean {
	const isPlataforma = (CARGOS_PLATAFORMA as readonly string[]).includes(cargo);
	const isLoja = (CARGOS_LOJA as readonly string[]).includes(cargo);

	if (path.startsWith("/plataforma")) return isPlataforma;
	if (path.startsWith("/admin")) return isLoja;

	return true;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default defineNuxtRouteMiddleware(async (to) => {
	const path = to.path;

	// ─── Rota raiz: redireciona baseado em sessão e último painel ─────────────
	if (path === "/") {
		const user = useSupabaseUser();
		const ultimoPainel = useCookie<string>("ultimo-painel");

		if (user.value) {
			const perfilStore = usePerfilStore();
			if (!perfilStore.perfil) {
				await perfilStore.fetchPerfil(user.value.id);
			}
			if ((CARGOS_LOJA as readonly string[]).includes(perfilStore.cargo ?? "")) {
				const lojaStore = useLojaStore();
				if (!lojaStore.loja) await lojaStore.fetchLoja();
			}
			const destino = perfilStore.isCargoPlataforma ? "/plataforma/dashboard" : "/admin/dashboard";
			return navigateTo(destino, { replace: true });
		} else {
			const destino = ultimoPainel.value === "plataforma" ? "/plataforma/login" : "/login";
			return navigateTo(destino, { replace: true });
		}
	}

	// Rotas públicas e de auth — o módulo @nuxtjs/supabase já gerencia
	if (isRotaSemGuard(path)) return;

	const user = useSupabaseUser();

	// Sem sessão — fallback (o módulo já redireciona, mas garante)
	if (!user.value) return;

	const perfilStore = usePerfilStore();

	// Busca o perfil se ainda não carregado
	if (!perfilStore.perfil) {
		await perfilStore.fetchPerfil(user.value.id);
	}

	// Perfil não encontrado — desloga
	if (!perfilStore.perfil) {
		const supabase = useSupabaseClient();
		await supabase.auth.signOut();
		return navigateTo("/login", { replace: true });
	}

	const cargo = perfilStore.cargo!;

	// Pré-carrega lojaStore no servidor para evitar flash no layout
	if ((CARGOS_LOJA as readonly string[]).includes(cargo)) {
		const lojaStore = useLojaStore();
		if (!lojaStore.loja) {
			await lojaStore.fetchLoja();
		}
	}

	// First-Access — admin_loja com onboarding pendente deve trocar a senha
	if (
		cargo === "admin_loja" &&
		path !== "/first-access" &&
		perfilStore.onboardingStatus === "pendente"
	) {
		return navigateTo("/first-access", { replace: true });
	}

	// Onboarding — admin_loja deve completar setup antes de acessar o painel
	if (
		cargo === "admin_loja" &&
		path.startsWith("/admin") &&
		path !== "/admin/onboarding" &&
		perfilStore.onboardingStatus !== "concluido"
	) {
		return navigateTo("/admin/onboarding", { replace: true });
	}

	// RBAC — cargo sem acesso à rota → redireciona para o painel correto
	if (!cargoTemAcessoRota(cargo, path)) {
		const destino = (CARGOS_PLATAFORMA as readonly string[]).includes(cargo)
			? "/plataforma/dashboard"
			: "/admin/dashboard";
		return navigateTo(destino, { replace: true });
	}
});
