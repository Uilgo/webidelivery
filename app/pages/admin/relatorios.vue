<script setup lang="ts">
/**
 * /admin/relatorios → RelatoriosPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Relatórios — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Relatórios</h1>
			<p class="text-muted-foreground text-sm">Vendas, produtos, clientes e financeiro</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			RelatoriosPage será implementado aqui.
		</UiAlert>
	</div>
</template>
