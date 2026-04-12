<script setup lang="ts">
/**
 * ResetForm — Formulário de redefinição de senha (puramente visual).
 */

import { resetPasswordSchema } from "~~/shared/schemas/auth/reset-password";
import type { ResetPasswordForm } from "~~/shared/schemas/auth/reset-password";

const props = defineProps<{
	isLoading: boolean;
	errorMessage: string | null;
}>();

const emit = defineEmits<{
	submit: [form: ResetPasswordForm];
	clearError: [];
}>();

const form = reactive<ResetPasswordForm>({ senha: "", confirmarSenha: "" });

function onSubmit() {
	emit("submit", { ...form });
}
</script>

<template>
	<div class="flex flex-col gap-6">
		<UiAlert v-if="props.errorMessage" color="error" closable @close="emit('clearError')">
			{{ props.errorMessage }}
		</UiAlert>

		<UiForm :state="form" :schema="resetPasswordSchema" @submit="onSubmit">
			<UiFormField
				v-slot="{ id, error, errorMessage: msg }"
				name="senha"
				label="Nova senha"
				required
			>
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
				label="Confirmar nova senha"
				required
			>
				<UiInput
					:id="id"
					v-model="form.confirmarSenha"
					type="password"
					placeholder="Repita a nova senha"
					:error="error"
					:error-message="msg"
				/>
			</UiFormField>

			<UiButton type="submit" class="w-full" :loading="props.isLoading">Salvar nova senha</UiButton>
		</UiForm>
	</div>
</template>
