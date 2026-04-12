<script setup lang="ts">
/**
 * admin-layout — Layout do Painel Admin Loja.
 *
 * SSR-safe: estado da sidebar via cookie (consistente entre SSR e cliente).
 * - Desktop: sidebar e header com left calculado via JS
 * - Mobile: CSS override via media query (sidebar fora da tela, overlay)
 * - Cookie persiste estado entre sessões + sincroniza com preferencesStore
 */

import SidebarAdmin from "~/features/admin-loja/components/layout/SidebarAdmin.vue";
import HeaderAdmin from "~/features/admin-loja/components/layout/HeaderAdmin.vue";
import { usePreferencesStore } from "~/stores/preferencesStore";

// ─── Constantes de posicionamento ─────────────────────────────────────────────

const SIDEBAR_OPEN_WIDTH = "240px";
const SIDEBAR_CLOSED_WIDTH = "80px";
const HEADER_LEFT_OPEN = "264px"; // 8 (margem) + 240 (width) + 16 (gap)
const HEADER_LEFT_CLOSED = "104px"; // 8 (margem) + 80 (width) + 16 (gap)

// ─── Estado da sidebar (cookie SSR-safe) ──────────────────────────────────────

const sidebarCookie = useCookie<boolean>("admin-sidebar-open", {
	default: () => true,
	maxAge: 60 * 60 * 24 * 365,
	sameSite: "lax",
});

const sidebarOpen = ref(sidebarCookie.value ?? true);
const preferencesStore = usePreferencesStore();

function toggleSidebar(): void {
	sidebarOpen.value = !sidebarOpen.value;
	sidebarCookie.value = sidebarOpen.value;
	preferencesStore.setSidebarCollapsed(!sidebarOpen.value);
}

// Fecha sidebar ao navegar em mobile
const route = useRoute();
watch(
	() => route.path,
	() => {
		if (import.meta.client && window.innerWidth < 768) {
			sidebarOpen.value = false;
		}
	},
);

// ─── Computed de posicionamento ───────────────────────────────────────────────

const sidebarWidth = computed(() =>
	sidebarOpen.value ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
);

const mainMarginLeft = computed(() => (sidebarOpen.value ? HEADER_LEFT_OPEN : HEADER_LEFT_CLOSED));
</script>

<template>
	<div class="admin-layout bg-background h-screen overflow-hidden">
		<!-- Faixa fixa no topo: cobre o fundo atrás do header -->
		<div class="bg-background fixed top-0 right-0 left-0 z-15 h-[80px]"></div>

		<!-- Overlay mobile -->
		<div
			class="admin-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
			:class="sidebarOpen ? 'admin-overlay--open' : ''"
			@click="sidebarOpen = false"
		></div>

		<!-- Sidebar -->
		<div
			class="admin-sidebar sidebar-transition fixed z-50"
			:class="sidebarOpen ? 'admin-sidebar--open' : ''"
			:style="{
				top: '8px',
				bottom: '8px',
				left: '8px',
				width: sidebarWidth,
			}"
		>
			<SidebarAdmin v-model="sidebarOpen" class="h-full" />
		</div>

		<!-- Header -->
		<HeaderAdmin
			:sidebar-open="sidebarOpen"
			:style="{ left: sidebarOpen ? HEADER_LEFT_OPEN : HEADER_LEFT_CLOSED }"
			class="header-transition fixed top-2 right-4 z-30 rounded-lg"
			@toggle-sidebar="toggleSidebar"
		/>

		<!-- Main -->
		<main
			class="admin-main relative z-10 flex h-full flex-col overflow-hidden pt-4 transition-[margin] duration-500 ease-in-out"
			:style="{ marginLeft: mainMarginLeft }"
		>
			<div class="flex-1 overflow-y-auto pt-16 pr-4 pb-4 pl-0">
				<slot></slot>
			</div>
		</main>
	</div>
</template>

<style scoped>
/* Overlay: invisível por padrão, visível em mobile quando sidebar aberta */
.admin-overlay {
	display: none;
	pointer-events: none;
}

@media (max-width: 768px) {
	/* Overlay mobile */
	.admin-overlay--open {
		display: block;
		pointer-events: auto;
	}

	/* Sidebar fora da tela em mobile */
	.admin-sidebar {
		left: calc(-256px - 8px) !important;
		transition: left 0.3s ease;
	}

	/* Sidebar aberta em mobile */
	.admin-sidebar.admin-sidebar--open {
		left: 8px !important;
	}

	/* Header ocupa toda a largura em mobile */
	:deep(.header-transition) {
		left: 8px !important;
		z-index: 30 !important;
	}

	/* Main sem margem em mobile */
	.admin-main {
		margin-left: 0 !important;
	}
}
</style>
