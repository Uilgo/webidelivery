<script setup lang="ts">
/**
 * auth-layout — Layout centralizado para todas as páginas de autenticação.
 * Fundo limpo com gradiente sutil, sem sidebar/header de painel.
 * Usado por: login, signup, forgot-password, reset-password, first-access.
 */
</script>

<template>
	<div class="auth-bg relative min-h-screen">
		<!-- Toggle de tema no canto superior direito -->
		<div class="absolute top-4 right-4">
			<LayoutsModeToggle />
		</div>

		<slot></slot>
	</div>
</template>

<style scoped>
.auth-bg {
	background:
		radial-gradient(
			ellipse at 50% 0%,
			color-mix(in srgb, var(--color-primary) 6%, transparent),
			transparent 60%
		),
		var(--color-background);
}
</style>
