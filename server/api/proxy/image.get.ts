/**
 * GET /api/proxy/image?url=https://...
 *
 * Proxy de imagens externas para contornar CORS.
 * Usado pelo componente UiPictureUpload na funcionalidade de URL.
 *
 * Features:
 * - Rate limiting (5 req/min por IP)
 * - Cache 1h via useStorage
 * - Whitelist de domínios confiáveis
 * - Proteção SSRF (bloqueia IPs privados)
 * - Limite de 10MB por imagem
 */

const isDev = process.env.NODE_ENV === "development";

const imageCache = useStorage("cache:images");

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_DOMAINS = [
	"images.unsplash.com",
	"source.unsplash.com",
	"cdn.pixabay.com",
	"images.pexels.com",
	"picsum.photos",
	"res.cloudinary.com",
	"cloudinary.com",
	"imgix.net",
	"ik.imagekit.io",
	"i.imgur.com",
	"imgur.com",
	"live.staticflickr.com",
	"i.postimg.cc",
	"b-cdn.net",
	"cloudfront.net",
	"akamaized.net",
	"fastly.net",
	"s3.amazonaws.com",
	"amazonaws.com",
	"storage.googleapis.com",
	"googleapis.com",
	"googleusercontent.com",
	"lh3.googleusercontent.com",
	"blob.core.windows.net",
	"raw.githubusercontent.com",
	"user-images.githubusercontent.com",
	"github.com",
	"wp.com",
	"i0.wp.com",
	"i1.wp.com",
	"i2.wp.com",
	"wordpress.com",
	"media.giphy.com",
	"giphy.com",
	"media.tenor.com",
	"imagekit.io",
	"sirv.com",
];

function checkRateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
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

function isDomainAllowed(hostname: string): boolean {
	return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
}

function isPrivateIP(hostname: string): boolean {
	if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(hostname)) return true;
	if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) return true;
	if (hostname.startsWith("169.254.")) return true;
	return false;
}

export default defineEventHandler(async (event) => {
	const ip = getRequestIP(event) ?? "unknown";
	if (!checkRateLimit(ip)) {
		throw createError({ statusCode: 429, statusMessage: "Muitas requisições. Tente em 1 minuto." });
	}

	const { url } = getQuery(event) as { url?: string };

	if (!url) {
		throw createError({ statusCode: 400, statusMessage: "URL é obrigatória" });
	}

	let urlObj: URL;
	try {
		urlObj = new URL(url);
	} catch {
		throw createError({ statusCode: 400, statusMessage: "URL inválida" });
	}

	if (!url.startsWith("https://")) {
		throw createError({ statusCode: 400, statusMessage: "Apenas URLs HTTPS são permitidas" });
	}

	if (!isDomainAllowed(urlObj.hostname)) {
		throw createError({ statusCode: 403, statusMessage: "Domínio não permitido" });
	}

	if (isPrivateIP(urlObj.hostname)) {
		throw createError({ statusCode: 403, statusMessage: "Acesso a IPs privados não permitido" });
	}

	// Cache key baseada na URL (truncada para evitar chaves gigantes)
	const cacheKey = btoa(url).substring(0, 64);

	const cached = await imageCache.getItem<{ data: string; contentType: string }>(cacheKey);
	if (cached) {
		if (isDev) console.warn(`[Proxy Image] Cache hit: ${url}`);
		setResponseHeaders(event, {
			"Content-Type": cached.contentType,
			"Cache-Control": "public, max-age=3600",
			"X-Cache": "HIT",
		});
		return Buffer.from(cached.data, "base64");
	}

	try {
		const response = await fetch(url, {
			headers: { "User-Agent": "Mozilla/5.0 (compatible; WebiDelivery/1.0)" },
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) {
			throw createError({ statusCode: response.status, statusMessage: `Erro ao baixar imagem` });
		}

		const contentType = response.headers.get("content-type") ?? "application/octet-stream";

		const isImage =
			contentType.includes("image/") || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)$/i.test(url);

		if (!isImage) {
			throw createError({
				statusCode: 400,
				statusMessage: "URL não aponta para uma imagem válida",
			});
		}

		const contentLength = response.headers.get("content-length");
		if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
			throw createError({ statusCode: 413, statusMessage: "Imagem muito grande (máximo 10MB)" });
		}

		const buffer = await response.arrayBuffer();

		if (buffer.byteLength > 10 * 1024 * 1024) {
			throw createError({ statusCode: 413, statusMessage: "Imagem muito grande (máximo 10MB)" });
		}

		// Salva no cache como base64 (1h)
		const base64 = Buffer.from(buffer).toString("base64");
		await imageCache.setItem(cacheKey, { data: base64, contentType }, { ttl: 3600 });

		if (isDev) console.warn(`[Proxy Image] Cache miss: ${url}`);

		setResponseHeaders(event, {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=3600",
			"X-Cache": "MISS",
		});

		return Buffer.from(buffer);
	} catch (error) {
		if (error && typeof error === "object" && "statusCode" in error) throw error;
		if (error instanceof Error && error.name === "TimeoutError") {
			throw createError({ statusCode: 504, statusMessage: "Timeout ao baixar a imagem" });
		}
		if (isDev) console.error("[Proxy Image] Erro:", error);
		throw createError({ statusCode: 500, statusMessage: "Erro ao processar a imagem" });
	}
});
