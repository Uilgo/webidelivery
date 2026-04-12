<script setup lang="ts">
/**
 * 📌 HeaderAdmin — Header do Painel Admin da Loja
 *
 * SSR-safe: sem isMobile no JS — visibilidade controlada via CSS (Tailwind md:).
 * inheritAttrs: false — necessário pois o componente tem múltiplos root nodes
 * (header + Teleport). O style passado pelo layout é aplicado manualmente via $attrs.
 */

import { useLojaStore } from "~/stores/lojaStore";
import HeaderNotifications from "./HeaderNotifications.vue";
import StoreStatusToggle from "./StoreStatusToggle.vue";

defineOptions({ inheritAttrs: false });

interface Props {
	sidebarOpen?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
	"toggle-sidebar": [];
}>();

const route = useRoute();
const lojaStore = useLojaStore();

const slug = computed(() => lojaStore.slug);

// Título dinâmico baseado no último segmento da rota
const PAGE_TITLES: Record<string, string> = {
	dashboard: "Dashboard",
	pedidos: "Pedidos",
	cardapio: "Cardápio",
	marketing: "Marketing",
	clientes: "Clientes",
	equipe: "Equipe",
	relatorios: "Relatórios",
	configuracoes: "Configurações",
	perfil: "Perfil",
	notificacoes: "Notificações",
};

const pageTitle = computed(() => {
	const segments = route.path.split("/").filter(Boolean);
	const last = segments[segments.length - 1] ?? "";
	return PAGE_TITLES[last] ?? "Admin";
});

// Constantes de posicionamento sincronizadas com admin-layout
const SIDEBAR_WIDTH_OPEN = 240;
const SIDEBAR_WIDTH_CLOSED = 80;
const HEADER_LEFT_OPEN = `${SIDEBAR_WIDTH_OPEN + 16 + 8}px`; // width + gap + margem_esquerda
const HEADER_LEFT_CLOSED = `${SIDEBAR_WIDTH_CLOSED + 16 + 8}px`; // width + gap + margem_esquerda

function toggleSidebar(): void {
	emit("toggle-sidebar");
}

/**
 * Abre o cardápio público da loja em nova aba.
 * Usa URL absoluta (origin + slug) para garantir que o navegador
 * trate como navegação externa e não passe pelo router do Nuxt.
 */
function abrirCardapioPublico(): void {
	const s = slug.value;
	console.warn("[HeaderAdmin] abrirCardapioPublico chamado, slug:", JSON.stringify(s));
	if (!s) return;
	const url = `${window.location.origin}/${s}`;
	console.warn("[HeaderAdmin] Abrindo URL:", url);
	window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<template>
	<header
		v-bind="$attrs"
		class="header-transition border-border bg-card fixed top-2 right-4 z-50 flex h-16 items-center rounded-lg border p-4 shadow-sm"
		:style="{ left: sidebarOpen ? HEADER_LEFT_OPEN : HEADER_LEFT_CLOSED }"
	>
		<!-- Lado esquerdo -->
		<div class="flex items-center gap-4">
			<button
				type="button"
				class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex min-h-[40px] w-[40px] items-center justify-center rounded-md transition-colors"
				aria-label="Toggle menu"
				@click="toggleSidebar"
			>
				<span class="md:hidden"><Icon name="lucide:menu" class="size-5" /></span>
				<span class="hidden md:block"><Icon name="lucide:panel-right" class="size-5" /></span>
			</button>
			<h1 class="text-foreground truncate text-lg font-semibold">{{ pageTitle }}</h1>
		</div>

		<div class="flex-1"></div>

		<!-- Lado direito -->
		<div class="flex items-center gap-2">
			<!-- Toggle Loja Aberta/Fechada (componentizado) -->
			<StoreStatusToggle />

			<!-- Ver cardápio público -->
			<!-- Usa button + window.open() para garantir que nunca navegue para "/"
			     caso o slug ainda não tenha carregado (o que ativaria o Smart Router) -->
			<button
				type="button"
				:disabled="!slug"
				:title="slug ? `Abrir cardápio: /${slug}` : 'Slug da loja não carregado'"
				:class="[
					'inline-flex min-h-[40px] w-[40px] items-center justify-center rounded-md transition-colors',
					slug
						? 'hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer'
						: 'text-muted-foreground/40 cursor-not-allowed opacity-50',
				]"
				aria-label="Ver cardápio público"
				@click="abrirCardapioPublico"
			>
				<Icon name="lucide:external-link" class="size-5" />
			</button>

			<!-- Notificações (componentizado) -->
			<HeaderNotifications />

			<!-- Dark mode toggle -->
			<LayoutsModeToggle />
		</div>
	</header>
</template>
