<script setup lang="ts">
/**
 * GraficoPizza — Gráfico de pizza/doughnut para dashboards.
 * Usa Apache ECharts via nuxt-echarts.
 */

import { computed } from "vue";
import type { EChartsOption } from "echarts";

interface Fatia {
	label: string;
	valor: number;
	cor?: string;
}

const CORES_PADRAO = ["#f97316", "#6366f1", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const props = withDefaults(
	defineProps<{
		dados?: Fatia[];
		doughnut?: boolean;
		tamanho?: number;
		carregando?: boolean;
	}>(),
	{
		dados: () => [],
		doughnut: true,
		tamanho: 200,
		carregando: false,
	},
);

const opcao = computed<EChartsOption>(() => ({
	tooltip: { trigger: "item", formatter: "{b}: {d}%" },
	legend: {
		bottom: 0,
		left: "center",
		textStyle: { fontSize: 11, color: "#94a3b8" },
	},
	series: [
		{
			type: "pie",
			radius: props.doughnut ? ["45%", "70%"] : "70%",
			center: ["50%", "45%"],
			data: props.dados.map((d, i) => ({
				name: d.label,
				value: d.valor,
				itemStyle: { color: d.cor ?? CORES_PADRAO[i % CORES_PADRAO.length] },
			})),
			label: { show: false },
			emphasis: { label: { show: false } },
		},
	],
}));
</script>

<template>
	<div :style="{ width: `${tamanho}px`, height: `${tamanho}px` }">
		<UiSkeleton v-if="carregando" class="h-full w-full" rounded="full" />

		<div v-else-if="!dados.length" class="flex h-full items-center justify-center">
			<p class="text-muted-foreground text-sm">Sem dados</p>
		</div>

		<VChart v-else class="h-full w-full" :option="opcao" autoresize />
	</div>
</template>
