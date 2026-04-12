<script setup lang="ts">
/**
 * SignupForm — Formulário de cadastro (puramente visual).
 * Recebe isLoading e errorMessage via props.
 * Emite @submit com os dados do form e @clear-error.
 */

import { signupSchema } from "~~/shared/schemas/auth/signup";
import type { SignupForm } from "~~/shared/schemas/auth/signup";

const props = defineProps<{
	isLoading: boolean;
	errorMessage: string | null;
}>();

const emit = defineEmits<{
	submit: [form: SignupForm];
	clearError: [];
}>();

const form = reactive<SignupForm>({
	nome: "",
	sobrenome: "",
	email: "",
	senha: "",
	confirmarSenha: "",
});

function onSubmit() {
	emit("submit", { ...form });
}
</script>

<template>
	<div class="flex flex-col gap-6">
		<UiAlert v-if="props.errorMessage" color="error" closable @close="emit('clearError')">
			{{ props.errorMessage }}
		</UiAlert>

		<UiForm :state="form" :schema="signupSchema" @submit="onSubmit">
			<div class="grid grid-cols-2 gap-4">
				<UiFormField v-slot="{ id, error, errorMessage: msg }" name="nome" label="Nome" required>
					<UiInput
						:id="id"
						v-model="form.nome"
						placeholder="João"
						:error="error"
						:error-message="msg"
					/>
				</UiFormField>

				<UiFormField
					v-slot="{ id, error, errorMessage: msg }"
					name="sobrenome"
					label="Sobrenome"
					required
				>
					<UiInput
						:id="id"
						v-model="form.sobrenome"
						placeholder="Silva"
						:error="error"
						:error-message="msg"
					/>
				</UiFormField>
			</div>

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
					placeholder="Mínimo 8 caracteres"
					:error="error"
					:error-message="msg"
				/>
			</UiFormField>

			<UiFormField
				v-slot="{ id, error, errorMessage: msg }"
				name="confirmarSenha"
				label="Confirmar senha"
				required
			>
				<UiInput
					:id="id"
					v-model="form.confirmarSenha"
					type="password"
					placeholder="Repita a senha"
					:error="error"
					:error-message="msg"
				/>
			</UiFormField>

			<UiButton type="submit" class="w-full" :loading="props.isLoading">Criar conta</UiButton>
		</UiForm>

		<p class="text-muted-foreground text-center text-sm">
			Já tem uma conta?
			<NuxtLink to="/login" class="text-primary font-medium hover:underline">Entrar</NuxtLink>
		</p>
	</div>
</template>
