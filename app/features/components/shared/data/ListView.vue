<script setup lang="ts">
/**
 * ListView — Layout em tabela que itera items e renderiza DataList.
 *
 * Props:
 *   - items:      lista de itens
 *   - colunas:    cabeçalhos extras da tabela (além de Nome e Status/Ações)
 *   - carregando: exibe skeletons
 *
 * Emits:
 *   - acao:  { item, value }
 *   - click: item clicado
 *
 * Slots:
 *   - colunas(item): colunas extras por linha
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
		colunas?: string[];
		carregando?: boolean;
	}>(),
	{
		items: () => [],
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
	<div class="bg-card border-border overflow-hidden rounded-lg border shadow-sm">
		<!-- Skeletons -->
		<div v-if="carregando" class="divide-border divide-y">
			<div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3">
				<UiSkeleton class="size-9 shrink-0" rounded="lg" />
				<div class="flex flex-1 flex-col gap-1.5">
					<UiSkeleton class="h-4 w-40" />
					<UiSkeleton class="h-3 w-24" />
				</div>
				<UiSkeleton class="h-5 w-16" rounded="full" />
			</div>
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

		<!-- Tabela -->
		<table v-else class="w-full">
			<thead>
				<tr class="border-border border-b">
					<th
						class="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>
						Nome
					</th>
					<th
						v-for="col in colunas"
						:key="col"
						class="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>
						{{ col }}
					</th>
					<th
						class="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>
						Status
					</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				<DataList
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
				>
					<slot name="colunas" :item="item"></slot>
				</DataList>
			</tbody>
		</table>
	</div>
</template>
