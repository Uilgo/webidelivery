<script setup lang="ts">
/**
 * ForgotForm — Formulário de recuperação de senha (puramente visual).
 * Emite @submit com o form, @clear-error e @enviado quando confirmado.
 */

import { forgotPasswordSchema } from "~~/shared/schemas/auth/forgot-password";
import type { ForgotPasswordForm } from "~~/shared/schemas/auth/forgot-password";

const props = defineProps<{
	isLoading: boolean;
	errorMessage: string | null;
}>();

const emit = defineEmits<{
	submit: [form: ForgotPasswordForm];
	clearError: [];
	enviado: [];
}>();

const form = reactive<ForgotPasswordForm>({ email: "" });
const enviado = ref(false);

async function onSubmit() {
	// O AuthManager chama forgotPassword e retorna boolean
	// Usamos um evento intermediário para saber se foi bem-sucedido
	emit("submit", { ...form });
}

// Expõe método para o AuthManager confirmar o envio
function confirmarEnvio() {
	enviado.value = true;
	emit("enviado");
}

defineExpose({ confirmarEnvio });
</script>

<template>
	<div class="flex flex-col gap-6">
		<!-- Estado: confirmação pós-envio -->
		<template v-if="enviado">
			<div class="flex flex-col items-center gap-4 text-center">
				<div class="bg-success/10 flex size-14 items-center justify-center rounded-full">
					<Icon name="lucide:mail-check" class="text-success size-7" />
				</div>
				<p class="text-muted-foreground text-sm">
					Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
				</p>
			</div>
			<NuxtLink to="/login">
				<UiButton variant="outline" color="neutral" class="w-full" icon-left="lucide:arrow-left">
					Voltar ao login
				</UiButton>
			</NuxtLink>
		</template>

		<!-- Estado: formulário -->
		<template v-else>
			<UiAlert v-if="props.errorMessage" color="error" closable @close="emit('clearError')">
				{{ props.errorMessage }}
			</UiAlert>

			<UiForm :state="form" :schema="forgotPasswordSchema" @submit="onSubmit">
				<UiFormField v-slot="{ id, error, errorMessage: msg }" name="email" label="E-mail" required>
					<UiInput
						:id="id"
						v-model="form.email"
						type="email"
						placeholder="seu@email.com"
						icon-left="lucide:mail"
						:error="error"
						:error-message="msg"
					/>
				</UiFormField>

				<UiButton type="submit" class="w-full" :loading="props.isLoading"
					>Enviar instruções</UiButton
				>
			</UiForm>

			<p class="text-muted-foreground text-center text-sm">
				Lembrou a senha?
				<NuxtLink to="/login" class="text-primary font-medium hover:underline"
					>Voltar ao login</NuxtLink
				>
			</p>
		</template>
	</div>
</template>
