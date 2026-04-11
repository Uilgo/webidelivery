<script setup lang="ts">
/**
 * UiRangeSlider — Controle deslizante do design system WebiDelivery
 *
 * Suporta modo Single (um nó, number) e Range (dois nós, [number, number]).
 * Utiliza <input type="range"> com gradientes dinâmicos no CSS.
 *
 * Props:
 *   - min:          valor mínimo (padrão: 0)
 *   - max:          valor máximo (padrão: 100)
 *   - step:         incremento entre valores (padrão: 1)
 *   - label:        label do slider (opcional)
 *   - showValue:    exibe valor atual ao lado do label (padrão: true)
 *   - hint:         texto auxiliar abaixo do slider (opcional)
 *   - disabled:     desabilita o controle (padrão: false)
 *   - color:        cor central/foco (primary | secondary | success | info | warning | error)
 *   - size:         tamanho do track (sm | md | lg)
 *   - formatValue:  formatação do(s) valor(es) exibido(s)
 *
 * Model:
 *   - modelValue:   number | [number, number]
 */

type Color = "primary" | "secondary" | "success" | "info" | "warning" | "error";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		hint?: string;
		disabled?: boolean;
		color?: Color;
		size?: Size;
		id?: string;
		formatValue?: (value: number) => string | number;
	}>(),
	{
		min: 0,
		max: 100,
		step: 1,
		showValue: true,
		disabled: false,
		color: "primary",
		size: "md",
		label: undefined,
		hint: undefined,
		id: undefined,
		formatValue: undefined,
	},
);

// v-model flexível (single = number, dual = array)
const model = defineModel<number | [number, number]>({ default: 0 });

// ID estável
const sliderId = useId();
const effectiveId = computed(() => props.id ?? sliderId);

// É modo Array (Dual Range)
const isRange = computed(() => Array.isArray(model.value));

// Wrappers para interagir com o model
const minModel = computed({
	get: () => (isRange.value ? (model.value as [number, number])[0] : (model.value as number)),
	set: (val) => {
		if (isRange.value) {
			const maxVal = (model.value as [number, number])[1];
			// Se estourar, puxa o mínimo pro max
			const bounded = Math.min(val as number, maxVal);
			model.value = [bounded, maxVal];
		} else {
			model.value = val as number;
		}
	},
});

const maxModel = computed({
	get: () => (isRange.value ? (model.value as [number, number])[1] : props.max),
	set: (val) => {
		if (isRange.value) {
			const minVal = (model.value as [number, number])[0];
			// Se baixar demais, puxa o máximo pro min
			const bounded = Math.max(val as number, minVal);
			model.value = [minVal, bounded];
		}
	},
});

// Z-index dinâmico no hover local: qual foi mexido por último?
// O native HTML5 `<input type="range">` duplo precisa de um z-index "stacking" ajustado ao clicar
const activeThumb = ref<"min" | "max">("max");

function bringToFront(thumb: "min" | "max") {
	activeThumb.value = thumb;
}

// Valor formatado (Single vs Dual)
const displayValue = computed(() => {
	const fallbackFormat = (v: number) => String(v);
	const format = props.formatValue ?? fallbackFormat;

	if (isRange.value) {
		const [minV, maxV] = model.value as [number, number];
		return `${format(minV)} - ${format(maxV)}`;
	}
	return format(model.value as number);
});

// Cores mapeadas
const colorMap: Record<Color, string> = {
	primary: "var(--primary)",
	secondary: "var(--secondary)",
	success: "var(--success)",
	info: "var(--info)",
	warning: "var(--warning)",
	error: "var(--error)",
};

// CSS Dinâmico (Track Gradient)
const trackStyle = computed(() => {
	const span = props.max - props.min;
	if (span <= 0) return {};
	const c = colorMap[props.color];

	if (isRange.value) {
		const [minV, maxV] = model.value as [number, number];
		const pctMin = ((minV - props.min) / span) * 100;
		const pctMax = ((maxV - props.min) / span) * 100;
		return {
			background: `linear-gradient(to right, var(--border) 0%, var(--border) ${pctMin}%, ${c} ${pctMin}%, ${c} ${pctMax}%, var(--border) ${pctMax}%, var(--border) 100%)`,
		};
	} else {
		const pct = (((model.value as number) - props.min) / span) * 100;
		return {
			background: `linear-gradient(to right, ${c} 0%, ${c} ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
		};
	}
});

// Classes de tamanho
const sizeClasses: Record<Size, string> = {
	sm: "h-1",
	md: "h-2",
	lg: "h-3",
};
</script>

<template>
	<div :class="['flex w-full flex-col gap-2', disabled ? 'opacity-50' : '']">
		<!-- Header -->
		<div v-if="label || showValue" class="flex items-center justify-between gap-2">
			<label :for="effectiveId" class="text-foreground text-sm font-medium">
				{{ label }}
			</label>
			<span v-if="showValue" class="text-muted-foreground text-sm tabular-nums">
				{{ displayValue }}
			</span>
		</div>

		<!-- Single Range -->
		<input
			v-if="!isRange"
			:id="effectiveId"
			v-model.number="minModel"
			type="range"
			:min="min"
			:max="max"
			:step="step"
			:disabled="disabled"
			:style="trackStyle"
			:class="[
				'ui-range-slider w-full cursor-pointer appearance-none rounded-full transition-opacity',
				sizeClasses[size],
				disabled ? 'cursor-not-allowed' : '',
			]"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-valuenow="minModel"
		/>

		<!-- Dual Range (Dois nós) -->
		<div v-else class="relative flex w-full items-center" :class="sizeClasses[size]">
			<!-- Fundo pseudo-track (Track Gradient + Height) -->
			<div
				class="pointer-events-none absolute inset-x-0 h-full w-full rounded-full"
				:style="trackStyle"
			></div>

			<!-- Input 1: Min -->
			<input
				:id="effectiveId"
				v-model.number="minModel"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				:disabled="disabled"
				:class="[
					'ui-range-slider-dual absolute h-full w-full appearance-none bg-transparent',
					disabled ? 'cursor-not-allowed' : '',
				]"
				:style="{ zIndex: activeThumb === 'min' ? 30 : 20 }"
				@mousedown="bringToFront('min')"
				@touchstart="bringToFront('min')"
			/>

			<!-- Input 2: Max -->
			<input
				v-model.number="maxModel"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				:disabled="disabled"
				:class="[
					'ui-range-slider-dual absolute h-full w-full appearance-none bg-transparent',
					disabled ? 'cursor-not-allowed' : '',
				]"
				:style="{ zIndex: activeThumb === 'max' ? 30 : 20 }"
				@mousedown="bringToFront('max')"
				@touchstart="bringToFront('max')"
			/>
		</div>

		<!-- Hint -->
		<p v-if="hint" class="text-muted-foreground text-xs">{{ hint }}</p>
	</div>
</template>

<style scoped>
/* ──────────────────────────────────────────────────────────
   SINGLE RANGE (1 Nó)
   ────────────────────────────────────────────────────────── */
.ui-range-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 18px;
	height: 18px;
	border-radius: 9999px;
	background: var(--card);
	border: 2px solid currentColor;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	cursor: pointer;
	color: v-bind("colorMap[color]");
	transition: box-shadow 0.15s ease;
}
.ui-range-slider::-moz-range-thumb {
	width: 18px;
	height: 18px;
	border-radius: 9999px;
	background: var(--card);
	border: 2px solid v-bind("colorMap[color]");
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	cursor: pointer;
	transition: box-shadow 0.15s ease;
}
.ui-range-slider::-moz-range-track {
	background: transparent;
	border: none;
}
.ui-range-slider::-webkit-slider-thumb:hover,
.ui-range-slider:focus::-webkit-slider-thumb {
	box-shadow: 0 0 0 4px color-mix(in oklch, v-bind("colorMap[color]") 20%, transparent);
}
.ui-range-slider::-moz-range-thumb:hover,
.ui-range-slider:focus::-moz-range-thumb {
	box-shadow: 0 0 0 4px color-mix(in oklch, v-bind("colorMap[color]") 20%, transparent);
}

/* ──────────────────────────────────────────────────────────
   DUAL RANGE (2 Nós)
   ────────────────────────────────────────────────────────── */
/* A input em si tem pointer-events: none, para que ambas ocupem o memo espaço */
.ui-range-slider-dual {
	pointer-events: none;
}

/* O thumb deve capturar eventos com pointer-events: auto */
.ui-range-slider-dual::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	pointer-events: auto; /* Permite arrastar o thumb */
	width: 18px;
	height: 18px;
	border-radius: 9999px;
	background: var(--card);
	border: 2px solid currentColor;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	cursor: grab;
	color: v-bind("colorMap[color]");
	transition: box-shadow 0.15s ease;
}
.ui-range-slider-dual::-webkit-slider-thumb:active {
	cursor: grabbing;
}
.ui-range-slider-dual::-moz-range-thumb {
	pointer-events: auto;
	width: 18px;
	height: 18px;
	border-radius: 9999px;
	background: var(--card);
	border: 2px solid v-bind("colorMap[color]");
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	cursor: grab;
	transition: box-shadow 0.15s ease;
}
.ui-range-slider-dual::-moz-range-thumb:active {
	cursor: grabbing;
}
.ui-range-slider-dual::-moz-range-track {
	background: transparent;
	border: none;
	pointer-events: none;
}
.ui-range-slider-dual::-webkit-slider-thumb:hover,
.ui-range-slider-dual:focus::-webkit-slider-thumb {
	box-shadow: 0 0 0 4px color-mix(in oklch, v-bind("colorMap[color]") 20%, transparent);
}
.ui-range-slider-dual::-moz-range-thumb:hover,
.ui-range-slider-dual:focus::-moz-range-thumb {
	box-shadow: 0 0 0 4px color-mix(in oklch, v-bind("colorMap[color]") 20%, transparent);
}
</style>
