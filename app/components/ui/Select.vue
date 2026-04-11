<script setup lang="ts">
/**
 * UiSelect — Campo de seleção base do design system WebiDelivery
 *
 * Simula um <select> nativo com visual customizado alinhado ao UiInput.
 * Abre um painel de opções ao clicar. Fecha ao clicar fora ou ao selecionar.
 *
 * Props:
 *   - options:      lista de opções { label, value, icon?, disabled? }
 *   - placeholder:  texto quando nenhuma opção selecionada
 *   - label:        label acima do campo
 *   - size:         tamanho (sm | md | lg), padrão: "md"
 *   - error:        ativa estado de erro visual
 *   - hint:         texto auxiliar abaixo do campo
 *   - disabled:     desabilita o campo
 *   - id:           id do elemento (gerado automaticamente se omitido)
 *
 * Model:
 *   - modelValue: valor selecionado (string)
 *
 * Uso:
 *   <UiSelect v-model="status" :options="statusOptions" label="Status" placeholder="Selecione..." />
 */

// Tipo de cada opção
export interface SelectOption {
	label: string;
	value: string;
	icon?: string;
	disabled?: boolean;
}

type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		options: SelectOption[];
		placeholder?: string;
		label?: string;
		size?: Size;
		error?: boolean;
		hint?: string;
		disabled?: boolean;
		id?: string;
		fullWidth?: boolean;
	}>(),
	{
		placeholder: "Selecione...",
		size: "md",
		error: false,
		disabled: false,
		fullWidth: true,
		label: undefined,
		hint: undefined,
		id: undefined,
	},
);

// v-model bidirecional
const model = defineModel<string>();

// Controle de abertura e posicionamento
const open = ref(false);
const placement = ref<"top" | "bottom">("bottom");
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const { bottom: triggerBottom } = useElementBounding(triggerRef);
const { height: windowHeight } = useWindowSize();

// Fecha ao clicar fora
onClickOutside(containerRef, () => (open.value = false));

// Detecta se deve abrir para cima ou para baixo toda vez que abrir
watch(open, (val) => {
	if (val) {
		const spaceBelow = windowHeight.value - triggerBottom.value;
		// Se houver menos de 300px abaixo, abre para cima
		placement.value = spaceBelow < 300 ? "top" : "bottom";
	}
});

// ID estável para acessibilidade via useId() do Nuxt
const generatedId = useId();
const selectId = computed(() => props.id ?? generatedId);

// Opção selecionada atualmente
const selectedOption = computed(() => props.options.find((o) => o.value === model.value));

// Mapa de tamanhos (independente, replicando a escala do sistema)
const sizeClasses: Record<Size, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm", // 40px — Padrão
	lg: "h-12 px-4 text-base",
};

// Classes do trigger
// Classes do trigger (nativas)
const triggerClasses = computed(() => [
	"flex items-center w-full rounded border bg-card text-foreground gap-2 transition-colors cursor-pointer select-none whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/20",
	sizeClasses[props.size],
	props.error ? "border-error" : "border-border",
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
]);

// Seleciona uma opção e fecha o painel
function selectOption(option: SelectOption) {
	if (option.disabled) return;
	model.value = option.value;
	open.value = false;
}

// Navegação por teclado
function handleKeydown(e: KeyboardEvent) {
	if (!open.value) {
		if (e.key === "ArrowDown" || e.key === "Enter" || e.key === "Space") {
			e.preventDefault();
			open.value = true;
		}
		return;
	}

	const availableOptions = props.options.filter((o) => !o.disabled);
	const currentIndex = availableOptions.findIndex((o) => o.value === model.value);

	if (e.key === "ArrowDown") {
		e.preventDefault();
		const nextIndex = (currentIndex + 1) % availableOptions.length;
		const target = availableOptions[nextIndex];
		if (target) model.value = target.value;
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		const prevIndex = (currentIndex - 1 + availableOptions.length) % availableOptions.length;
		const target = availableOptions[prevIndex];
		if (target) model.value = target.value;
	} else if (e.key === "Enter" || e.key === "Escape") {
		e.preventDefault();
		open.value = false;
	}
}
</script>

<template>
	<div ref="containerRef" class="relative flex w-full flex-col gap-1.5">
		<!-- Label -->
		<label v-if="label" :for="selectId" class="text-foreground text-sm font-medium">
			{{ label }}
		</label>

		<!-- Container do campo (Botão + Painel) -->
		<div class="relative">
			<!-- Trigger (simula o input) -->
			<button
				:id="selectId"
				ref="triggerRef"
				type="button"
				:disabled="disabled"
				:aria-expanded="open"
				:aria-invalid="error"
				:aria-describedby="hint ? `${selectId}-hint` : undefined"
				aria-haspopup="listbox"
				:class="triggerClasses"
				@click="open = !open"
				@keydown="handleKeydown"
			>
				<!-- Ícone da opção selecionada -->
				<Icon
					v-if="selectedOption?.icon"
					:name="selectedOption.icon"
					class="text-muted-foreground size-4 shrink-0"
					aria-hidden="true"
				/>

				<!-- Texto selecionado ou placeholder -->
				<span
					class="flex-1 truncate text-left"
					:class="selectedOption ? 'text-foreground' : 'text-muted-foreground'"
				>
					{{ selectedOption?.label ?? placeholder }}
				</span>

				<!-- Chevron -->
				<Icon
					name="lucide:chevrons-up-down"
					class="text-muted-foreground size-4 shrink-0"
					aria-hidden="true"
				/>
			</button>

			<!-- Painel de opções -->
			<Transition
				enter-active-class="transition-all duration-150 ease-out"
				:enter-from-class="
					placement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
				enter-to-class="opacity-100 scale-100 translate-y-0"
				leave-active-class="transition-all duration-100 ease-in"
				leave-from-class="opacity-100 scale-100 translate-y-0"
				:leave-to-class="
					placement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
			>
				<div
					v-if="open"
					role="listbox"
					:class="[
						'border-border bg-popover absolute left-0 z-50 flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded border p-1 shadow-md',
						fullWidth ? 'w-full' : 'min-w-44',
						placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
					]"
				>
					<button
						v-for="option in options"
						:key="option.value"
						type="button"
						role="option"
						:aria-selected="option.value === model"
						:disabled="option.disabled"
						:class="[
							'flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors',
							option.value === model
								? 'bg-accent text-foreground font-medium'
								: option.disabled
									? 'text-muted-foreground cursor-not-allowed opacity-50'
									: 'text-foreground hover:bg-accent',
						]"
						@click="selectOption(option)"
					>
						<Icon
							v-if="option.icon"
							:name="option.icon"
							class="size-4 shrink-0"
							aria-hidden="true"
						/>
						<span class="flex-1 text-left">{{ option.label }}</span>
						<Icon
							v-if="option.value === model"
							name="lucide:check"
							class="text-primary size-4 shrink-0"
							aria-hidden="true"
						/>
					</button>
				</div>
			</Transition>
		</div>

		<!-- Hint / Erro -->
		<p
			v-if="hint"
			:id="`${selectId}-hint`"
			:class="['text-xs', error ? 'text-error' : 'text-muted-foreground']"
		>
			{{ hint }}
		</p>
	</div>
</template>
