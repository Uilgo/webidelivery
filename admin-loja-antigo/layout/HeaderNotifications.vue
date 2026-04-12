<script setup lang="ts">
import { ref, computed } from "vue";
import { onClickOutside, useElementBounding } from "@vueuse/core";
import { useNotifications } from "~/composables/core/useNotifications";

const {
	notificacoes,
	notifOpen,
	naoLidas,
	togglePainel,
	fecharPainel,
	marcarLida,
	marcarTodasLidas,
	verTodasNotificacoes,
} = useNotifications();

const ICONE_NOTIF: Record<string, string> = {
	pedido: "lucide:shopping-bag",
	estoque: "lucide:package",
	avaliacao: "lucide:star",
	sistema: "lucide:info",
};

const COR_NOTIF: Record<string, string> = {
	pedido: "bg-primary/10 text-primary",
	estoque: "bg-warning/10 text-warning",
	avaliacao: "bg-success/10 text-success",
	sistema: "bg-info/10 text-info",
};

const NOTIF_PANEL_TOP = "76px";

const notifBtnRef = ref<HTMLElement | null>(null);
const notifPanelRef = ref<HTMLElement | null>(null);

const { right: btnRight } = useElementBounding(notifBtnRef);

const panelStyle = computed(() => ({
	top: NOTIF_PANEL_TOP,
	right: import.meta.client ? `${window.innerWidth - btnRight.value}px` : "8px",
}));

onClickOutside(notifPanelRef, (e) => {
	if (notifBtnRef.value?.contains(e.target as Node)) return;
	fecharPainel();
});
</script>

<template>
	<!-- Botão de Notificações -->
	<button
		ref="notifBtnRef"
		type="button"
		class="hover:bg-accent text-muted-foreground hover:text-foreground relative hidden min-h-[40px] w-[40px] items-center justify-center rounded-md transition-colors md:inline-flex"
		:class="notifOpen ? 'bg-accent' : ''"
		aria-label="Notificações"
		@click="togglePainel"
	>
		<span class="relative inline-flex">
			<Icon name="lucide:bell" class="size-5" />
			<span
				v-if="naoLidas > 0"
				class="bg-error absolute top-0 right-0 flex size-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white"
			>
				{{ naoLidas > 9 ? "9+" : naoLidas }}
			</span>
		</span>
	</button>

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
				v-if="notifOpen"
				ref="notifPanelRef"
				class="border-border bg-popover fixed z-9999 w-80 rounded-lg border shadow-lg"
				:style="panelStyle"
			>
				<!-- Cabeçalho do painel -->
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<div class="flex items-center gap-2">
						<span class="text-foreground text-sm font-semibold">Notificações</span>
						<UiBadge v-if="naoLidas > 0" color="error" variant="solid" size="sm" rounded>{{
							naoLidas
						}}</UiBadge>
					</div>
					<button
						v-if="naoLidas > 0"
						type="button"
						class="text-muted-foreground hover:text-foreground text-xs transition-colors"
						@click="marcarTodasLidas"
					>
						Marcar todas como lidas
					</button>
				</div>

				<!-- Lista de notificações -->
				<div class="max-h-[360px] overflow-y-auto">
					<div
						v-if="notificacoes.length === 0"
						class="text-muted-foreground px-4 py-8 text-center text-sm"
					>
						Nenhuma notificação
					</div>
					<button
						v-for="notif in notificacoes"
						:key="notif.id"
						type="button"
						class="hover:bg-accent flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
						:class="!notif.lida ? 'bg-accent/40' : ''"
						@click="marcarLida(notif.id)"
					>
						<div
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
							:class="COR_NOTIF[notif.tipo] || 'bg-accent text-muted-foreground'"
						>
							<Icon :name="ICONE_NOTIF[notif.tipo] || 'lucide:bell'" class="size-4" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<p
									class="text-foreground min-w-0 flex-1 truncate text-sm leading-tight font-medium"
								>
									{{ notif.titulo }}
								</p>
								<span class="text-muted-foreground shrink-0 text-xs">{{ notif.tempo }}</span>
								<div v-if="!notif.lida" class="bg-primary size-2 shrink-0 rounded-full"></div>
							</div>
							<p class="text-muted-foreground mt-0.5 truncate text-xs leading-snug">
								{{ notif.descricao }}
							</p>
						</div>
					</button>
				</div>

				<!-- Rodapé -->
				<div class="border-border border-t px-4 py-2">
					<button
						type="button"
						class="text-primary hover:text-primary/80 w-full text-center text-xs transition-colors"
						@click="verTodasNotificacoes"
					>
						Ver todas as notificações
					</button>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>
