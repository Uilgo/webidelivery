/**
 * 📌 Store de Notificações In-App
 *
 * Gerencia notificações do usuário autenticado.
 * Leitura via SELECT direto (RLS garante isolamento).
 * Toda escrita (CUD) via RPC.
 *
 * TODO: substituir polling por Supabase Realtime quando disponível.
 */

import type { Notificacao } from "~~/shared/types/database/notificacoes";
import type {
	RpcMarcarNotificacaoLidaParams,
	RpcMarcarTodasLidasParams,
} from "~~/shared/types/rpc/notificacoes";

export const useNotificacoesStore = defineStore("notificacoes", () => {
	// ─── Estado ───────────────────────────────────────────────────────────────

	const notificacoes = ref<Notificacao[]>([]);
	const carregando = ref(false);
	const painelAberto = ref(false);

	// ─── Computed ─────────────────────────────────────────────────────────────

	const naoLidas = computed(() => notificacoes.value.filter((n) => !n.lida_em).length);
	const temNaoLidas = computed(() => naoLidas.value > 0);

	// ─── Actions ──────────────────────────────────────────────────────────────

	async function fetchNotificacoes(): Promise<void> {
		carregando.value = true;
		try {
			const supabase = useSupabaseClient();
			const { data, error } = await supabase
				.from("notificacoes")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) throw new Error(error.message);
			notificacoes.value = (data ?? []) as Notificacao[];
		} catch (e: unknown) {
			console.error("[notificacoesStore] Erro ao buscar notificações:", e);
		} finally {
			carregando.value = false;
		}
	}

	async function marcarLida(id: string): Promise<void> {
		// Otimista: atualiza localmente antes da confirmação do banco
		const notif = notificacoes.value.find((n) => n.id === id);
		if (notif) notif.lida_em = new Date().toISOString();

		try {
			const supabase = useSupabaseClient();
			const params: RpcMarcarNotificacaoLidaParams = { notificacao_id: id };
			await supabase.rpc("fn_rpc_marcar_notificacao_lida", params as never);
		} catch (e: unknown) {
			console.error("[notificacoesStore] Erro ao marcar como lida:", e);
			// Reverte em caso de erro
			if (notif) notif.lida_em = null;
		}
	}

	async function marcarTodasLidas(): Promise<void> {
		const agora = new Date().toISOString();
		// Otimista
		notificacoes.value.forEach((n) => {
			if (!n.lida_em) n.lida_em = agora;
		});

		try {
			const supabase = useSupabaseClient();
			// v2: useSupabaseUser() retorna JWT claims — o id está em .sub
			const claims = useSupabaseUser().value;
			const id = (claims as Record<string, unknown> | null)?.sub as string | undefined;
			if (!id) return;

			const params: RpcMarcarTodasLidasParams = { perfil_id: id };
			await supabase.rpc("fn_rpc_marcar_todas_lidas", params as never);
		} catch (e: unknown) {
			console.error("[notificacoesStore] Erro ao marcar todas como lidas:", e);
			await fetchNotificacoes(); // Reverte buscando do banco
		}
	}

	function togglePainel(): void {
		painelAberto.value = !painelAberto.value;
	}

	function fecharPainel(): void {
		painelAberto.value = false;
	}

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		// Estado
		notificacoes,
		carregando,
		painelAberto,

		// Computed
		naoLidas,
		temNaoLidas,

		// Actions
		fetchNotificacoes,
		marcarLida,
		marcarTodasLidas,
		togglePainel,
		fecharPainel,
	};
});
