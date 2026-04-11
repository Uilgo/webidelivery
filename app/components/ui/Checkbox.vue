<script setup lang="ts">
/**
 * UiCheckbox — Campo de seleção múltipla do design system WebiDelivery
 *
 * Checkbox estilizado com suporte a label, descrição e estado de erro.
 * Usa input nativo escondido + visual customizado via Tailwind.
 *
 * Props:
 *   - label:        texto do label (opcional)
 *   - description:  texto auxiliar abaixo do label (opcional)
 *   - disabled:     desabilita o checkbox (padrão: false)
 *   - error:        ativa estado de erro visual (padrão: false)
 *   - color:        cor do checkbox quando marcado (primary | secondary | success | info | warning | error), padrão: "primary"
 *   - size:         tamanho do checkbox (sm | md | lg), padrão: "md"
 *   - id:           id do input (gerado automaticamente se omitido)
 *
 * Model:
 *   - modelValue:   booleano — estado do checkbox
 *
 * Uso:
 *   <UiCheckbox v-model="aceito" label="Aceito os termos" />
 *   <UiCheckbox v-model="newsletter" label="Receber novidades" description="Enviaremos no máximo uma vez por semana" />
 *   <UiCheckbox v-model="ativo" color="success" />
 */

type Color = "primary" | "secondary" | "success" | "info" | "warning" | "error";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		label?: string;
		description?: string;
		disabled?: boolean;
		error?: boolean;
		color?: Color;
		size?: Size;
		id?: string;
	}>(),
	{
		label: undefined,
		description: undefined,
		id: undefined,
		disabled: false,
		error: false,
		color: "primary",
		size: "md",
	},
);

// v-model bidirecional
const model = defineModel<boolean>();

// ID estável via useId() — evita hydration mismatch
const checkboxId = useId();
const effectiveId = computed(() => props.id ?? checkboxId);

// Mapa de tamanhos do indicador visual
const sizeClasses: Record<Size, { box: string; icon: string }> = {
	sm: { box: "size-4", icon: "size-3" },
	md: { box: "size-[18px]", icon: "size-3.5" },
	lg: { box: "size-5", icon: "size-4" },
};

// Mapa de cores quando marcado
const colorClasses: Record<Color, string> = {
	primary: "border-primary bg-primary text-primary-foreground",
	secondary: "border-secondary bg-secondary text-secondary-foreground",
	success: "border-success bg-success text-success-foreground",
	info: "border-info bg-info text-info-foreground",
	warning: "border-warning bg-warning text-warning-foreground",
	error: "border-error bg-error text-error-foreground",
};

// Classes do indicador visual do checkbox
const boxClasses = computed(() => [
	"inline-flex items-center justify-center shrink-0 rounded-[4px] border transition-colors duration-150",
	sizeClasses[props.size].box,
	model.value
		? colorClasses[props.color]
		: props.error
			? "border-error bg-transparent"
			: "border-border bg-input",
	props.disabled ? "opacity-50" : "",
]);
</script>

<template>
	<label
		:for="effectiveId"
		:class="[
			'flex w-max gap-2.5 select-none',
			description ? 'items-start' : 'items-center',
			disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
		]"
	>
		<!-- Input nativo escondido — mantém acessibilidade e form submission -->
		<input
			:id="effectiveId"
			v-model="model"
			type="checkbox"
			:disabled="disabled"
			:aria-invalid="error"
			class="peer sr-only"
		/>

		<!-- Indicador visual customizado -->
		<span :class="[boxClasses, description ? 'mt-0.5' : '']" aria-hidden="true">
			<Icon
				v-if="model"
				name="lucide:check"
				:class="['shrink-0', sizeClasses[size].icon]"
				aria-hidden="true"
			/>
		</span>

		<!-- Label e descrição -->
		<span v-if="label || description" class="flex flex-col gap-0.5">
			<span v-if="label" class="text-foreground text-sm leading-tight font-medium">
				{{ label }}
			</span>
			<span v-if="description" class="text-muted-foreground text-xs leading-snug">
				{{ description }}
			</span>
		</span>
	</label>
</template>
