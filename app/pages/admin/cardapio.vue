<script setup lang="ts">
/**
 * /admin/cardapio → CardapioPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Cardápio — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Cardápio</h1>
			<p class="text-muted-foreground text-sm">Categorias, produtos, adicionais e combos</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			CardapioPage será implementado aqui.
		</UiAlert>
	</div>
</template>
