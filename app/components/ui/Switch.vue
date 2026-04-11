<script setup lang="ts">
/**
 * UiSwitch — Toggle switch do design system WebiDelivery
 *
 * Alternador liga/desliga estilizado com animação suave.
 * Usa button nativo com role="switch" para máxima acessibilidade.
 *
 * Props:
 *   - label:        texto do label (opcional)
 *   - description:  texto auxiliar abaixo do label (opcional)
 *   - disabled:     desabilita o switch (padrão: false)
 *   - color:        cor quando ativo (primary | secondary | success | info | warning | error), padrão: "primary"
 *   - size:         tamanho do switch (sm | md | lg), padrão: "md"
 *   - labelSide:    posição do label (left | right), padrão: "right"
 *   - id:           id do botão (gerado automaticamente se omitido)
 *
 * Model:
 *   - modelValue:   booleano — estado do switch
 *
 * Uso:
 *   <UiSwitch v-model="ativo" label="Notificações" />
 *   <UiSwitch v-model="darkMode" label="Modo escuro" color="secondary" label-side="left" />
 *   <UiSwitch v-model="marketing" label="E-mails marketing" description="Receber promoções" />
 */

type Color = "primary" | "secondary" | "success" | "info" | "warning" | "error";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		label?: string;
		description?: string;
		disabled?: boolean;
		color?: Color;
		size?: Size;
		labelSide?: "left" | "right";
		id?: string;
	}>(),
	{
		disabled: false,
		color: "primary",
		size: "md",
		labelSide: "right",
		label: undefined,
		description: undefined,
		id: undefined,
	},
);

// v-model bidirecional
const model = defineModel<boolean>({ default: false });

// ID estável via useId()
const switchId = useId();
const effectiveId = computed(() => props.id ?? switchId);

// Alterna o estado
function toggle() {
	if (props.disabled) return;
	model.value = !model.value;
}

// Mapa de tamanhos — track + thumb
const sizeClasses: Record<Size, { track: string; thumb: string; translate: string }> = {
	sm: { track: "w-8 h-[18px]", thumb: "size-3.5", translate: "translate-x-[14px]" },
	md: { track: "w-10 h-[22px]", thumb: "size-[18px]", translate: "translate-x-[18px]" },
	lg: { track: "w-12 h-[26px]", thumb: "size-[22px]", translate: "translate-x-[22px]" },
};

// Mapa de cores do track quando ativo
const colorClasses: Record<Color, string> = {
	primary: "bg-primary",
	secondary: "bg-secondary",
	success: "bg-success",
	info: "bg-info",
	warning: "bg-warning",
	error: "bg-error",
};

// Classes do track
const trackClasses = computed(() => [
	"relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200",
	sizeClasses[props.size].track,
	model.value ? colorClasses[props.color] : "bg-muted-foreground/40",
	props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
]);

// Classes do thumb (bolinha)
const thumbClasses = computed(() => [
	"inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ml-0.5",
	sizeClasses[props.size].thumb,
	model.value ? sizeClasses[props.size].translate : "translate-x-0",
]);
</script>

<template>
	<div
		:class="[
			'inline-flex items-start gap-3 select-none',
			labelSide === 'left' ? 'flex-row-reverse' : '',
			disabled ? 'cursor-not-allowed' : '',
		]"
	>
		<!-- Botão switch -->
		<button
			:id="effectiveId"
			type="button"
			role="switch"
			:aria-checked="model"
			:aria-label="label"
			:disabled="disabled"
			:class="trackClasses"
			@click="toggle"
		>
			<span :class="thumbClasses" aria-hidden="true"></span>
		</button>

		<!-- Label e descrição -->
		<label
			v-if="label || description"
			:for="effectiveId"
			:class="['flex flex-col gap-0.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
		>
			<span v-if="label" class="text-foreground text-sm leading-tight font-medium">
				{{ label }}
			</span>
			<span v-if="description" class="text-muted-foreground text-xs leading-snug">
				{{ description }}
			</span>
		</label>
	</div>
</template>
