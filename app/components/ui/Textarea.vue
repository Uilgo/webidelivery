<script setup lang="ts">
/**
 * UiTextarea — Campo de texto multilinha do design system WebiDelivery
 *
 * Textarea estilizado que segue os mesmos padrões visuais do UiInput.
 * Suporte a auto-resize, contagem de caracteres e estado de erro.
 *
 * Props:
 *   - placeholder:  texto de placeholder (opcional)
 *   - disabled:     desabilita o campo (padrão: false)
 *   - error:        ativa estado de erro visual (padrão: false)
 *   - hint:         texto auxiliar abaixo do campo (opcional)
 *   - label:        label acima do campo (opcional)
 *   - rows:         número de linhas (padrão: 3)
 *   - maxLength:    limite máximo de caracteres (opcional — ativa contador)
 *   - autoResize:   redimensiona automaticamente baseado no conteúdo (padrão: false)
 *   - maxHeight:    altura máxima em pixels (ou string com unidade) (opcional, padrão: 120)
 *   - minHeight:    altura mínima em pixels (ou string com unidade) (opcional, padrão: 80)
 *
 * Model:
 *   - modelValue:   texto do textarea
 *
 * Uso:
 *   <UiTextarea v-model="descricao" label="Descrição" placeholder="Digite aqui..." />
 *   <UiTextarea v-model="bio" label="Bio" :max-length="200" auto-resize />
 *   <UiTextarea v-model="obs" :error="true" hint="Campo obrigatório" rows="5" />
 */

type Resize = "none" | "vertical" | "horizontal" | "both";

const props = withDefaults(
	defineProps<{
		placeholder?: string;
		disabled?: boolean;
		error?: boolean;
		hint?: string;
		label?: string;
		id?: string;
		rows?: number;
		maxLength?: number;
		resize?: Resize;
		autoResize?: boolean;
		maxHeight?: number | string;
		minHeight?: number | string;
	}>(),
	{
		disabled: false,
		error: false,
		rows: 3,
		resize: "vertical",
		autoResize: false,
		maxHeight: 120,
		minHeight: 80,
		placeholder: undefined,
		hint: undefined,
		label: undefined,
		id: undefined,
		maxLength: undefined,
	},
);

// v-model bidirecional
const model = defineModel<string>({ default: "" });

// ID estável via useId()
const textareaId = useId();
const effectiveId = computed(() => props.id ?? textareaId);

// Referência do textarea para auto-resize
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Contagem de caracteres
const charCount = computed(() => model.value?.length ?? 0);

// Função de auto-resize
function handleAutoResize() {
	if (!props.autoResize || !textareaRef.value) return;
	const el = textareaRef.value;
	el.style.height = "auto";
	el.style.height = `${el.scrollHeight}px`;

	// Se houver maxHeight e a rolagem for necessária, permitir overflow-y
	if (props.maxHeight) {
		const maxH =
			typeof props.maxHeight === "number" ? props.maxHeight : Number.parseFloat(props.maxHeight);
		if (!Number.isNaN(maxH) && el.scrollHeight > maxH) {
			el.classList.remove("overflow-hidden");
			el.classList.add("overflow-y-auto");
		} else {
			el.classList.add("overflow-hidden");
			el.classList.remove("overflow-y-auto");
		}
	}
}

// Observa mudanças no valor para auto-resize
watch(model, () => {
	nextTick(handleAutoResize);
});

// Auto-resize inicial
onMounted(() => {
	nextTick(handleAutoResize);
});

// Mapa de resize CSS
const resizeMap: Record<Resize, string> = {
	none: "resize-none",
	vertical: "resize-y",
	horizontal: "resize-x",
	both: "resize",
};

// Classes do textarea
const textareaClasses = computed(() => [
	"w-full rounded border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none",
	props.error ? "border-error" : "border-border",
	props.disabled ? "opacity-50 cursor-not-allowed" : "",
	props.autoResize ? "resize-none overflow-hidden" : resizeMap[props.resize],
]);

// Estilos inline do textarea
const textareaStyles = computed(() => {
	const styles: Record<string, string> = {};
	if (props.maxHeight) {
		styles.maxHeight =
			typeof props.maxHeight === "number" ? `${props.maxHeight}px` : props.maxHeight;
	}
	if (props.minHeight) {
		styles.minHeight =
			typeof props.minHeight === "number" ? `${props.minHeight}px` : props.minHeight;
	}
	return styles;
});
</script>

<template>
	<div class="flex w-full flex-col gap-1.5">
		<!-- Label -->
		<label v-if="label" :for="effectiveId" class="text-foreground text-sm font-medium">
			{{ label }}
		</label>

		<!-- Textarea -->
		<textarea
			:id="effectiveId"
			ref="textareaRef"
			v-model="model"
			:placeholder="placeholder"
			:disabled="disabled"
			:rows="rows"
			:maxlength="maxLength"
			:aria-invalid="error"
			:aria-describedby="hint ? `${effectiveId}-hint` : undefined"
			:class="textareaClasses"
			:style="textareaStyles"
			@input="handleAutoResize"
		></textarea>

		<!-- Footer: hint + contador de caracteres -->
		<div v-if="hint || maxLength" class="flex items-center justify-between gap-2">
			<p
				v-if="hint"
				:id="`${effectiveId}-hint`"
				:class="['text-xs', error ? 'text-error' : 'text-muted-foreground']"
			>
				{{ hint }}
			</p>
			<span v-else></span>

			<span
				v-if="maxLength"
				:class="[
					'text-xs tabular-nums',
					charCount >= maxLength ? 'text-error' : 'text-muted-foreground',
				]"
			>
				{{ charCount }}/{{ maxLength }}
			</span>
		</div>
	</div>
</template>
