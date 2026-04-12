<script setup lang="ts">
/**
 * /confirm — Callback PKCE do Supabase.
 * Chamado apenas após: confirmação de e-mail, reset de senha ou troca de e-mail.
 * O módulo @nuxtjs/supabase processa o token da URL automaticamente.
 * Aguarda a sessão ser estabelecida e redireciona para o dashboard correto.
 */

import { usePerfilStore } from "~/stores/perfilStore";

definePageMeta({ layout: false });

useSeoMeta({
	title: "Autenticando — WebiDelivery",
	robots: "noindex, nofollow",
});

const user = useSupabaseUser();
const perfilStore = usePerfilStore();

watch(
	user,
	async (u) => {
		if (!u) return; // Aguarda o token ser processado

		if (!perfilStore.perfil) {
			await perfilStore.fetchPerfil(u.id);
		}

		if (!perfilStore.perfil) {
			// Perfil não encontrado mesmo após fetch — sessão inválida
			navigateTo("/login", { replace: true });
			return;
		}

		navigateTo(perfilStore.isCargoPlataforma ? "/plataforma/dashboard" : "/admin/dashboard", {
			replace: true,
		});
	},
	{ immediate: true },
);
</script>

<template>
	<div class="confirm-bg flex min-h-screen items-center justify-center px-4">
		<div class="confirm-card w-full max-w-sm rounded-3xl p-10">
			<div class="flex flex-col items-center gap-8 text-center">
				<!-- Logo -->
				<div class="flex items-center gap-3">
					<div
						class="bg-primary shadow-primary/30 flex size-10 items-center justify-center rounded-xl shadow-lg"
					>
						<Icon name="lucide:zap" class="size-5 text-white" />
					</div>
					<span class="text-foreground text-xl font-bold tracking-tight">WebiDelivery</span>
				</div>

				<!-- Ícone de loading com anel animado -->
				<div class="relative flex items-center justify-center">
					<div class="spinner-ring"></div>
					<div class="bg-primary/15 flex size-14 items-center justify-center rounded-full">
						<Icon name="lucide:shield-check" class="text-primary size-6" />
					</div>
				</div>

				<!-- Texto -->
				<div class="space-y-2">
					<h2 class="text-foreground text-xl font-bold">Verificando seu acesso</h2>
					<p class="text-muted-foreground text-sm leading-relaxed">
						Aguarde um momento, estamos<br />confirmando sua conta…
					</p>
				</div>

				<!-- Barra de progresso shimmer -->
				<div class="progress-track w-56 rounded-full">
					<div class="progress-shimmer rounded-full"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Fundo com gradiente sutil */
.confirm-bg {
	background:
		radial-gradient(
			ellipse at 50% 0%,
			color-mix(in srgb, var(--color-primary) 8%, transparent),
			transparent 70%
		),
		var(--color-background);
}

/* Card com borda sutil e glassmorphism leve */
.confirm-card {
	background: var(--color-card);
	border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
	box-shadow:
		0 0 0 1px color-mix(in srgb, var(--color-primary) 6%, transparent),
		0 24px 48px -12px rgba(0, 0, 0, 0.35),
		0 8px 16px -4px rgba(0, 0, 0, 0.2);
}

/* Anel giratório ao redor do ícone */
.spinner-ring {
	position: absolute;
	width: 72px;
	height: 72px;
	border-radius: 50%;
	border: 2.5px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
	border-top-color: var(--color-primary);
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Trilha da barra de progresso */
.progress-track {
	height: 3px;
	background: color-mix(in srgb, var(--color-primary) 12%, transparent);
	overflow: hidden;
}

/* Efeito shimmer que percorre a barra */
.progress-shimmer {
	height: 100%;
	width: 45%;
	background: linear-gradient(
		90deg,
		transparent,
		var(--color-primary),
		color-mix(in srgb, var(--color-primary) 60%, transparent),
		transparent
	);
	animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
	0% {
		transform: translateX(-120%);
	}
	100% {
		transform: translateX(320%);
	}
}
</style>
