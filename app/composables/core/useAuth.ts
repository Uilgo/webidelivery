/**
 * useAuth — Composable central de autenticação
 *
 * Abstrai os fluxos de auth via @nuxtjs/supabase e orquestra a sincronização
 * com perfilStore. Roteamento pós-login baseado no cargo do perfil.
 */

import { usePerfilStore } from "~/stores/perfilStore";
import { usePreferencesStore } from "~/stores/preferencesStore";
import { CARGOS_PLATAFORMA } from "~~/shared/constants/rbac";
import { loginSchema } from "~~/shared/schemas/auth/login";
import { signupSchema } from "~~/shared/schemas/auth/signup";
import { forgotPasswordSchema } from "~~/shared/schemas/auth/forgot-password";
import { resetPasswordSchema } from "~~/shared/schemas/auth/reset-password";
import { firstAccessSchema } from "~~/shared/schemas/auth/first-access";
import type { LoginForm } from "~~/shared/schemas/auth/login";
import type { SignupForm } from "~~/shared/schemas/auth/signup";
import type { ForgotPasswordForm } from "~~/shared/schemas/auth/forgot-password";
import type { ResetPasswordForm } from "~~/shared/schemas/auth/reset-password";
import type { FirstAccessForm } from "~~/shared/schemas/auth/first-access";
import type {
	RpcRegistrarUltimoAcessoParams,
	RpcVerificarEmailDisponivelParams,
} from "~~/shared/types/rpc/core";

export const useAuth = () => {
	const supabase = useSupabaseClient();
	const perfilStore = usePerfilStore();
	const preferencesStore = usePreferencesStore();
	const isLoading = ref(false);
	const errorMessage = ref<string | null>(null);

	// ─── Helpers ──────────────────────────────────────────────────────────────

	function clearError(): void {
		errorMessage.value = null;
	}

	/** Resolve a rota de destino com base no cargo do perfil */
	function resolverRotaDestino(): string {
		const cargo = perfilStore.cargo;
		if (!cargo) return "/login";
		return (CARGOS_PLATAFORMA as readonly string[]).includes(cargo)
			? "/plataforma/dashboard"
			: "/admin/dashboard";
	}

	/** Registra o último acesso do perfil via RPC (fire-and-forget) */
	function registrarUltimoAcesso(perfilId: string): void {
		const params: RpcRegistrarUltimoAcessoParams = { p_perfil_id: perfilId };
		void supabase.rpc("fn_rpc_registrar_ultimo_acesso", params as never);
	}

	// ─── Login ────────────────────────────────────────────────────────────────

	async function login(form: LoginForm): Promise<void> {
		const parsed = loginSchema.safeParse(form);
		if (!parsed.success) return;

		isLoading.value = true;
		clearError();

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: form.email,
				password: form.senha,
			});

			if (error) {
				errorMessage.value =
					error.message === "Invalid login credentials"
						? "E-mail ou senha incorretos."
						: "Erro ao fazer login. Tente novamente.";
				return;
			}

			// Busca o perfil para determinar o cargo e rota de destino
			await perfilStore.fetchPerfil(data.user.id);

			const cargo = perfilStore.cargo;
			if (!cargo) {
				errorMessage.value = "Usuário sem cargo atribuído. Contate o suporte.";
				await supabase.auth.signOut();
				return;
			}

			// Registra último acesso (fire-and-forget — não bloqueia o redirect)
			registrarUltimoAcesso(data.user.id);

			// Carrega preferências do usuário (fire-and-forget)
			void preferencesStore.carregarPreferences(data.user.id);

			await navigateTo(resolverRotaDestino());
		} finally {
			isLoading.value = false;
		}
	}

	// ─── Signup ───────────────────────────────────────────────────────────────

	async function signup(form: SignupForm): Promise<void> {
		const parsed = signupSchema.safeParse(form);
		if (!parsed.success) return;

		isLoading.value = true;
		clearError();

		try {
			// Verifica se o e-mail já está em uso antes de tentar criar a conta
			const params: RpcVerificarEmailDisponivelParams = { p_email: form.email };
			const { data: emailDisponivel } = await supabase.rpc(
				"fn_rpc_verificar_email_disponivel",
				params as never,
			);

			if (emailDisponivel === false) {
				errorMessage.value = "Este e-mail já está cadastrado. Faça login para continuar.";
				return;
			}

			const { error } = await supabase.auth.signUp({
				email: form.email,
				password: form.senha,
				options: {
					data: { nome: form.nome, sobrenome: form.sobrenome },
					emailRedirectTo: `${window.location.origin}/confirm`,
				},
			});

			if (error) {
				errorMessage.value =
					error.message === "User already registered"
						? "Este e-mail já está cadastrado. Faça login para continuar."
						: "Erro ao criar conta. Tente novamente.";
				return;
			}

			await navigateTo("/signup/confirmar-email");
		} finally {
			isLoading.value = false;
		}
	}

	// ─── Forgot Password ──────────────────────────────────────────────────────

	async function forgotPassword(form: ForgotPasswordForm): Promise<boolean> {
		const parsed = forgotPasswordSchema.safeParse(form);
		if (!parsed.success) return false;

		isLoading.value = true;
		clearError();

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) {
				errorMessage.value = "Erro ao enviar e-mail. Tente novamente.";
				return false;
			}

			return true;
		} finally {
			isLoading.value = false;
		}
	}

	// ─── Reset Password ───────────────────────────────────────────────────────

	async function resetPassword(form: ResetPasswordForm): Promise<void> {
		const parsed = resetPasswordSchema.safeParse(form);
		if (!parsed.success) return;

		isLoading.value = true;
		clearError();

		try {
			const { error } = await supabase.auth.updateUser({ password: form.senha });

			if (error) {
				errorMessage.value = "Erro ao redefinir senha. O link pode ter expirado.";
				return;
			}

			await navigateTo("/login");
		} finally {
			isLoading.value = false;
		}
	}

	// ─── First Access ─────────────────────────────────────────────────────────

	async function firstAccess(form: FirstAccessForm): Promise<void> {
		const parsed = firstAccessSchema.safeParse(form);
		if (!parsed.success) return;

		isLoading.value = true;
		clearError();

		try {
			const { error } = await supabase.auth.updateUser({ password: form.senha });

			if (error) {
				errorMessage.value = "Erro ao definir senha. Tente novamente.";
				return;
			}

			// Após trocar a senha, redireciona para o destino correto por cargo
			await navigateTo(resolverRotaDestino());
		} finally {
			isLoading.value = false;
		}
	}

	// ─── Logout ───────────────────────────────────────────────────────────────

	async function logout(): Promise<void> {
		// Determina rota de login ANTES de limpar o perfil
		const loginRoute = perfilStore.isCargoPlataforma ? "/plataforma/login" : "/login";

		// Persiste o último painel em cookie para o index.vue usar após logout
		const ultimoPainel = useCookie("ultimo-painel", {
			maxAge: 60 * 60 * 24 * 365,
			sameSite: "lax",
		});
		ultimoPainel.value = perfilStore.isCargoPlataforma ? "plataforma" : "loja";

		await supabase.auth.signOut();
		perfilStore.clearPerfil();

		// Hard redirect para destruir o estado do app na RAM
		if (import.meta.client) {
			window.location.href = loginRoute;
		} else {
			await navigateTo(loginRoute, { replace: true, external: true });
		}
	}

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		isLoading: readonly(isLoading),
		errorMessage: readonly(errorMessage),
		clearError,
		login,
		signup,
		forgotPassword,
		resetPassword,
		firstAccess,
		logout,
	};
};
