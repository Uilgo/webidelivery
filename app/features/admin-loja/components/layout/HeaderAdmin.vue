<script setup lang="ts">
/**
 * Header — Cabeçalho fixo do Painel Admin Loja.
 * Título dinâmico por rota, toggle de loja, notificações e dark mode.
 */

import { usePerfilStore } from "~/stores/perfilStore";
import { useLojaStore } from "~/stores/lojaStore";
import { useNotifications } from "~/composables/core/useNotifications";
import { CARGOS } from "~~/shared/constants/rbac";
import type {
	RpcMarcarNotificacaoLidaParams,
	RpcMarcarTodasLidasParams,
} from "~~/shared/types/rpc/notificacoes";

defineProps<{ sidebarOpen?: boolean }>();
const emit = defineEmits<{ "toggle-sidebar": [] }>();

defineOptions({ inheritAttrs: false });

const route = useRoute();
const perfilStore = usePerfilStore();
const lojaStore = useLojaStore();
const supabase = useSupabaseClient();

// ─── Título da página ─────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
	dashboard: "Dashboard",
	pedidos: "Pedidos",
	cardapio: "Cardápio",
	marketing: "Marketing",
	clientes: "Clientes",
	relatorios: "Relatórios",
	configuracoes: "Configurações",
	perfil: "Perfil",
	notificacoes: "Notificações",
};

const pageTitle = computed(() => {
	const last = route.path.split("/").filter(Boolean).at(-1) ?? "";
	return PAGE_TITLES[last] ?? "Admin";
});

// ─── Toggle loja aberta/fechada ───────────────────────────────────────────────

const isGerente = computed(
	() => perfilStore.cargo === CARGOS.ADMIN_LOJA || perfilStore.cargo === CARGOS.GERENTE_LOJA,
);

// Visual baseado em `aberto` (calculado pelo sistema)
// Toggle escreve apenas `forcar_fechado` via fn_rpc_toggle_forcar_fechado
const lojaAberta = computed(() => lojaStore.aberto);

async function toggleLoja(): Promise<void> {
	const lojaId = lojaStore.loja?.id;
	if (!lojaId) return;
	try {
		const { data } = await supabase.rpc("fn_rpc_toggle_forcar_fechado", {
			p_loja_id: lojaId,
		} as never);
		if (data && typeof data === "object" && "forcar_fechado" in data) {
			const result = data as { forcar_fechado: boolean; aberto: boolean };
			// Atualiza via store (não mutação direta)
			lojaStore.setLoja({
				...lojaStore.loja!,
				forcar_fechado: result.forcar_fechado,
				aberto: result.aberto,
			});
		}
	} catch (e) {
		console.error("[Header] Erro ao alternar forcar_fechado:", e);
	}
}

// ─── Cardápio público ─────────────────────────────────────────────────────────

const slug = computed(() => lojaStore.slug);

function abrirCardapio(): void {
	if (!slug.value) return;
	window.open(`${window.location.origin}/${slug.value}`, "_blank", "noopener,noreferrer");
}

// ─── Notificações ─────────────────────────────────────────────────────────────

const { notificacoes, naoLidas, temNaoLidas, painelAberto, togglePainel, fecharPainel } =
	useNotifications();

const notifBtnRef = ref<HTMLElement | null>(null);
const notifPanelRef = ref<HTMLElement | null>(null);

onClickOutside(notifPanelRef, (e) => {
	if (notifBtnRef.value?.contains(e.target as Node)) return;
	fecharPainel();
});

const ICONE_NOTIF: Record<string, string> = {
	pedido: "lucide:shopping-bag",
	avaliacao: "lucide:star",
	sistema: "lucide:info",
};

const COR_NOTIF: Record<string, string> = {
	pedido: "bg-primary/10 text-primary",
	avaliacao: "bg-success/10 text-success",
	sistema: "bg-info/10 text-info",
};

async function marcarLida(id: string): Promise<void> {
	const params: RpcMarcarNotificacaoLidaParams = { notificacao_id: id };
	await supabase.rpc("fn_rpc_marcar_notificacao_lida", params as never);
	const notif = notificacoes.value.find((n) => n.id === id);
	if (notif) notif.lida_em = new Date().toISOString();
}

async function marcarTodasLidas(): Promise<void> {
	if (!perfilStore.perfil?.id) return;
	const params: RpcMarcarTodasLidasParams = { perfil_id: perfilStore.perfil.id };
	await supabase.rpc("fn_rpc_marcar_todas_lidas", params as never);
	notificacoes.value.forEach((n) => {
		n.lida_em = new Date().toISOString();
	});
}

// Helper para acessar payload sem cast no template (evita conflito com parser HTML do Prettier)
function payloadNotif(payload: unknown): Record<string, unknown> {
	return (payload as Record<string, unknown>) ?? {};
}
</script>

<template>
	<header
		v-bind="$attrs"
		class="border-border bg-card flex h-16 w-auto items-center justify-between border px-4 shadow-sm"
	>
		<!-- Esquerda: toggle sidebar + título -->
		<div class="flex items-center gap-3">
			<button
				type="button"
				class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-10 items-center justify-center rounded-md transition-colors"
				aria-label="Toggle menu"
				@click="emit('toggle-sidebar')"
			>
				<Icon name="lucide:panel-left" class="size-5" />
			</button>
			<h1 class="text-foreground text-lg font-semibold">{{ pageTitle }}</h1>
		</div>

		<!-- Direita: ações -->
		<div class="flex items-center gap-2">
			<!-- Toggle loja aberta/fechada (apenas gerente+) -->
			<span v-if="isGerente" class="hidden md:inline-flex">
				<UiBadge
					:color="lojaAberta ? 'success' : 'error'"
					variant="soft"
					size="lg"
					class="cursor-pointer items-center gap-2 px-4 py-2"
					@click="toggleLoja"
				>
					<UiSwitch :model-value="lojaAberta" :color="lojaAberta ? 'success' : 'error'" size="sm" />
					<span class="inline-block w-[88px] text-sm font-medium">{{
						lojaAberta ? "Loja Aberta" : "Loja Fechada"
					}}</span>
				</UiBadge>
			</span>

			<!-- Ver cardápio público -->
			<button
				type="button"
				:disabled="!slug"
				class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-10 items-center justify-center rounded-md transition-colors disabled:opacity-40"
				aria-label="Ver cardápio público"
				@click="abrirCardapio"
			>
				<Icon name="lucide:external-link" class="size-5" />
			</button>

			<!-- Notificações -->
			<button
				ref="notifBtnRef"
				type="button"
				class="hover:bg-accent text-muted-foreground hover:text-foreground relative inline-flex size-10 items-center justify-center rounded-md transition-colors"
				:class="painelAberto ? 'bg-accent' : ''"
				aria-label="Notificações"
				@click="togglePainel"
			>
				<Icon name="lucide:bell" class="size-5" />
				<span
					v-if="temNaoLidas"
					class="bg-error absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
				>
					{{ naoLidas > 9 ? "9+" : naoLidas }}
				</span>
			</button>

			<!-- Dark mode -->
			<LayoutsModeToggle />
		</div>
	</header>

	<!-- Painel de notificações -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition-all duration-150 ease-out"
			enter-from-class="opacity-0 scale-95 -translate-y-1"
			enter-to-class="opacity-100 scale-100 translate-y-0"
			leave-active-class="transition-all duration-100 ease-in"
			leave-from-class="opacity-100 scale-100 translate-y-0"
			leave-to-class="opacity-0 scale-95 -translate-y-1"
		>
			<div
				v-if="painelAberto"
				ref="notifPanelRef"
				class="border-border bg-popover fixed top-20 right-4 z-50 w-80 rounded-lg border shadow-lg"
			>
				<!-- Cabeçalho -->
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<div class="flex items-center gap-2">
						<span class="text-foreground text-sm font-semibold">Notificações</span>
						<UiBadge v-if="temNaoLidas" color="error" variant="solid" size="sm" rounded>
							{{ naoLidas }}
						</UiBadge>
					</div>
					<button
						v-if="temNaoLidas"
						type="button"
						class="text-muted-foreground hover:text-foreground text-xs transition-colors"
						@click="marcarTodasLidas"
					>
						Marcar todas como lidas
					</button>
				</div>

				<!-- Lista -->
				<div class="max-h-80 overflow-y-auto">
					<p
						v-if="notificacoes.length === 0"
						class="text-muted-foreground px-4 py-8 text-center text-sm"
					>
						Nenhuma notificação
					</p>
					<button
						v-for="notif in notificacoes"
						:key="notif.id"
						type="button"
						class="hover:bg-accent flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
						:class="!notif.lida_em ? 'bg-accent/40' : ''"
						@click="marcarLida(notif.id)"
					>
						<div
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
							:class="COR_NOTIF[notif.tipo] ?? 'bg-accent text-muted-foreground'"
						>
							<Icon :name="ICONE_NOTIF[notif.tipo] ?? 'lucide:bell'" class="size-4" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<span class="text-foreground flex-1 truncate text-sm leading-tight font-medium">
									{{ payloadNotif(notif.payload)?.titulo ?? notif.tipo }}
								</span>
								<div v-if="!notif.lida_em" class="bg-primary size-2 shrink-0 rounded-full"></div>
							</div>
							<span class="text-muted-foreground mt-0.5 block truncate text-xs">
								{{ payloadNotif(notif.payload)?.descricao ?? "" }}
							</span>
						</div>
					</button>
				</div>

				<!-- Rodapé -->
				<div class="border-border border-t px-4 py-2">
					<NuxtLink
						to="/admin/notificacoes"
						class="text-primary hover:text-primary/80 block w-full text-center text-xs transition-colors"
						@click="fecharPainel"
					>
						Ver todas as notificações
					</NuxtLink>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>
