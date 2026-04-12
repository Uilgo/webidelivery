/**
 * useNotifications — Composable de notificações globais
 *
 * Wrapper leve sobre notificacoesStore para uso nos componentes de layout.
 * Expõe apenas o necessário para o Header/painel de notificações.
 */

import { useNotificacoesStore } from "~/stores/notificacoesStore";

export const useNotifications = () => {
	const store = useNotificacoesStore();

	return {
		notificacoes: computed(() => store.notificacoes),
		naoLidas: computed(() => store.naoLidas),
		temNaoLidas: computed(() => store.temNaoLidas),
		painelAberto: computed(() => store.painelAberto),
		carregando: computed(() => store.carregando),

		fetchNotificacoes: store.fetchNotificacoes,
		marcarLida: store.marcarLida,
		marcarTodasLidas: store.marcarTodasLidas,
		togglePainel: store.togglePainel,
		fecharPainel: store.fecharPainel,
	};
};
