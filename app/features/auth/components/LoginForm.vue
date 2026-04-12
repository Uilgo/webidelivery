<script setup lang="ts">
/**
 * LoginForm — Formulário de login (puramente visual).
 * Recebe isLoading e errorMessage via props.
 * Emite @submit com os dados do form e @clear-error.
 */

import { loginSchema } from "~~/shared/schemas/auth/login";
import type { LoginForm } from "~~/shared/schemas/auth/login";

const props = defineProps<{
	isLoading: boolean;
	errorMessage: string | null;
}>();

const emit = defineEmits<{
	submit: [form: LoginForm];
	clearError: [];
}>();

const form = reactive<LoginForm>({ email: "", senha: "" });

function onSubmit() {
	emit("submit", { ...form });
}
</script>

<template>
	<div class="flex flex-col gap-6">
		<UiAlert v-if="props.errorMessage" color="error" closable @close="emit('clearError')">
			{{ props.errorMessage }}
		</UiAlert>

		<UiForm :state="form" :schema="loginSchema" @submit="onSubmit">
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

			<UiFormField v-slot="{ id, error, errorMessage: msg }" name="senha" label="Senha" required>
				<UiInput
					:id="id"
					v-model="form.senha"
					type="password"
					placeholder="Sua senha"
					:error="error"
					:error-message="msg"
					forgot-href="/forgot-password"
				/>
			</UiFormField>

			<UiButton type="submit" class="w-full" :loading="props.isLoading">Entrar</UiButton>
		</UiForm>

		<p class="text-muted-foreground text-center text-sm">
			Não tem uma conta?
			<NuxtLink to="/signup" class="text-primary font-medium hover:underline">Criar conta</NuxtLink>
		</p>
	</div>
</template>
