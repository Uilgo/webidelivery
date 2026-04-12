import { useRoute } from "vue-router";
import { usePerfilStore } from "~/stores/perfilStore";
import { useLojaStore } from "~/stores/lojaStore";
import { useSupabaseClient } from "#imports";
import { CARGOS } from "~~/shared/constants/rbac";

export interface MenuItem {
	label: string;
	icon: string;
	to: string;
	badge?: number;
	permission?: boolean;
}

const ADMIN_BASE = "/admin";

export function useAdminMenu() {
	const route = useRoute();
	const perfilStore = usePerfilStore();
	const lojaStore = useLojaStore();
	const supabase = useSupabaseClient();

	const isGerente = computed(
		() => perfilStore.cargo === CARGOS.ADMIN_LOJA || perfilStore.cargo === CARGOS.GERENTE_LOJA,
	);

	// Busca a contagem de pedidos que necessitam atenção ("pendente")
	const { data: pendingOrdersCount } = useAsyncData(
		`pending-orders-count-${lojaStore.loja?.id}`,
		async () => {
			if (!lojaStore.loja?.id) return 0;

			const { count, error } = await supabase
				.from("pedidos")
				.select("*", { count: "exact", head: true })
				.eq("loja_id", lojaStore.loja.id)
				.eq("status", "pendente"); // Fica observando apenas pedidos com status "pendente"

			if (error) {
				console.error("[useAdminMenu] Erro ao buscar contagem de pedidos pendentes", error);
				return 0;
			}
			return count ?? 0;
		},
		{ watch: [() => lojaStore.loja?.id] }, // Refaz o fetch se a loja mudar
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

	const menuItems = computed<MenuItem[]>(() => {
		const items: MenuItem[] = [
			{ label: "Dashboard", icon: "lucide:layout-dashboard", to: `${ADMIN_BASE}/dashboard` },
			{
				label: "Pedidos",
				icon: "lucide:shopping-bag",
				to: `${ADMIN_BASE}/pedidos`,
				badge:
					(pendingOrdersCount.value ?? 0) > 0 ? (pendingOrdersCount.value ?? undefined) : undefined,
			},
			{ label: "Cardápio", icon: "lucide:utensils", to: `${ADMIN_BASE}/cardapio` },
			{ label: "Marketing", icon: "lucide:megaphone", to: `${ADMIN_BASE}/marketing` },
			{
				label: "Clientes",
				icon: "lucide:users",
				to: `${ADMIN_BASE}/clientes`,
				permission: isGerente.value,
			},
			{
				label: "Equipe",
				icon: "lucide:users-round",
				to: `${ADMIN_BASE}/equipe`,
				permission: isGerente.value,
			},
			{
				label: "Relatórios",
				icon: "lucide:bar-chart-3",
				to: `${ADMIN_BASE}/relatorios`,
				permission: isGerente.value,
			},
			{
				label: "Configurações",
				icon: "lucide:settings",
				to: `${ADMIN_BASE}/configuracoes`,
				permission: isGerente.value,
			},
		];
		return items.filter((item) => item.permission === undefined || item.permission);
	});

	function isActiveRoute(path: string): boolean {
		return route.path === path;
	}

	return {
		isGerente,
		labelCargo,
		menuItems,
		isActiveRoute,
	};
}
