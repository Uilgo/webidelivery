<script setup lang="ts">
/**
 * UiColorPicker — Seletor de cores moderno WebiDelivery
 *
 * Contém um input com preview da cor e um popover com entrada manual
 * de código Hex e uma grade com paleta de cores predefinidas.
 */
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";

interface Props {
	/** Valor em formato Hexadecimal (ex: #3B82F6) */
	modelValue?: string;
	/** Placeholder do input */
	placeholder?: string;
	/** Tamanho do componente */
	size?: "sm" | "md" | "lg" | "xl";
	/** Estado desabilitado */
	disabled?: boolean;
	/** Estado de erro */
	invalid?: boolean;
	/** Campo obrigatório */
	required?: boolean;
	/** ID customizado */
	id?: string;
	/** Nome do campo */
	name?: string;
	/** Expandir para preencher toda a largura (remove max-width e iguala dropdown ao trigger) */
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
	placeholder: "Selecione a cor",
	size: "md",
	disabled: false,
	invalid: false,
	required: false,
	id: undefined,
	name: undefined,
	fullWidth: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

// ID generator para o Form
const fieldId = inject<string>("formfield-id", "");
const uid = useId();
const computedId = computed(() => props.id || fieldId || `colorpicker-${uid}`);

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLDivElement | null>(null);
const hexInput = ref("");

// Paleta de cores fixas sugeridas (bem vibrantes e baseadas em Tailwind 500/600)
const presetColors = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#eab308",
	"#84cc16",
	"#22c55e",
	"#10b981",
	"#14b8a6",
	"#06b6d4",
	"#0ea5e9",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#a855f7",
	"#d946ef",
	"#ec4899",
	"#f43f5e",
	"#64748b",
	"#71717a",
	"#09090b",
];

// Quando abre carrega o valor exato no input de hex
watch(isOpen, (aberto) => {
	if (aberto) {
		hexInput.value = props.modelValue || "";
	}
});

watch(
	() => props.modelValue,
	(val) => {
		hexInput.value = val || "";
	},
);

// Toggle e controle
const toggle = () => {
	if (props.disabled) return;
	isOpen.value = !isOpen.value;
};

const fechar = () => {
	isOpen.value = false;
};

const applyHexFromInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	let val = target.value.trim();

	if (val && !val.startsWith("#")) val = "#" + val;

	// Expressão regular simples para HEX de 3, 6 ou 8 caracteres
	if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(val) || val === "") {
		emit("update:modelValue", val);
	} else {
		// fallback volta p original se for string inválida
		hexInput.value = props.modelValue || "";
	}
};

const selectColor = (hex: string) => {
	emit("update:modelValue", hex);
	fechar();
};

const limpar = () => {
	emit("update:modelValue", "");
	fechar();
};

// Fechar ao clicar fora
const handleClickOutside = (e: MouseEvent) => {
	const target = e.target as Node;
	if (isOpen.value && !popoverRef.value?.contains(target) && !triggerRef.value?.contains(target)) {
		fechar();
	}
};

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));

// Estilização condicional
const sizeMap: Record<string, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
	xl: "h-14 px-4 text-lg",
};

const triggerClasses = computed(() => {
	const base = [
		"flex items-center gap-2 w-full rounded border bg-card text-foreground transition-all cursor-pointer select-none whitespace-nowrap outline-none outline-0",
		sizeMap[props.size] || sizeMap.md,
	];

	if (props.invalid) {
		base.push("border-destructive ring-1 ring-destructive/50");
	} else if (isOpen.value) {
		base.push("border-primary ring-1 ring-primary/20");
	} else {
		base.push("border-border");
	}

	if (props.disabled) {
		base.push("opacity-50 cursor-not-allowed");
	} else if (!props.invalid && !isOpen.value) {
		base.push("hover:border-neutral-400 dark:hover:border-neutral-500");
	}

	return base.join(" ");
});
</script>

<template>
	<div class="relative" :class="fullWidth ? 'w-full' : 'w-[240px]'">
		<!-- Trigger Box -->
		<div
			:id="computedId"
			ref="triggerRef"
			:class="triggerClasses"
			tabindex="0"
			@click="toggle"
			@keydown.enter.prevent="toggle"
			@keydown.space.prevent="toggle"
		>
			<!-- Color Dot/Circle (Preview) -->
			<div
				class="border-border flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm"
				:style="modelValue ? `background-color: ${modelValue}` : 'background-color: transparent'"
			>
				<div v-if="!modelValue" class="h-px w-full -rotate-45 bg-red-500"></div>
			</div>

			<span
				v-if="modelValue"
				class="text-foreground flex-1 truncate text-left font-medium tracking-wider uppercase"
			>
				{{ modelValue }}
			</span>
			<span v-else class="text-muted-foreground flex-1 truncate text-left">{{ placeholder }}</span>

			<Icon
				name="lucide:chevron-down"
				:class="[
					'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
					isOpen && 'rotate-180',
				]"
			/>

			<!-- Hidden input para form actions nativas -->
			<input type="hidden" :name="name" :value="modelValue" :required="required" />
		</div>

		<!-- Popover Selector -->
		<Transition
			enter-active-class="transition-all duration-200 ease-out"
			enter-from-class="opacity-0 scale-95 -translate-y-1"
			enter-to-class="opacity-100 scale-100 translate-y-0"
			leave-active-class="transition-all duration-150 ease-in"
			leave-from-class="opacity-100 scale-100 translate-y-0"
			leave-to-class="opacity-0 scale-95 -translate-y-1"
		>
			<div
				v-if="isOpen"
				ref="popoverRef"
				class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-full rounded-lg border p-4 shadow-lg"
			>
				<!-- Configuração manual de cor -->
				<div class="mb-4">
					<p class="text-muted-foreground mb-1.5 text-xs font-semibold">Cor personalizada (Hex)</p>
					<div class="flex items-center gap-2">
						<!-- Native Color Input fallback icon-->
						<label
							for="colorpicker-native-input"
							class="border-border relative block h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded border shadow-sm"
							:style="{ backgroundColor: modelValue || '#ffffff' }"
						>
							<input
								id="colorpicker-native-input"
								type="color"
								class="pointer-events-none absolute h-0 w-0 opacity-0"
								:value="modelValue"
								@input="(e) => selectColor((e.target as HTMLInputElement).value)"
							/>
						</label>

						<input
							v-model="hexInput"
							type="text"
							placeholder="#000000"
							class="bg-muted/50 border-border text-foreground focus:border-primary focus:ring-primary/30 h-8 max-w-full min-w-0 flex-1 rounded border px-2 text-sm uppercase transition-shadow focus:ring-1 focus:outline-none"
							@blur="applyHexFromInput"
							@keydown.enter.prevent="applyHexFromInput"
						/>
					</div>
				</div>

				<!-- Grid de Preset Colors -->
				<div>
					<p class="text-muted-foreground mb-2 text-xs font-semibold">Cores sugeridas</p>
					<div class="grid grid-cols-5 gap-2">
						<button
							v-for="color in presetColors"
							:key="color"
							type="button"
							class="focus:ring-primary h-8 w-8 rounded-md border border-black/10 shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-1 focus:outline-none dark:border-white/10 dark:focus:ring-offset-zinc-900"
							:style="{ backgroundColor: color }"
							:title="color"
							@click="selectColor(color)"
						>
							<Icon
								v-if="modelValue?.toLowerCase() === color"
								name="lucide:check"
								class="m-auto size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] filter"
							/>
						</button>
					</div>
				</div>

				<!-- Footer -->
				<div class="border-border mt-4 flex items-center justify-between border-t pt-3">
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground text-xs font-medium outline-0 transition-colors outline-none"
						@click="limpar"
					>
						Remover cor
					</button>
					<button
						type="button"
						class="text-primary hover:text-primary/80 text-xs font-medium outline-0 transition-colors outline-none"
						@click="fechar"
					>
						Concluído
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
div[tabindex],
button {
	outline: none !important;
	box-shadow: none !important;
	-webkit-tap-highlight-color: transparent !important;
}

div[tabindex]:focus,
div[tabindex]:focus-visible,
div[tabindex]:focus-within,
button:focus,
button:focus-visible {
	outline: none !important;
	box-shadow: none !important;
}
</style>
