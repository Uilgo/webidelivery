<script setup lang="ts">
/**
 * /admin/clientes → ClientesPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Clientes — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Clientes</h1>
			<p class="text-muted-foreground text-sm">CRM e histórico de clientes</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			ClientesPage será implementado aqui.
		</UiAlert>
	</div>
</template>
