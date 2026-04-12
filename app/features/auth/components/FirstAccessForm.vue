<script setup lang="ts">
/**
 * FirstAccessForm — Troca de senha obrigatória (puramente visual).
 */

import { firstAccessSchema } from "~~/shared/schemas/auth/first-access";
import type { FirstAccessForm } from "~~/shared/schemas/auth/first-access";

const props = defineProps<{
	isLoading: boolean;
	errorMessage: string | null;
}>();

const emit = defineEmits<{
	submit: [form: FirstAccessForm];
	clearError: [];
}>();

const form = reactive<FirstAccessForm>({ senha: "", confirmarSenha: "" });

function onSubmit() {
	emit("submit", { ...form });
}
</script>

<template>
	<div class="flex flex-col gap-6">
		<UiAlert v-if="props.errorMessage" color="error" closable @close="emit('clearError')">
			{{ props.errorMessage }}
		</UiAlert>

		<UiForm :state="form" :schema="firstAccessSchema" @submit="onSubmit">
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

			<UiButton type="submit" class="w-full" :loading="props.isLoading"
				>Definir senha e continuar</UiButton
			>
		</UiForm>
	</div>
</template>
