<script setup lang="ts">
/**
 * DataCard — Item individual no modo grade (card).
 *
 * Exibe logo/ícone, título, badges de status e menu de ações.
 *
 * Props:
 *   - titulo:    texto principal do card
 *   - subtitulo: texto secundário opcional
 *   - imagem:    URL da imagem/logo
 *   - icone:     ícone fallback quando não há imagem
 *   - status:    texto do badge de status
 *   - corStatus: cor do badge (success | warning | error | info | neutral)
 *   - acoes:     itens do menu de ações
 *
 * Emits:
 *   - acao: item selecionado no menu
 *   - click: clique no card
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

interface AcaoMenu extends Acao {
	color?: string;
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

const acoesMenu = computed<AcaoMenu[]>(() =>
	props.acoes.map((a) => ({
		...a,
		color: a.destructive ? "error" : undefined,
	})),
);

function onSelect(item: AcaoMenu): void {
	emit("acao", item.value);
}
</script>

<template>
	<div
		class="bg-card border-border group relative flex cursor-pointer flex-col rounded-lg border shadow-sm transition-shadow hover:shadow-md"
		@click="emit('click')"
	>
		<!-- Imagem / Ícone -->
		<div class="bg-muted flex h-32 items-center justify-center overflow-hidden rounded-t-lg">
			<img v-if="imagem" :src="imagem" :alt="titulo" class="h-full w-full object-cover" />
			<Icon v-else :name="icone" class="text-muted-foreground size-10" />
		</div>

		<!-- Conteúdo -->
		<div class="flex flex-1 flex-col gap-1 p-4">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<p class="text-foreground truncate text-sm font-semibold">{{ titulo }}</p>
					<p v-if="subtitulo" class="text-muted-foreground truncate text-xs">{{ subtitulo }}</p>
				</div>

				<!-- Menu de ações -->
				<UiDropdown v-if="acoes.length" :items="acoesMenu" align="right" @select="onSelect">
					<template #trigger>
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground hover:bg-accent -mr-1 inline-flex size-7 items-center justify-center rounded-md transition-colors"
							aria-label="Ações"
							@click.stop
						>
							<Icon name="lucide:more-horizontal" class="size-4" />
						</button>
					</template>
				</UiDropdown>
			</div>

			<!-- Badge de status -->
			<UiBadge v-if="status" :color="corStatus" variant="soft" size="sm" class="self-start">
				{{ status }}
			</UiBadge>
		</div>
	</div>
</template>
