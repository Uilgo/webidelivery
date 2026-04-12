<script setup lang="ts">
/**
 * /admin/onboarding → OnboardingPageAdmin (auth-layout)
 * Wizard de configuração inicial — sem sidebar/header do painel.
 */

definePageMeta({ layout: "auth-layout" });

useSeoMeta({ title: "Configuração inicial — WebiDelivery", robots: "noindex" });
</script>

<template>
	<div class="flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-2xl">
			<div class="mb-8 text-center">
				<h1 class="text-foreground text-2xl font-bold">Configure sua loja</h1>
				<p class="text-muted-foreground mt-1 text-sm">
					Complete as etapas para começar a receber pedidos
				</p>
			</div>
			<UiAlert color="info">
				<template #title>Em construção</template>
				OnboardingPageAdmin será implementado aqui.
			</UiAlert>
		</div>
	</div>
</template>
