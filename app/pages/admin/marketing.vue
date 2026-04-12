<script setup lang="ts">
/**
 * /admin/marketing → MarketingPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Marketing — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Marketing</h1>
			<p class="text-muted-foreground text-sm">Cupons e banners promocionais</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			MarketingPage será implementado aqui.
		</UiAlert>
	</div>
</template>
