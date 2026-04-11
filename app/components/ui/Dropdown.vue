<script setup lang="ts">
/**
 * UiDropdown — Menu suspenso genérico para ações
 *
 * Exibe um botão trigger que, ao clicar, abre uma lista de itens de ação.
 * Fecha ao clicar fora ou ao selecionar um item.
 *
 * Props:
 *   - items:       lista de itens do menu
 *   - label:       texto do botão trigger (opcional, pode usar slot)
 *   - icon:        ícone do botão trigger (padrão: "lucide:chevron-down")
 *   - size:        tamanho do trigger (sm | md | lg), padrão: "md"
 *   - align:       alinhamento do painel (left | right), padrão: "left"
 *   - disabled:    desabilita o trigger
 *
 * Eventos:
 *   - select: emitido ao clicar em um item, com o item como payload
 *
 * Uso:
 *   <UiDropdown :items="menuItems" label="Ações" @select="handleAction" />
 */

// Tipo de cada item do dropdown
export interface DropdownItem {
	label: string;
	value: string;
	icon?: string;
	disabled?: boolean;
	separator?: boolean;
}

type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		items: DropdownItem[];
		label?: string;
		icon?: string;
		size?: Size;
		align?: "left" | "right";
		side?: "top-bottom" | "right"; // "right" = abre à direita do trigger, base alinhada ao bottom
		disabled?: boolean;
		fullWidth?: boolean;
	}>(),
	{
		icon: "lucide:chevron-down",
		size: "md",
		align: "left",
		side: "top-bottom",
		disabled: false,
		fullWidth: false,
		label: undefined,
	},
);

const emit = defineEmits<{ select: [item: DropdownItem] }>();
const slots = useSlots();

// Controle de abertura e posicionamento
const open = ref(false);
const placement = ref<"top" | "bottom">("bottom");
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownId = useId();

const {
	bottom: triggerBottom,
	top: triggerTop,
	left: triggerLeft,
	right: triggerRight,
	width: triggerWidth,
} = useElementBounding(triggerRef);
const { height: windowHeight } = useWindowSize();

// Fecha ao clicar fora
onClickOutside(containerRef, () => (open.value = false));

// Detecta se deve abrir para cima ou para baixo toda vez que abrir
watch(open, (val) => {
	if (val) {
		const spaceBelow = windowHeight.value - triggerBottom.value;
		placement.value = spaceBelow < 280 ? "top" : "bottom";
	}
});

// Posição absoluta do painel calculada a partir do triggerRef (para Teleport no body)
const panelStyle = computed(() => {
	const width = props.fullWidth ? `${triggerWidth.value}px` : undefined;

	// Abertura lateral direita: painel à direita do trigger, base alinhada ao bottom do trigger
	if (props.side === "right") {
		return {
			left: `${triggerRight.value + 16}px`,
			bottom: `${windowHeight.value - triggerBottom.value}px`,
			// Nunca herda largura do trigger no modo lateral
		};
	}

	// Abertura vertical (padrão)
	if (placement.value === "bottom") {
		return {
			top: `${triggerBottom.value + 4}px`,
			left: props.align === "right" ? undefined : `${triggerLeft.value}px`,
			right: props.align === "right" ? `${window.innerWidth - triggerRight.value}px` : undefined,
			width,
		};
	}
	return {
		bottom: `${windowHeight.value - triggerTop.value + 4}px`,
		left: props.align === "right" ? undefined : `${triggerLeft.value}px`,
		right: props.align === "right" ? `${window.innerWidth - triggerRight.value}px` : undefined,
		width,
	};
});

// Mapa de tamanhos alinhados com o Button
const sizeClasses: Record<Size, string> = {
	sm: "h-8 px-3 text-xs gap-1.5",
	md: "h-10 px-4 text-sm gap-2", // 40px — padrão
	lg: "h-12 px-6 text-base gap-2",
};

// Seleciona um item e fecha o dropdown
function selectItem(item: DropdownItem) {
	if (item.disabled) return;
	emit("select", item);
	open.value = false;
}

// Navegação por teclado
function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && open.value) {
		e.preventDefault();
		open.value = false;
	} else if (e.key === "Enter" || e.key === "Space") {
		if (slots.trigger) {
			// Se o slot trigger não tiver seu próprio listener, o click bubble fará o serviço
		}
	}
}
</script>

<template>
	<div ref="containerRef" class="relative inline-flex w-[inherit]">
		<!-- Trigger: Se o slot 'trigger' for fornecido, usamos ele sem envolver em outro <button> -->
		<template v-if="$slots.trigger">
			<div
				ref="triggerRef"
				class="inline-flex w-full cursor-pointer"
				@click="open = !open"
				@keydown="handleKeydown"
			>
				<slot name="trigger" :open="open"></slot>
			</div>
		</template>

		<!-- Caso contrário, renderiza o botão padrão do componente com classes nativas (independente) -->
		<button
			v-else
			:id="dropdownId"
			ref="triggerRef"
			type="button"
			:disabled="props.disabled"
			:aria-expanded="open"
			aria-haspopup="listbox"
			:class="[
				'border-border bg-card text-foreground hover:bg-accent focus-visible:ring-primary/20 inline-flex items-center justify-center rounded border font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 disabled:opacity-50',
				sizeClasses[props.size],
			]"
			@click="open = !open"
			@keydown="handleKeydown"
		>
			<span v-if="props.label">{{ props.label }}</span>
			<Icon
				:name="props.icon"
				class="size-4 shrink-0 transition-transform"
				:class="{ 'rotate-180': open }"
				aria-hidden="true"
			/>
		</button>

		<!-- Painel do Dropdown -->
		<Teleport to="body">
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
					:style="panelStyle"
					:class="[
						'border-border bg-popover fixed z-9999 flex flex-col gap-0.5 rounded border p-1 shadow-md',
						props.fullWidth && props.side !== 'right' ? '' : 'min-w-44',
					]"
				>
					<template v-for="item in items" :key="item.value">
						<!-- Separador -->
						<div v-if="item.separator" class="border-border my-1 border-t"></div>

						<!-- Item -->
						<button
							v-else
							type="button"
							role="option"
							:disabled="item.disabled"
							:class="[
								'flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors',
								item.disabled
									? 'text-muted-foreground cursor-not-allowed opacity-50'
									: 'text-foreground hover:bg-accent',
							]"
							@click="selectItem(item)"
						>
							<Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
							<span class="flex-1 text-left">{{ item.label }}</span>
						</button>
					</template>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
