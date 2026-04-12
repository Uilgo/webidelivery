<script setup lang="ts">
/**
 * error.vue — Página de erro global do WebiDelivery.
 * Cobre todos os erros: 404, 403, 500, etc.
 * Não é uma rota — não usa definePageMeta.
 * Usa NuxtLayout para manter o visual consistente.
 */

import type { NuxtError } from "#app";
import { usePerfilStore } from "~/stores/perfilStore";

const props = defineProps<{ error: NuxtError }>();

// Metadados por código de erro
const meta = computed(() => {
	switch (props.error.status) {
		case 404:
			return {
				icon: "lucide:map-pin-off",
				title: "Página não encontrada",
				description: "A página que você está procurando não existe ou foi movida.",
			};
		case 403:
			return {
				icon: "lucide:shield-off",
				title: "Acesso negado",
				description: "Você não tem permissão para acessar esta página.",
			};
		case 500:
			return {
				icon: "lucide:server-crash",
				title: "Erro interno",
				description: "Algo deu errado no servidor. Tente novamente em instantes.",
			};
		default:
			return {
				icon: "lucide:triangle-alert",
				title: `Erro ${props.error.status}`,
				description: props.error.statusMessage ?? "Ocorreu um erro inesperado.",
			};
	}
});

const perfilStore = usePerfilStore();

function voltar() {
	if (!perfilStore.perfil) {
		clearError({ redirect: "/login" });
		return;
	}
	const destino = perfilStore.isCargoPlataforma ? "/plataforma/dashboard" : "/admin/dashboard";
	clearError({ redirect: destino });
}
</script>

<template>
	<NuxtLayout name="auth-layout">
		<div class="flex min-h-screen items-center justify-center p-4">
			<UiCard padding="none" shadow="lg" class="w-full max-w-2xl px-16 py-16 text-center">
				<!-- Ícone -->
				<div class="bg-muted mx-auto mb-6 flex size-20 items-center justify-center rounded-full">
					<Icon :name="meta.icon" class="text-muted-foreground size-10" />
				</div>

				<!-- Código do erro -->
				<p class="text-primary mb-2 text-6xl font-black tabular-nums">
					{{ error.status }}
				</p>

				<!-- Título -->
				<h1 class="text-foreground mb-2 text-2xl font-bold">
					{{ meta.title }}
				</h1>

				<!-- Descrição -->
				<p class="text-muted-foreground mb-8 text-sm leading-relaxed">
					{{ meta.description }}
				</p>

				<!-- Ações -->
				<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<UiButton icon-left="lucide:home" @click="voltar"> Voltar ao início </UiButton>
					<UiButton
						variant="outline"
						color="neutral"
						icon-left="lucide:refresh-cw"
						@click="reloadNuxtApp()"
					>
						Tentar novamente
					</UiButton>
				</div>
			</UiCard>
		</div>
	</NuxtLayout>
</template>
