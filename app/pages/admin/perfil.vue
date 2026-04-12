<script setup lang="ts">
/**
 * /admin/perfil → PerfilPage (admin-layout)
 */

definePageMeta({ layout: "admin-layout" });

useSeoMeta({ title: "Perfil — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex flex-col gap-6">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Perfil</h1>
			<p class="text-muted-foreground text-sm">
				Dados pessoais, segurança, notificações e preferências
			</p>
		</div>
		<UiAlert color="info">
			<template #title>Em construção</template>
			PerfilPage será implementado aqui.
		</UiAlert>
	</div>
</template>
