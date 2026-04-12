/**
 * GET /api/cep/:cep
 *
 * Consulta CEP server-side com múltiplos provedores e fallback automático.
 * ViaCEP → BrasilAPI → Postmon
 *
 * Features:
 * - Rate limiting (10 req/min por IP)
 * - Cache 24h via useStorage
 * - Fallback automático entre provedores
 */

import type {
	BrasilApiResponse,
	CepError,
	CepProvider,
	Endereco,
	PostmonResponse,
	ViaCepResponse,
} from "~~/shared/types/api/consulta-cep";
import { parseCEP } from "~~/shared/utils/formatters/formatar-cep";
import { isValidCEP } from "~~/shared/utils/validators/validar-cep";

const isDev = process.env.NODE_ENV === "development";

const cepCache = useStorage("cache:cep");

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (record.count >= limit) return false;

	record.count++;
	return true;
}

const CEP_PROVIDERS: CepProvider[] = [
	{
		name: "ViaCEP",
		url: (cep) => `https://viacep.com.br/ws/${cep}/json/`,
		timeout: 5000,
		transform: (data): Endereco => {
			const r = data as ViaCepResponse;
			if (r.erro) throw new Error("CEP não encontrado");
			return {
				cep: r.cep ?? "",
				logradouro: r.logradouro ?? "",
				complemento: r.complemento ?? undefined,
				bairro: r.bairro ?? "",
				localidade: r.localidade ?? "",
				uf: r.uf ?? "",
				estado: r.estado ?? "",
				regiao: r.regiao ?? undefined,
				ibge: r.ibge ?? undefined,
				ddd: r.ddd ?? undefined,
				siafi: r.siafi ?? undefined,
			};
		},
	},
	{
		name: "BrasilAPI",
		url: (cep) => `https://brasilapi.com.br/api/cep/v2/${cep}`,
		timeout: 4000,
		transform: (data): Endereco => {
			const r = data as BrasilApiResponse;
			return {
				cep: r.cep ?? "",
				logradouro: r.street ?? "",
				bairro: r.neighborhood ?? "",
				localidade: r.city ?? "",
				uf: r.state ?? "",
				estado: r.state ?? "",
			};
		},
	},
	{
		name: "Postmon",
		url: (cep) => `https://api.postmon.com.br/v1/cep/${cep}`,
		timeout: 4000,
		transform: (data): Endereco => {
			const r = data as PostmonResponse;
			return {
				cep: r.cep ?? "",
				logradouro: r.logradouro ?? "",
				bairro: r.bairro ?? "",
				localidade: r.cidade ?? "",
				uf: r.estado ?? "",
				estado: r.estado_info?.nome ?? r.estado ?? "",
				ibge: r.ibge ?? undefined,
			};
		},
	},
];

async function consultarCEP(cep: string): Promise<Endereco | CepError> {
	const cached = await cepCache.getItem<Endereco>(cep);
	if (cached) {
		if (isDev) console.warn(`[CEP] Cache hit: ${cep}`);
		return cached;
	}

	const cepLimpo = parseCEP(cep);
	if (!isValidCEP(cepLimpo)) {
		return { error: true, message: "CEP inválido. Deve conter exatamente 8 dígitos." };
	}

	for (const provider of CEP_PROVIDERS) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), provider.timeout);

			const response = await fetch(provider.url(cepLimpo), {
				signal: controller.signal,
				headers: { Accept: "application/json", "User-Agent": "WebiDelivery/1.0" },
			});

			clearTimeout(timeoutId);

			const data: unknown = await response.json();
			const endereco = provider.transform(data);

			if (isDev) console.warn(`[CEP] Sucesso: ${provider.name}`);

			// Cache por 24h
			await cepCache.setItem(cep, endereco, { ttl: 86_400 });

			return endereco;
		} catch {
			if (isDev) console.warn(`[CEP] Falhou: ${provider.name}`);
			if (provider === CEP_PROVIDERS[CEP_PROVIDERS.length - 1]) break;
		}
	}

	return { error: true, message: "CEP não encontrado em nenhum provedor disponível." };
}

export default defineEventHandler(async (event) => {
	const ip = getRequestIP(event) ?? "unknown";
	if (!checkRateLimit(ip)) {
		throw createError({ statusCode: 429, statusMessage: "Muitas requisições. Tente em 1 minuto." });
	}

	const cep = getRouterParam(event, "cep");
	if (!cep) {
		throw createError({ statusCode: 400, statusMessage: "CEP não informado" });
	}

	const resultado = await consultarCEP(cep);

	if ("error" in resultado) {
		throw createError({ statusCode: 404, statusMessage: resultado.message });
	}

	return resultado;
});
