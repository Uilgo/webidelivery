<script setup lang="ts">
/**
 * DataContainer — Container PAI que alterna entre CardView e ListView.
 *
 * Recebe os items e o viewMode atual e renderiza o componente correto.
 *
 * Props:
 *   - items:      lista de itens
 *   - viewMode:   modo de visualização ('card' | 'list')
 *   - colunas:    cabeçalhos extras para o modo lista
 *   - carregando: exibe skeletons
 *
 * Emits:
 *   - acao:  { item, value }
 *   - click: item clicado
 *
 * Slots:
 *   - colunas(item): colunas extras no modo lista
 *   - empty: estado vazio customizado
 */

type ViewMode = "card" | "list";

interface Item {
	id: string;
	titulo: string;
	subtitulo?: string;
	imagem?: string;
	icone?: string;
	status?: string;
	corStatus?: "success" | "warning" | "error" | "info" | "neutral";
	acoes?: {
		label: string;
		value: string;
		icon?: string;
		separator?: boolean;
		destructive?: boolean;
	}[];
}

withDefaults(
	defineProps<{
		items?: Item[];
		viewMode?: ViewMode;
		colunas?: string[];
		carregando?: boolean;
	}>(),
	{
		items: () => [],
		viewMode: "card",
		colunas: () => [],
		carregando: false,
	},
);

const emit = defineEmits<{
	acao: [payload: { item: Item; value: string }];
	click: [item: Item];
}>();
</script>

<template>
	<CardView
		v-if="viewMode === 'card'"
		:items="items"
		:carregando="carregando"
		@acao="emit('acao', $event)"
		@click="emit('click', $event)"
	>
		<template #empty>
			<slot name="empty"></slot>
		</template>
	</CardView>

	<ListView
		v-else
		:items="items"
		:colunas="colunas"
		:carregando="carregando"
		@acao="emit('acao', $event)"
		@click="emit('click', $event)"
	>
		<template #colunas="{ item }">
			<slot name="colunas" :item="item"></slot>
		</template>
		<template #empty>
			<slot name="empty"></slot>
		</template>
	</ListView>
</template>
