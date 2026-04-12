/**
 * 📌 Store de Loja
 *
 * Dados da loja do usuário autenticado (cargos do painel loja).
 * Sincroniza automaticamente com perfilStore via watch no lojaId.
 *
 * IMPORTANTE: Leitura via SELECT direto (RLS garante isolamento).
 * Toda escrita (CUD) deve ser feita via RPC.
 */

import { usePerfilStore } from "~/stores/perfilStore";
import type { Loja } from "~~/shared/types/database/core";

export const useLojaStore = defineStore("loja", () => {
	const perfilStore = usePerfilStore();

	// ─── Estado ───────────────────────────────────────────────────────────────

	const loja = useState<Loja | null>("loja.data", () => null);
	const carregando = ref(false);
	const erro = ref<string | null>(null);

	// ─── Computed — informações básicas ───────────────────────────────────────

	const nomeEstabelecimento = computed(() => loja.value?.nome_estabelecimento ?? "");
	const slug = computed(() => loja.value?.slug ?? "");
	const status = computed(() => loja.value?.status ?? null);
	const descricao = computed(() => loja.value?.descricao ?? null);
	const categoria = computed(() => loja.value?.categoria ?? null);

	// Logos (light/dark)
	const logoLightUrl = computed(() => loja.value?.logo_light_url ?? null);
	const logoDarkUrl = computed(() => loja.value?.logo_dark_url ?? null);

	// Contato
	const telefone = computed(() => loja.value?.telefone ?? null);
	const whatsapp = computed(() => loja.value?.whatsapp ?? null);
	const email = computed(() => loja.value?.email ?? null);

	// Endereço (colunas separadas no banco)
	const endereco = computed(() => {
		if (!loja.value) return null;
		return {
			rua: loja.value.endereco_rua,
			numero: loja.value.endereco_numero,
			complemento: loja.value.endereco_complemento,
			bairro: loja.value.endereco_bairro,
			cidade: loja.value.endereco_cidade,
			estado: loja.value.endereco_estado,
			cep: loja.value.endereco_cep,
			referencia: loja.value.endereco_referencia,
		};
	});

	// Status de funcionamento
	const aberto = computed(() => loja.value?.aberto ?? false);
	const forcarFechado = computed(() => loja.value?.forcar_fechado ?? false);

	// ─── Computed — configs JSONB ──────────────────────────────────────────────

	const configGeral = computed(() => loja.value?.config_geral ?? {});
	const configTema = computed(() => loja.value?.config_tema ?? {});
	const setupStatus = computed(() => loja.value?.setup_status ?? {});

	// Atalhos de tema
	const corPrimaria = computed(
		() => ((configTema.value as Record<string, unknown>)?.cor_primaria as string) ?? "#F97316",
	);
	const corSecundaria = computed(
		() => ((configTema.value as Record<string, unknown>)?.cor_secundaria as string) ?? "#1e293b",
	);

	// Onboarding — verifica se a loja completou o setup
	const onboardingConcluido = computed(() => perfilStore.onboardingStatus === "concluido");

	// ─── Actions ──────────────────────────────────────────────────────────────

	async function fetchLoja(): Promise<void> {
		const lojaId = perfilStore.lojaId;
		if (!lojaId) {
			clearLoja();
			return;
		}

		if (loja.value?.id === lojaId) return;

		carregando.value = true;
		erro.value = null;

		try {
			const supabase = useSupabaseClient();
			const { data, error: fetchError } = await supabase
				.from("lojas")
				.select("*")
				.eq("id", lojaId)
				.single();

			if (fetchError) throw new Error(fetchError.message);

			loja.value = data as unknown as Loja;
		} catch (e: unknown) {
			console.error("[lojaStore] Erro ao buscar loja:", e);
			erro.value = "Erro ao carregar dados da loja";
			clearLoja();
		} finally {
			carregando.value = false;
		}
	}

	function setLoja(data: Loja): void {
		loja.value = data;
	}

	function clearLoja(): void {
		loja.value = null;
		erro.value = null;
		carregando.value = false;
	}

	watch(
		() => perfilStore.lojaId,
		(novoLojaId) => {
			if (novoLojaId) fetchLoja();
			else clearLoja();
		},
		{ immediate: true },
	);

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		loja,
		carregando,
		erro,

		nomeEstabelecimento,
		slug,
		status,
		descricao,
		categoria,
		logoLightUrl,
		logoDarkUrl,
		telefone,
		whatsapp,
		email,
		endereco,
		aberto,
		forcarFechado,

		configGeral,
		configTema,
		setupStatus,
		corPrimaria,
		corSecundaria,
		onboardingConcluido,

		fetchLoja,
		setLoja,
		clearLoja,
	};
});
