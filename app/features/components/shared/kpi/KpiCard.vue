<script setup lang="ts">
/**
 * KpiCard — Card de KPI para dashboards.
 *
 * Exibe um indicador chave com título, valor, variação percentual e ícone.
 *
 * Props:
 *   - titulo:     label do KPI
 *   - valor:      valor principal formatado (string)
 *   - variacao:   percentual de variação (ex: 12.5 ou -3.2)
 *   - icone:      nome do ícone lucide
 *   - cor:        cor do ícone/destaque (primary | success | info | warning | error)
 *   - carregando: exibe skeleton
 */

import { computed } from "vue";

type Cor = "primary" | "success" | "info" | "warning" | "error";

const props = withDefaults(
	defineProps<{
		titulo: string;
		valor?: string;
		variacao?: number;
		icone?: string;
		cor?: Cor;
		carregando?: boolean;
	}>(),
	{
		valor: undefined,
		variacao: undefined,
		icone: undefined,
		cor: "primary",
		carregando: false,
	},
);

const corIconeMap: Record<Cor, string> = {
	primary: "bg-primary/10 text-primary",
	success: "bg-success/10 text-success",
	info: "bg-info/10 text-info",
	warning: "bg-warning/10 text-warning",
	error: "bg-error/10 text-error",
};

const variacaoPositiva = computed(() => (props.variacao ?? 0) >= 0);
const variacaoFormatada = computed(() => {
	if (props.variacao === undefined) return null;
	const sinal = variacaoPositiva.value ? "+" : "";
	return `${sinal}${props.variacao.toFixed(1)}%`;
});
</script>

<template>
	<div class="bg-card border-border rounded-lg border p-5 shadow-sm">
		<div class="flex items-start justify-between gap-4">
			<!-- Texto -->
			<div class="min-w-0 flex-1">
				<p class="text-muted-foreground truncate text-sm font-medium">{{ titulo }}</p>

				<!-- Valor -->
				<div class="mt-1">
					<UiSkeleton v-if="carregando" class="h-8 w-28" />
					<p v-else class="text-foreground text-2xl font-bold tracking-tight">
						{{ valor ?? "—" }}
					</p>
				</div>

				<!-- Variação -->
				<div v-if="variacaoFormatada !== null" class="mt-1.5 flex items-center gap-1">
					<UiSkeleton v-if="carregando" class="h-4 w-16" />
					<template v-else>
						<Icon
							:name="variacaoPositiva ? 'lucide:trending-up' : 'lucide:trending-down'"
							class="size-3.5 shrink-0"
							:class="variacaoPositiva ? 'text-success' : 'text-error'"
						/>
						<span
							class="text-xs font-medium"
							:class="variacaoPositiva ? 'text-success' : 'text-error'"
						>
							{{ variacaoFormatada }}
						</span>
						<span class="text-muted-foreground text-xs">vs. mês anterior</span>
					</template>
				</div>
			</div>

			<!-- Ícone -->
			<div
				v-if="icone"
				class="flex size-11 shrink-0 items-center justify-center rounded-lg"
				:class="corIconeMap[cor]"
			>
				<Icon :name="icone" class="size-5" />
			</div>
		</div>
	</div>
</template>
