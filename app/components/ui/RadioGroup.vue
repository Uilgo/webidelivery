<script setup lang="ts">
/**
 * UiRadioGroup — Agrupamento de radio buttons do design system WebiDelivery
 *
 * Gerencia o v-model e passa para os radios filhos via provide/inject.
 * Organiza os radios verticalmente ou horizontalmente com espaçamento consistente.
 *
 *   - options:      lista de opções do tipo { value, label, description?, disabled? }
 *   - label:        label do grupo (opcional)
 *   - orientation:  direção do layout (vertical | horizontal), padrão: "vertical"
 *   - color:        cor dos radios (primary | secondary | success | info | warning | error), padrão: "primary"
 *   - size:         tamanho dos radios (sm | md | lg), padrão: "md"
 *   - disabled:     desabilita todos os radios do grupo (padrão: false)
 *   - error:        ativa estado de erro visual (padrão: false)
 *   - hint:         texto auxiliar abaixo do grupo (opcional)
 *
 * Model:
 *   - modelValue:   valor selecionado no grupo
 *
 * Uso:
 *   <UiRadioGroup
 *     v-model="plano"
 *     label="Escolha o plano"
 *     :options="[
 *       { value: 'basico', label: 'Básico', description: 'Gratuito' },
 *       { value: 'pro', label: 'Pro', description: 'R$ 29/mês' }
 *     ]"
 *   />
 */

type Color = "primary" | "secondary" | "success" | "info" | "warning" | "error";
type Size = "sm" | "md" | "lg";
type Orientation = "vertical" | "horizontal";

export interface RadioOption {
	value: string | number | boolean;
	label: string;
	description?: string;
	disabled?: boolean;
	color?: Color;
}

withDefaults(
	defineProps<{
		options: RadioOption[];
		label?: string;
		orientation?: Orientation;
		color?: Color;
		size?: Size;
		disabled?: boolean;
		error?: boolean;
		hint?: string;
	}>(),
	{
		orientation: "vertical",
		color: "primary",
		size: "md",
		disabled: false,
		error: false,
		label: undefined,
		hint: undefined,
	},
);

// ID estável para acessibilidade
const groupId = useId();

// v-model bidirecional
const model = defineModel<string | number | boolean>();

// Mapa de espaçamento por orientação
const orientationClasses: Record<Orientation, string> = {
	vertical: "flex flex-col gap-3",
	horizontal: "flex flex-wrap items-center gap-4",
};

// Mapas de tamanho e cor do radio individual
const sizeClasses: Record<Size, { box: string; dot: string }> = {
	sm: { box: "size-4", dot: "size-1.5" },
	md: { box: "size-[18px]", dot: "size-2" },
	lg: { box: "size-5", dot: "size-2.5" },
};

const colorBorderMap: Record<Color, string> = {
	primary: "border-primary",
	secondary: "border-secondary",
	success: "border-success",
	info: "border-info",
	warning: "border-warning",
	error: "border-error",
};

const colorDotMap: Record<Color, string> = {
	primary: "bg-primary",
	secondary: "bg-secondary",
	success: "bg-success",
	info: "bg-info",
	warning: "bg-warning",
	error: "bg-error",
};
</script>

<template>
	<fieldset
		:id="groupId"
		:disabled="disabled"
		:aria-describedby="hint ? `${groupId}-hint` : undefined"
		class="flex flex-col gap-2"
	>
		<!-- Label do grupo -->
		<legend v-if="label" class="text-foreground mb-1 text-sm font-medium">
			{{ label }}
		</legend>

		<!-- Container dos radios (vertical ou horizontal) -->
		<div :class="orientationClasses[orientation]" role="radiogroup">
			<label
				v-for="(option, idx) in options"
				:key="`${groupId}-${idx}`"
				:for="`${groupId}-${idx}`"
				:class="[
					'flex w-max gap-2.5 select-none',
					option.description ? 'items-start' : 'items-center',
					disabled || option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
				]"
			>
				<input
					:id="`${groupId}-${idx}`"
					v-model="model"
					type="radio"
					:value="option.value"
					:name="groupId"
					:disabled="disabled || option.disabled"
					class="peer sr-only"
				/>

				<span
					:class="[
						'inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
						sizeClasses[size].box,
						model === option.value ? colorBorderMap[option.color || color] : 'border-border',
						option.description ? 'mt-0.5' : '',
					]"
					aria-hidden="true"
				>
					<span
						v-if="model === option.value"
						:class="[
							'rounded-full transition-transform duration-150',
							sizeClasses[size].dot,
							colorDotMap[option.color || color],
						]"
					></span>
				</span>

				<span v-if="option.label || option.description" class="flex flex-col gap-0.5">
					<span v-if="option.label" class="text-foreground text-sm leading-tight font-medium">
						{{ option.label }}
					</span>
					<span v-if="option.description" class="text-muted-foreground text-xs leading-snug">
						{{ option.description }}
					</span>
				</span>
			</label>
		</div>

		<!-- Hint / mensagem auxiliar -->
		<p
			v-if="hint"
			:id="`${groupId}-hint`"
			:class="['text-xs', error ? 'text-error' : 'text-muted-foreground']"
		>
			{{ hint }}
		</p>
	</fieldset>
</template>
