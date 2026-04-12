<script setup lang="ts">
/**
 * Sidebar — Menu lateral do Painel Admin Loja.
 * Lógica de menu, RBAC e badge de pedidos pendentes inline.
 * Colapsável via prop modelValue.
 */

import { usePerfilStore } from "~/stores/perfilStore";
import { useLojaStore } from "~/stores/lojaStore";
import { useAuth } from "~/composables/core/useAuth";
import { CARGOS } from "~~/shared/constants/rbac";

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: true });
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const isOpen = computed({
	get: () => props.modelValue,
	set: (v) => emit("update:modelValue", v),
});

const route = useRoute();
const perfilStore = usePerfilStore();
const lojaStore = useLojaStore();
const supabase = useSupabaseClient();

// ─── Dados da loja ────────────────────────────────────────────────────────────

const nomeLoja = computed(() => lojaStore.nomeEstabelecimento);
const logoLightUrl = computed(() => lojaStore.logoLightUrl);
const logoDarkUrl = computed(() => lojaStore.logoDarkUrl);

// ─── RBAC ─────────────────────────────────────────────────────────────────────

const isGerente = computed(
	() => perfilStore.cargo === CARGOS.ADMIN_LOJA || perfilStore.cargo === CARGOS.GERENTE_LOJA,
);

const labelCargo = computed(() => {
	switch (perfilStore.cargo) {
		case CARGOS.ADMIN_LOJA:
			return "Administrador";
		case CARGOS.GERENTE_LOJA:
			return "Gerente";
		case CARGOS.STAFF_LOJA:
			return "Operacional";
		case CARGOS.ENTREGADOR:
			return "Entregador";
		default:
			return "";
	}
});

// ─── Badge de pedidos pendentes ───────────────────────────────────────────────

const { data: pedidosPendentes } = useAsyncData(
	`pedidos-pendentes-${lojaStore.loja?.id}`,
	async () => {
		if (!lojaStore.loja?.id) return 0;
		const { count } = await supabase
			.from("pedidos")
			.select("*", { count: "exact", head: true })
			.eq("loja_id", lojaStore.loja.id)
			.eq("estado_atual->>status", "pendente");
		return count ?? 0;
	},
	{ watch: [() => lojaStore.loja?.id] },
);

// ─── Itens do menu ────────────────────────────────────────────────────────────

interface MenuItem {
	label: string;
	icon: string;
	to: string;
	badge?: number;
	soGerente?: boolean;
}

const todosItens: MenuItem[] = [
	{ label: "Dashboard", icon: "lucide:layout-dashboard", to: "/admin/dashboard" },
	{ label: "Pedidos", icon: "lucide:shopping-bag", to: "/admin/pedidos" },
	{ label: "Cardápio", icon: "lucide:utensils", to: "/admin/cardapio" },
	{ label: "Marketing", icon: "lucide:megaphone", to: "/admin/marketing" },
	{ label: "Clientes", icon: "lucide:users", to: "/admin/clientes", soGerente: true },
	{ label: "Relatórios", icon: "lucide:bar-chart-3", to: "/admin/relatorios", soGerente: true },
	{ label: "Configurações", icon: "lucide:settings", to: "/admin/configuracoes", soGerente: true },
];

const menuItems = computed(() =>
	todosItens
		.filter((item) => !item.soGerente || isGerente.value)
		.map((item) => ({
			...item,
			badge:
				item.to === "/admin/pedidos" && (pedidosPendentes.value ?? 0) > 0
					? pedidosPendentes.value
					: undefined,
		})),
);

function isAtivo(path: string): boolean {
	return route.path === path;
}

// ─── Perfil do usuário (rodapé) ───────────────────────────────────────────────

const { logout } = useAuth();
const nomeCompleto = computed(() => perfilStore.nomeCompleto);
const email = computed(() => perfilStore.email);
const avatarUrl = computed(() => perfilStore.avatarUrl);

const userMenuItems = [
	{ label: "Meu Perfil", value: "perfil", icon: "lucide:user" },
	{ label: "Notificações", value: "notificacoes", icon: "lucide:bell" },
	{ label: "", value: "sep", separator: true },
	{ label: "Sair", value: "sair", icon: "lucide:log-out" },
];

function onUserMenuSelect(item: { value: string }): void {
	if (item.value === "perfil") navigateTo("/admin/perfil");
	else if (item.value === "notificacoes") navigateTo("/admin/notificacoes");
	else if (item.value === "sair") void logout();
}
</script>

<template>
	<aside
		class="sidebar-transition border-border bg-card flex h-full flex-col rounded-lg border shadow-sm"
	>
		<!-- Cabeçalho: logo + nome da loja -->
		<div class="sidebar-header border-border relative h-16 overflow-hidden border-b">
			<!-- Logo (48px × 48px = h-12 w-12) -->
			<div
				v-if="logoLightUrl || logoDarkUrl"
				class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg"
			>
				<img
					v-if="logoLightUrl"
					:src="logoLightUrl"
					:alt="nomeLoja"
					class="block h-full w-full object-contain dark:hidden"
				/>
				<img
					v-if="logoDarkUrl"
					:src="logoDarkUrl"
					:alt="nomeLoja"
					class="hidden h-full w-full object-contain dark:block"
				/>
			</div>
			<div v-else class="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
				<Icon name="lucide:store" class="text-primary-foreground h-7 w-7" />
			</div>

			<!-- Nome + cargo: só renderiza quando os dados chegaram, sem flash -->
			<div
				v-show="isOpen"
				class="sidebar-item-transition ml-3 flex min-w-0 flex-col"
				:class="isOpen ? 'opacity-100' : 'opacity-0'"
			>
				<span class="text-foreground truncate text-sm font-semibold">{{ nomeLoja }}</span>
				<span class="text-muted-foreground text-xs">{{ labelCargo }}</span>
			</div>
		</div>

		<!-- Navegação -->
		<nav class="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2 py-4">
			<NuxtLink
				v-for="item in menuItems"
				:key="item.to"
				:to="item.to"
				class="sidebar-item relative h-11 rounded-lg font-medium"
				:class="isAtivo(item.to) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'"
			>
				<!-- Indicador ativo -->
				<div
					v-if="isAtivo(item.to)"
					class="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full"
				></div>

				<!-- Ícone (24px × 24px = w-6 h-6) -->
				<Icon :name="item.icon" class="sidebar-item-icon" />

				<!-- Label (com transição de opacidade) -->
				<span
					v-show="isOpen"
					class="sidebar-item-text sidebar-item-transition text-[15px]"
					:class="isOpen ? 'opacity-100' : 'opacity-0'"
				>
					{{ item.label }}
				</span>

				<!-- Badge pedidos pendentes (expandido) -->
				<span
					v-if="item.badge && isOpen"
					class="sidebar-item-transition bg-error absolute right-3 rounded-full px-2 py-0.5 text-xs font-medium text-white"
					:class="isOpen ? 'opacity-100' : 'opacity-0'"
				>
					{{ item.badge }}
				</span>

				<!-- Badge pedidos pendentes (colapsado — ponto) -->
				<span
					v-if="item.badge && !isOpen"
					class="bg-error absolute top-1.5 right-1.5 size-2 rounded-full"
				></span>
			</NuxtLink>
		</nav>

		<!-- Rodapé: perfil do usuário -->
		<div class="border-border overflow-visible border-t p-2">
			<UiDropdown
				:items="userMenuItems"
				align="left"
				:side="isOpen ? 'top-bottom' : 'right'"
				full-width
				class="w-full"
				@select="onUserMenuSelect"
			>
				<template #trigger>
					<button
						type="button"
						class="sidebar-footer-btn bg-muted hover:bg-accent w-full rounded-lg py-2"
					>
						<!-- Avatar (40px = size-md) -->
						<UiAvatar
							:src="avatarUrl ?? undefined"
							:name="nomeCompleto"
							size="md"
							class="shrink-0"
						/>

						<!-- Nome + email (com transição de opacidade) -->
						<div
							v-show="isOpen"
							class="sidebar-item-transition ml-3 flex min-w-0 flex-1 flex-col text-left"
							:class="isOpen ? 'opacity-100' : 'opacity-0'"
						>
							<span class="text-foreground w-full truncate text-sm font-medium">{{
								nomeCompleto
							}}</span>
							<span class="text-muted-foreground w-full truncate text-xs">{{ email }}</span>
						</div>

						<!-- Ícone chevron (com transição de opacidade) -->
						<Icon
							v-show="isOpen"
							name="lucide:chevrons-up-down"
							class="text-muted-foreground sidebar-item-transition ml-1 size-4 shrink-0"
							:class="isOpen ? 'opacity-100' : 'opacity-0'"
						/>
					</button>
				</template>
			</UiDropdown>
		</div>
	</aside>
</template>

<style scoped>
/* Transições já estão definidas no main.css global:
   - .sidebar-transition (width 500ms)
   - .sidebar-item-transition (opacity 500ms)
   - .sidebar-header (centralização do logo)
   - .sidebar-item (centralização do ícone)
   - .sidebar-item-icon (tamanho fixo 24px)
   - .sidebar-item-text (margem e nowrap)
   - .sidebar-footer-btn (centralização do avatar)
*/
</style>
