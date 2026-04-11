<script setup lang="ts">
/**
 * UiTabs — Sistema de abas do design system WebiDelivery
 *
 * Organiza conteúdo em seções navegáveis por abas.
 * Apenas uma aba fica ativa por vez.
 *
 * Props:
 *   - items:       lista de abas { label, value, icon?, disabled? }
 *   - size:        tamanho das abas (sm | md | lg), padrão: "md"
 *   - variant:     estilo visual (line | solid | soft), padrão: "line"
 *   - grow:        abas expandem para preencher toda a largura (padrão: false)
 *
 * Model:
 *   - modelValue:  valor da aba ativa (string)
 *
 * Slots:
 *   - Dinâmicos: cada aba tem um slot com o nome do seu value
 *     Ex: <template #dashboard>Conteúdo do Dashboard</template>
 *
 * Uso:
 *   <UiTabs v-model="activeTab" :items="tabItems">
 *     <template #visao-geral>Conteúdo da Visão Geral</template>
 *     <template #pedidos>Conteúdo de Pedidos</template>
 *   </UiTabs>
 */

// Tipo de cada aba
export interface TabItem {
	label: string;
	value: string;
	icon?: string;
	disabled?: boolean;
}

type Size = "sm" | "md" | "lg";
type Variant = "line" | "solid" | "soft";

const props = withDefaults(
	defineProps<{
		items: TabItem[];
		size?: Size;
		variant?: Variant;
		grow?: boolean;
	}>(),
	{
		size: "md",
		variant: "solid",
		grow: false,
	},
);

// v-model bidirecional — aba ativa
const model = defineModel<string>();

// Se nenhuma aba estiver ativa, seleciona a primeira disponível
onMounted(() => {
	if (!model.value && props.items.length > 0) {
		const first = props.items.find((i) => !i.disabled);
		if (first) model.value = first.value;
	}
});

// Mapa de tamanhos das abas
const sizeClasses: Record<Size, string> = {
	sm: "px-3 py-1.5 text-xs gap-1.5",
	md: "px-4 py-2 text-sm gap-2", // Padrão
	lg: "px-5 py-2.5 text-base gap-2",
};

// Classes base do container das abas (por variante)
const containerClasses = computed(() => {
	const base = "flex";
	switch (props.variant) {
		case "line":
			return `${base} border-border border-b`;
		case "solid":
			return `${base} bg-muted rounded-lg p-1 gap-0.5`;
		case "soft":
			return `${base} gap-1`;
		default:
			return base;
	}
});

// Função que gera as classes de cada aba individual
function tabClasses(item: TabItem) {
	const isActive = model.value === item.value;
	const isDisabled = item.disabled;

	const base = [
		"inline-flex items-center justify-center font-medium transition-colors select-none whitespace-nowrap",
		sizeClasses[props.size],
		props.grow ? "flex-1" : "",
		isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
	];

	// Estilos por variante
	switch (props.variant) {
		case "line":
			return [
				...base,
				isActive
					? "border-primary text-primary border-b-2 -mb-px"
					: "border-transparent text-muted-foreground border-b-2 -mb-px hover:text-foreground",
			];
		case "solid":
			return [
				...base,
				"rounded-md",
				isActive
					? "bg-card text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground",
			];
		case "soft":
			return [
				...base,
				"rounded",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-accent hover:text-foreground",
			];
		default:
			return base;
	}
}

// Seleciona uma aba
function selectTab(item: TabItem) {
	if (item.disabled) return;
	model.value = item.value;
}

// Navegação por teclado (Setas)
function handleKeydown(e: KeyboardEvent) {
	const availableItems = props.items.filter((i) => !i.disabled);
	if (!availableItems.length) return;

	const currentIndex = availableItems.findIndex((i) => i.value === model.value);
	if (currentIndex === -1) return;

	let nextIndex = currentIndex;
	if (e.key === "ArrowRight") {
		nextIndex = (currentIndex + 1) % availableItems.length;
	} else if (e.key === "ArrowLeft") {
		nextIndex = (currentIndex - 1 + availableItems.length) % availableItems.length;
	} else if (e.key === "Home") {
		nextIndex = 0;
	} else if (e.key === "End") {
		nextIndex = availableItems.length - 1;
	} else {
		return;
	}

	e.preventDefault();
	const nextItem = availableItems[nextIndex];
	if (!nextItem) return;

	model.value = nextItem.value;
	// Foca o novo botão da aba
	nextTick(() => {
		const targetItem = availableItems[nextIndex];
		if (!targetItem) return;
		const originalIndex = props.items.indexOf(targetItem);
		if (originalIndex === -1) return;

		const el = document.getElementById(`${tabsId}-tab-${originalIndex}`);
		el?.focus();
	});
}

// IDs estáveis para acessibilidade (Tabs + Panels)
const tabsId = useId();
</script>

<template>
	<div class="flex w-full flex-col">
		<!-- Barra de abas -->
		<div :class="containerClasses" role="tablist" @keydown="handleKeydown">
			<button
				v-for="(item, index) in items"
				:id="`${tabsId}-tab-${index}`"
				:key="item.value"
				type="button"
				role="tab"
				:aria-selected="model === item.value"
				:aria-controls="`${tabsId}-panel-${index}`"
				:disabled="item.disabled"
				:class="tabClasses(item)"
				@click="selectTab(item)"
			>
				<Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
				<span>{{ item.label }}</span>
			</button>
		</div>

		<!-- Conteúdo da aba ativa -->
		<div>
			<template v-for="(item, index) in items" :key="item.value">
				<div
					v-if="model === item.value"
					:id="`${tabsId}-panel-${index}`"
					role="tabpanel"
					:aria-labelledby="`${tabsId}-tab-${index}`"
				>
					<slot :name="item.value"></slot>
				</div>
			</template>
		</div>
	</div>
</template>
