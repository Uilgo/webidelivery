<script setup lang="ts">
/**
 * UiFormField — Wrapper de campo de formulário do design system WebiDelivery
 *
 * Envolve qualquer componente de input e fornece:
 *   - Label com suporte a asterisco de obrigatório
 *   - Description (contextual abaixo do label)
 *   - Hint (alinhado à direita do label)
 *   - Help (texto auxiliar abaixo do campo)
 *   - Error (automático do Form pai, ou manual via prop)
 *
 * Intercepta eventos nativos (input, change, focusout) que borbulham dos
 * componentes filhos para disparar validação em tempo real no Form pai.
 *
 * Slot props:
 *   - id:           ID para associar label <-> input
 *   - error:        true/false se o campo está em erro
 *   - errorMessage: mensagem de erro (string) — o input é responsável por renderizá-la
 *
 * Props:
 *   - name:             nome do campo (deve bater com a chave do schema Zod)
 *   - label:            texto do label (opcional)
 *   - description:      descrição contextual (opcional)
 *   - hint:             texto pequeno alinhado à direita do label (opcional)
 *   - error:            erro manual (string = mensagem, boolean = estado)
 *   - required:         exibe asterisco no label (padrão: false)
 *   - eagerValidation:  valida no primeiro input sem esperar blur (padrão: false)
 *
 * Uso:
 *   <UiFormField name="email" label="E-mail" required #default="{ id, error, errorMessage }">
 *     <UiInput v-model="form.email" :id="id" :error="error" :error-message="errorMessage" />
 *   </UiFormField>
 */

import type { FormContext, FormError } from "~/components/ui/Form.vue";

const props = withDefaults(
	defineProps<{
		name?: string;
		label?: string;
		description?: string;
		hint?: string;
		error?: string | boolean;
		required?: boolean;
		eagerValidation?: boolean;
	}>(),
	{
		name: undefined,
		label: undefined,
		description: undefined,
		hint: undefined,
		error: undefined,
		required: false,
		eagerValidation: false,
	},
);

// ─── Inject Form Context ──────────────────────────────────────────────────────

/** Contexto do UiForm pai (nullable — pode ser usado standalone) */
const formContext = inject<FormContext | null>("ui-form-context", null);

// ─── ID para label <-> input ──────────────────────────────────────────────────

const fieldId = useId();

// ─── Resolução do erro ────────────────────────────────────────────────────────

/** Mensagem de erro (manual via prop ou automático via Form) */
const fieldError = computed(() => {
	// Erro manual via prop tem prioridade
	if (typeof props.error === "string" && props.error) {
		return props.error;
	}

	// Erro do Form pai (matching por name)
	if (formContext && props.name) {
		const match = formContext.errors.value.find((e: FormError) => e.name === props.name);
		return match?.message || "";
	}

	return "";
});

/** Boolean indicando se o campo está em estado de erro */
const hasError = computed(() => {
	if (props.error === true) return true;
	return !!fieldError.value;
});

// ─── Interceptação de eventos nativos ─────────────────────────────────────────
// Eventos borbulham dos <input>/<textarea>/<select> nativos dentro do slot.

/** Timer para debounce de validação no evento input */
let inputTimer: ReturnType<typeof setTimeout> | null = null;

/** focusout borbulha (blur não) — usado para detectar perda de foco */
function handleFocusOut() {
	if (!props.name || !formContext) return;
	formContext.markTouched(props.name);

	if (formContext.validateOn.value.includes("blur")) {
		formContext.validateField(props.name);
	}
}

/** Evento input — valida com debounce para não travar a digitação */
function handleInput() {
	if (!props.name || !formContext) return;
	formContext.markDirty(props.name);

	if (formContext.validateOn.value.includes("input") || props.eagerValidation) {
		if (inputTimer) clearTimeout(inputTimer);
		inputTimer = setTimeout(() => {
			formContext.validateField(props.name!);
		}, formContext.inputDelay.value);
	}
}

/** Evento change — valida imediatamente (select, checkbox, radio) */
function handleChange() {
	if (!props.name || !formContext) return;
	formContext.markDirty(props.name);

	if (formContext.validateOn.value.includes("change")) {
		formContext.validateField(props.name);
	}
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

onUnmounted(() => {
	if (inputTimer) clearTimeout(inputTimer);
});
</script>

<template>
	<div class="flex flex-col gap-1.5">
		<!-- Header: Label + Hint -->
		<div v-if="label || hint" class="flex items-center justify-between gap-2">
			<label :for="fieldId" class="text-foreground text-sm font-medium">
				{{ label }}
				<span v-if="required" class="text-error ml-0.5" aria-hidden="true">*</span>
			</label>
			<span v-if="hint" class="text-muted-foreground text-xs">
				{{ hint }}
			</span>
		</div>

		<!-- Description (abaixo do label, acima do input) -->
		<p v-if="description" class="text-muted-foreground -mt-0.5 text-xs">
			{{ description }}
		</p>

		<!-- Slot content (input) — intercepta eventos nativos que borbulham -->
		<div @focusout="handleFocusOut" @input="handleInput" @change="handleChange">
			<slot :id="fieldId" :error="hasError" :error-message="fieldError"></slot>
		</div>
	</div>
</template>
