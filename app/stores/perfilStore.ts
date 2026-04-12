/**
 * 📌 Store de Perfil do Usuário
 *
 * Fonte de verdade do perfil autenticado.
 * O banco usa role_id (FK → roles) — fazemos join para obter o slug do cargo.
 *
 * IMPORTANTE: Leitura via SELECT direto (RLS garante isolamento).
 * Toda escrita (CUD) deve ser feita via RPC.
 */

import {
	CARGOS,
	CARGOS_ADMIN,
	CARGOS_LOJA,
	CARGOS_OPERACIONAIS,
	CARGOS_PLATAFORMA,
} from "~~/shared/constants/rbac";
import type { Perfil } from "~~/shared/types/database/core";

export interface PerfilSessao {
	id: string;
	cargo: string; // slug do role (ex: 'admin_loja')
	nome: string;
	sobrenome: string;
	email: string;
	avatar_url: string | null;
	empresa_id: string | null;
	loja_id: string | null;
	status: string;
	onboarding_status: string | null;
}

export const usePerfilStore = defineStore("perfil", () => {
	const user = useSupabaseUser();

	// ─── Estado ───────────────────────────────────────────────────────────────

	const perfil = useState<Perfil | null>("perfil.data", () => null);
	// Slug do cargo resolvido via join com roles
	const cargoSlug = useState<string | null>("perfil.cargo", () => null);
	const carregando = ref(false);
	const erro = ref<string | null>(null);

	// ─── Computed — informações básicas ───────────────────────────────────────

	const autenticado = computed(() => !!user.value && !!perfil.value);
	const cargo = computed(() => cargoSlug.value);
	const nomeCompleto = computed(() =>
		perfil.value ? `${perfil.value.nome} ${perfil.value.sobrenome}`.trim() : "",
	);
	const primeiroNome = computed(() => perfil.value?.nome ?? "");
	const avatarUrl = computed(() => perfil.value?.avatar_url ?? null);
	const email = computed(() => perfil.value?.email ?? "");
	const status = computed(() => perfil.value?.status ?? null);
	const onboardingStatus = computed(() => perfil.value?.onboarding_status ?? null);
	const senhaTemporaria = computed(() => perfil.value?.senha_temporaria ?? false);

	// IDs de relacionamento
	const lojaId = computed(() => perfil.value?.loja_id ?? null);
	const empresaId = computed(() => perfil.value?.empresa_id ?? null);

	// ─── Computed — verificações de cargo ─────────────────────────────────────

	const isAdminMaster = computed(() => cargoSlug.value === CARGOS.ADMIN_MASTER);
	const isGerenteMaster = computed(() => cargoSlug.value === CARGOS.GERENTE_MASTER);
	const isAdminLoja = computed(() => cargoSlug.value === CARGOS.ADMIN_LOJA);
	const isGerenteLoja = computed(() => cargoSlug.value === CARGOS.GERENTE_LOJA);
	const isStaffLoja = computed(() => cargoSlug.value === CARGOS.STAFF_LOJA);
	const isEntregador = computed(() => cargoSlug.value === CARGOS.ENTREGADOR);

	const isCargoPlataforma = computed(
		() => !!cargoSlug.value && (CARGOS_PLATAFORMA as readonly string[]).includes(cargoSlug.value),
	);
	const isCargoLoja = computed(
		() => !!cargoSlug.value && (CARGOS_LOJA as readonly string[]).includes(cargoSlug.value),
	);
	const isCargoAdmin = computed(
		() => !!cargoSlug.value && (CARGOS_ADMIN as readonly string[]).includes(cargoSlug.value),
	);
	const isCargoOperacional = computed(
		() => !!cargoSlug.value && (CARGOS_OPERACIONAIS as readonly string[]).includes(cargoSlug.value),
	);

	// ─── Sessão resumida ──────────────────────────────────────────────────────

	const sessao = computed((): PerfilSessao | null => {
		if (!perfil.value || !cargoSlug.value) return null;
		return {
			id: perfil.value.id,
			cargo: cargoSlug.value,
			nome: perfil.value.nome,
			sobrenome: perfil.value.sobrenome,
			email: perfil.value.email,
			avatar_url: perfil.value.avatar_url,
			empresa_id: perfil.value.empresa_id,
			loja_id: perfil.value.loja_id,
			status: perfil.value.status,
			onboarding_status: perfil.value.onboarding_status,
		};
	});

	// ─── Actions ──────────────────────────────────────────────────────────────

	async function fetchPerfil(userId?: string): Promise<void> {
		// v2: useSupabaseUser() retorna JWT claims — o id está em .sub
		const claims = user.value;
		const claimsId = (claims as Record<string, unknown> | null)?.sub as string | undefined;
		const id = userId ?? claimsId;

		if (!id) {
			console.warn("[perfilStore] fetchPerfil chamado sem ID. Abortando.");
			return;
		}

		if (perfil.value?.id === id) return;

		carregando.value = true;
		erro.value = null;

		try {
			const supabase = useSupabaseClient();

			// Join com roles para obter o slug do cargo em uma única query
			const { data, error: fetchError } = await supabase
				.from("perfis")
				.select("*, roles!inner(slug)")
				.eq("id", id)
				.single();

			if (fetchError) {
				erro.value = fetchError.code === "PGRST116" ? "perfil_nao_encontrado" : "erro_tecnico";
				console.error("[perfilStore] Erro ao buscar perfil:", fetchError.message);
				return;
			}

			// Extrai o slug do cargo do join e separa do perfil
			const { roles, ...perfilData } = data as Perfil & { roles: { slug: string } };
			perfil.value = perfilData as Perfil;
			cargoSlug.value = roles.slug;
		} catch (e: unknown) {
			console.error("[perfilStore] Erro inesperado:", e);
			erro.value = "erro_tecnico";
		} finally {
			carregando.value = false;
		}
	}

	function setPerfil(data: Perfil, slug: string): void {
		perfil.value = data;
		cargoSlug.value = slug;
	}

	function clearPerfil(): void {
		perfil.value = null;
		cargoSlug.value = null;
		erro.value = null;
		carregando.value = false;
	}

	// ─── Retorno ──────────────────────────────────────────────────────────────

	return {
		perfil,
		carregando,
		erro,

		autenticado,
		cargo,
		nomeCompleto,
		primeiroNome,
		avatarUrl,
		email,
		status,
		onboardingStatus,
		senhaTemporaria,

		lojaId,
		empresaId,

		sessao,

		isAdminMaster,
		isGerenteMaster,
		isAdminLoja,
		isGerenteLoja,
		isStaffLoja,
		isEntregador,
		isCargoPlataforma,
		isCargoLoja,
		isCargoAdmin,
		isCargoOperacional,

		fetchPerfil,
		setPerfil,
		clearPerfil,
	};
});
