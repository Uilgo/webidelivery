<script setup lang="ts">
/**
 * CardView — Layout em grade que itera items e renderiza DataCard.
 *
 * Props:
 *   - items:      lista de itens a renderizar
 *   - carregando: exibe skeletons
 *
 * Emits:
 *   - acao:  { item, value } — ação do menu de um item
 *   - click: item clicado
 *
 * Slots:
 *   - empty: conteúdo quando não há itens
 */

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
		carregando?: boolean;
	}>(),
	{
		items: () => [],
		carregando: false,
	},
);

const emit = defineEmits<{
	acao: [payload: { item: Item; value: string }];
	click: [item: Item];
}>();
</script>

<template>
	<!-- Skeletons -->
	<div
		v-if="carregando"
		class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
	>
		<UiSkeleton v-for="i in 8" :key="i" class="h-48 w-full" rounded="lg" />
	</div>

	<!-- Vazio -->
	<div v-else-if="!items.length">
		<slot name="empty">
			<UiEmptyState
				icon="lucide:inbox"
				title="Nenhum item encontrado"
				description="Tente ajustar os filtros ou crie um novo item."
			/>
		</slot>
	</div>

	<!-- Grade -->
	<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		<DataCard
			v-for="item in items"
			:key="item.id"
			:titulo="item.titulo"
			:subtitulo="item.subtitulo"
			:imagem="item.imagem"
			:icone="item.icone"
			:status="item.status"
			:cor-status="item.corStatus"
			:acoes="item.acoes"
			@acao="(value: string) => emit('acao', { item, value })"
			@click="emit('click', item)"
		/>
	</div>
</template>
