<script setup lang="ts">
/**
 * GraficoLinha — Gráfico de linha para dashboards.
 * Usa Apache ECharts via nuxt-echarts.
 */

import { computed } from "vue";
import type { EChartsOption } from "echarts";

interface Ponto {
	label: string;
	valor: number;
}

const props = withDefaults(
	defineProps<{
		dados?: Ponto[];
		cor?: string;
		altura?: number;
		carregando?: boolean;
	}>(),
	{
		dados: () => [],
		cor: "#f97316",
		altura: 200,
		carregando: false,
	},
);

const opcao = computed<EChartsOption>(() => ({
	grid: { top: 8, right: 8, bottom: 24, left: 40, containLabel: false },
	xAxis: {
		type: "category",
		data: props.dados.map((d) => d.label),
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { fontSize: 10, color: "#94a3b8" },
	},
	yAxis: {
		type: "value",
		splitLine: { lineStyle: { color: "#1e293b", type: "dashed" } },
		axisLabel: { fontSize: 10, color: "#94a3b8" },
	},
	series: [
		{
			type: "line",
			data: props.dados.map((d) => d.valor),
			smooth: true,
			symbol: "circle",
			symbolSize: 6,
			lineStyle: { color: props.cor, width: 2 },
			itemStyle: { color: props.cor },
			areaStyle: { color: props.cor, opacity: 0.08 },
		},
	],
	tooltip: { trigger: "axis" },
}));
</script>

<template>
	<div :style="{ height: `${altura}px` }">
		<UiSkeleton v-if="carregando" class="h-full w-full" rounded="lg" />

		<div v-else-if="!dados.length" class="flex h-full items-center justify-center">
			<p class="text-muted-foreground text-sm">Sem dados para exibir</p>
		</div>

		<VChart v-else class="h-full w-full" :option="opcao" autoresize />
	</div>
</template>
