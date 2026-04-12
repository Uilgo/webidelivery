/**
 * useCep — Composable para consulta de CEP
 *
 * Encapsula validação, formatação e consulta via server route /api/cep/[cep].
 * Gerencia estados de loading, erro e dados automaticamente.
 *
 * @example
 * const { endereco, isLoading, error, buscarCEP } = useCep()
 * await buscarCEP('01001-000')
 * console.log(endereco.value?.logradouro) // "Praça da Sé"
 */

import type { Endereco } from "~~/shared/types/api/consulta-cep";
import { parseCEP } from "~~/shared/utils/formatters/formatar-cep";
import { isValidCEP } from "~~/shared/utils/validators/validar-cep";

export const useCep = () => {
	const endereco = ref<Endereco | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	/**
	 * Busca endereço por CEP via server route (com cache e fallback de provedores).
	 *
	 * @param cep - CEP com ou sem formatação (XXXXX-XXX ou XXXXXXXX)
	 */
	async function buscarCEP(cep: string): Promise<void> {
		endereco.value = null;
		error.value = null;

		// Remove formatação e valida
		const cepLimpo = parseCEP(cep);
		if (!isValidCEP(cepLimpo)) {
			error.value = "CEP inválido. Digite um CEP válido com 8 dígitos.";
			return;
		}

		isLoading.value = true;

		try {
			const resultado = await $fetch<Endereco>(`/api/cep/${cepLimpo}`);
			endereco.value = resultado;
		} catch {
			error.value = "CEP não encontrado. Verifique e tente novamente.";
		} finally {
			isLoading.value = false;
		}
	}

	function limpar(): void {
		endereco.value = null;
		error.value = null;
		isLoading.value = false;
	}

	return {
		endereco: readonly(endereco),
		isLoading: readonly(isLoading),
		error: readonly(error),
		buscarCEP,
		limpar,
	};
};
