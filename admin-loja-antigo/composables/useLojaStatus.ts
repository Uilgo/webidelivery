import { computed } from "vue";
import { useSupabaseClient } from "#imports";
import { useLojaStore } from "~/stores/lojaStore";

export function useLojaStatus() {
	const lojaStore = useLojaStore();
	const supabase = useSupabaseClient();

	// Toggle loja aberta/fechada via RPC
	async function toggleLojaAberta(): Promise<void> {
		const lojaId = lojaStore.loja?.id;
		if (!lojaId) return;

		try {
			const { data } = await supabase.rpc("fn_rpc_toggle_loja_aberta", { p_loja_id: lojaId });
			if (data && typeof data === "object" && "aberto" in data) {
				lojaStore.loja!.aberto = (data as { aberto: boolean }).aberto;
			}
		} catch (e) {
			console.error("[useLojaStatus] Erro ao alternar status da loja:", e);
		}
	}

	const lojaAberta = computed(() => lojaStore.aberto);

	return {
		lojaAberta,
		toggleLojaAberta,
	};
}
