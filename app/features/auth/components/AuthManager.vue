<script setup lang="ts">
/**
 * AuthManager — Orquestra todos os fluxos de autenticação.
 * Instancia useAuth e distribui funções/estados para os forms via props.
 * Os forms são puramente visuais — sem lógica de negócio.
 */

import LoginForm from "~/features/auth/components/LoginForm.vue";
import SignupForm from "~/features/auth/components/SignupForm.vue";
import ForgotForm from "~/features/auth/components/ForgotForm.vue";
import ResetForm from "~/features/auth/components/ResetForm.vue";
import FirstAccessForm from "~/features/auth/components/FirstAccessForm.vue";
import { useAuth } from "~/composables/core/useAuth";
import type { ForgotPasswordForm } from "~~/shared/schemas/auth/forgot-password";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "first-access";

const props = defineProps<{ mode: AuthMode }>();

const {
	login,
	signup,
	forgotPassword,
	resetPassword,
	firstAccess,
	isLoading,
	errorMessage,
	clearError,
} = useAuth();

// Ref para o ForgotForm — necessário para chamar confirmarEnvio() após sucesso
const forgotFormRef = ref<InstanceType<typeof ForgotForm> | null>(null);

async function handleForgot(form: ForgotPasswordForm) {
	const ok = await forgotPassword(form);
	if (ok) forgotFormRef.value?.confirmarEnvio();
}

const meta: Record<AuthMode, { title: string; subtitle: string }> = {
	login: { title: "Entrar", subtitle: "Acesse sua conta para continuar" },
	signup: { title: "Criar conta", subtitle: "Comece a receber pedidos hoje" },
	forgot: { title: "Recuperar senha", subtitle: "Informe seu e-mail e enviaremos as instruções" },
	reset: { title: "Nova senha", subtitle: "Escolha uma senha forte para proteger sua conta" },
	"first-access": {
		title: "Defina sua senha",
		subtitle: "Por segurança, crie uma senha pessoal antes de continuar",
	},
};

const current = computed(() => meta[props.mode]);

// Esconde o título quando o ForgotForm entra no estado de confirmação
const forgotEnviado = ref(false);
const mostrarTitulo = computed(() => !(props.mode === "forgot" && forgotEnviado.value));
</script>

<template>
	<div class="flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-md">
			<!-- Título e subtítulo — centralizados, dinâmicos por mode -->
			<div v-if="mostrarTitulo" class="mb-6 text-center">
				<h1 class="text-foreground text-2xl font-bold">{{ current.title }}</h1>
				<p class="text-muted-foreground mt-1 text-sm">{{ current.subtitle }}</p>
			</div>

			<!-- Card do formulário -->
			<UiCard padding="lg" shadow="md">
				<LoginForm
					v-if="props.mode === 'login'"
					:is-loading="isLoading"
					:error-message="errorMessage"
					@submit="login"
					@clear-error="clearError"
				/>
				<SignupForm
					v-else-if="props.mode === 'signup'"
					:is-loading="isLoading"
					:error-message="errorMessage"
					@submit="signup"
					@clear-error="clearError"
				/>
				<ForgotForm
					v-else-if="props.mode === 'forgot'"
					ref="forgotFormRef"
					:is-loading="isLoading"
					:error-message="errorMessage"
					@submit="handleForgot"
					@clear-error="clearError"
					@enviado="forgotEnviado = true"
				/>
				<ResetForm
					v-else-if="props.mode === 'reset'"
					:is-loading="isLoading"
					:error-message="errorMessage"
					@submit="resetPassword"
					@clear-error="clearError"
				/>
				<FirstAccessForm
					v-else-if="props.mode === 'first-access'"
					:is-loading="isLoading"
					:error-message="errorMessage"
					@submit="firstAccess"
					@clear-error="clearError"
				/>
			</UiCard>
		</div>
	</div>
</template>
