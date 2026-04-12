<script setup lang="ts">
/**
 * /admin/pedidos → PedidosPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Pedidos — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Pedidos</h1>
			<p class="text-muted-foreground text-sm">Gerencie os pedidos do seu estabelecimento</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			PedidosPage será implementado aqui.
		</UiAlert>
	</div>
</template>
