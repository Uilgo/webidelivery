/**
 * Tipos para API de Consulta de CEP
 *
 * Suporta múltiplos provedores:
 * - ViaCEP (principal)
 * - BrasilAPI (fallback)
 * - Postmon (backup)
 */

// =============================================
// RESPOSTA PADRÃO (formato unificado)
// =============================================

export interface Endereco {
	cep: string;
	logradouro: string;
	complemento?: string;
	bairro: string;
	localidade: string;
	uf: string;
	estado: string;
	regiao?: string;
	ibge?: string;
	ddd?: string;
	siafi?: string;
}

export interface CepError {
	error: true;
	message: string;
}

export interface ViaCepResponse {
	cep?: string;
	logradouro?: string;
	complemento?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
	estado?: string;
	regiao?: string;
	ibge?: string;
	gia?: string;
	ddd?: string;
	siafi?: string;
	erro?: boolean;
}

export interface BrasilApiResponse {
	cep?: string;
	state?: string; // UF
	city?: string; // localidade
	neighborhood?: string; // bairro
	street?: string;
	service?: string;
}

export interface PostmonResponse {
	cep?: string;
	logradouro?: string;
	bairro?: string;
	cidade?: string;
	estado?: string;
	estado_info?: {
		area_km2?: string;
		codigo_ibge?: string;
		nome?: string;
	};
	cidade_info?: {
		area_km2?: string;
		codigo_ibge?: string;
	};
	ibge?: string;
}

export interface CepProvider {
	name: string;
	url: (cep: string) => string;
	timeout: number;
	transform: (data: unknown) => Endereco;
}
