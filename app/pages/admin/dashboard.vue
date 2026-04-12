<script setup lang="ts">
/**
 * /admin/dashboard → DashboardPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Dashboard — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Dashboard</h1>
			<p class="text-muted-foreground text-sm">Visão geral do seu estabelecimento</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			DashboardPage será implementado aqui.
		</UiAlert>
	</div>
</template>
