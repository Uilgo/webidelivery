<script setup lang="ts">
/**
 * /admin/configuracoes → ConfiguracoesPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Configurações — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Configurações</h1>
			<p class="text-muted-foreground text-sm">
				Dados, horários, pagamentos, entrega, aparência e segurança
			</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			ConfiguracoesPage será implementado aqui.
		</UiAlert>
	</div>
</template>
