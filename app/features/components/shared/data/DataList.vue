<script setup lang="ts">
/**
 * DataList — Item individual no modo tabela (row).
 */

import { computed } from "vue";

type CorStatus = "success" | "warning" | "error" | "info" | "neutral";

interface Acao {
	label: string;
	value: string;
	icon?: string;
	separator?: boolean;
	destructive?: boolean;
}

const props = withDefaults(
	defineProps<{
		titulo: string;
		subtitulo?: string;
		imagem?: string;
		icone?: string;
		status?: string;
		corStatus?: CorStatus;
		acoes?: Acao[];
	}>(),
	{
		subtitulo: undefined,
		imagem: undefined,
		icone: "lucide:box",
		status: undefined,
		corStatus: "neutral",
		acoes: () => [],
	},
);

const emit = defineEmits<{
	acao: [value: string];
	click: [];
}>();

const acoesMenu = computed(() =>
	props.acoes.map((a) => ({
		...a,
		color: a.destructive ? "error" : undefined,
	})),
);
</script>

<template>
	<tr
		class="border-border hover:bg-muted/50 cursor-pointer border-b transition-colors last:border-0"
		@click="emit('click')"
	>
		<!-- Imagem + Título -->
		<td class="px-4 py-3">
			<div class="flex items-center gap-3">
				<div
					class="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
				>
					<img v-if="imagem" :src="imagem" :alt="titulo" class="h-full w-full object-cover" />
					<Icon v-else :name="icone" class="text-muted-foreground size-4" />
				</div>
				<div class="min-w-0">
					<p class="text-foreground truncate text-sm font-medium">{{ titulo }}</p>
					<p v-if="subtitulo" class="text-muted-foreground truncate text-xs">{{ subtitulo }}</p>
				</div>
			</div>
		</td>

		<!-- Slot para colunas extras -->
		<slot></slot>

		<!-- Status -->
		<td class="px-4 py-3">
			<UiBadge v-if="status" :color="corStatus" variant="soft" size="sm">
				{{ status }}
			</UiBadge>
		</td>

		<!-- Ações -->
		<td class="px-4 py-3 text-right" @click.stop>
			<UiDropdown
				v-if="acoes.length"
				:items="acoesMenu"
				align="right"
				@select="(item) => emit('acao', item.value)"
			>
				<template #trigger>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
						aria-label="Ações"
					>
						<Icon name="lucide:more-horizontal" class="size-4" />
					</button>
				</template>
			</UiDropdown>
		</td>
	</tr>
</template>
