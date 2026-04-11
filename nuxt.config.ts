import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	modules: [
		"@pinia/nuxt",
		"@nuxt/eslint",
		"@nuxt/icon",
		"@nuxt/image",
		"@nuxt/fonts",
		"@vueuse/nuxt",
		"@nuxtjs/color-mode",
	],

	css: ["~/assets/css/main.css"],

	// Server-Side Rendering (Obrigatório para SEO)
	ssr: true,

	// SEO Global (apenas para páginas públicas)
	app: {
		head: {
			htmlAttrs: { lang: "pt-BR" },
			title: "WebiDelivery", // Título padrão (será sobrescrito dinamicamente)
			titleTemplate: "%s", // Sem template - cada página define seu próprio título
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "format-detection", content: "telephone=no" },
				// Meta tags padrão (serão sobrescritas dinamicamente)
				{
					name: "description",
					content: "Plataforma de delivery para restaurantes e estabelecimentos",
				},
				{ name: "robots", content: "index, follow" },
				// Open Graph padrão
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: "WebiDelivery" },
				// Twitter Card
				{ name: "twitter:card", content: "summary_large_image" },
			],
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
				{ rel: "canonical", href: "https://webidelivery.com.br" },
			],
		},
	},

	// Configuração do Color Mode (system/dark/light)
	colorMode: {
		preference: "system", // Valor padrão: segue preferência do sistema
		fallback: "light", // Fallback se não encontrar preferência do sistema
		classSuffix: "", // Remove sufixo da classe (usa apenas 'dark' ao invés de 'dark-mode')
		storage: "cookie",
		storageKey: "nuxt-color-mode", // Chave no cookie
		dataValue: "theme", // Atributo data-theme no HTML
	},

	fonts: {
		provider: "google",
		families: [
			{
				name: "Inter",
				provider: "google",
				weights: ["300", "400", "500", "600", "700", "800"],
				styles: ["normal"],
				subsets: ["latin", "latin-ext"],
				global: true,
			},
		],
		defaults: {
			weights: ["400"],
			styles: ["normal"],
			subsets: ["latin", "latin-ext"],
		},
	},

	// ESLint
	eslint: {
		config: {
			typescript: true,
		},
	},

	// Configuração do Nuxt Icon (otimizada)
	icon: {
		serverBundle: {
			collections: ["lucide"], // Apenas Lucide
		},
		// Garantir que os ícones sejam renderizados no servidor
		clientBundle: {
			scan: true,
			sizeLimitKb: 256,
		},
	},

	// Otimização de Imagens
	image: {
		format: ["webp", "avif"], // Prioriza AVIF (menor) e WebP
		quality: 80,
		// Configuração para aceitar qualquer origem
		provider: "ipx",
	},

	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: ["zod"],
		},
		build: {
			sourcemap: false,
			cssCodeSplit: true,

			rollupOptions: {
				// Suprimir avisos específicos de imports não utilizados no Supabase
				onwarn(warning, warn) {
					// Ignorar avisos de imports não utilizados nos pacotes do Supabase
					if (
						warning.code === "UNUSED_EXTERNAL_IMPORT" &&
						warning.message &&
						warning.message.indexOf("@supabase") !== -1
					) {
						return;
					}
					// Passar outros avisos normalmente
					warn(warning);
				},
			},
		},
	},

	typescript: {
		strict: true,
		typeCheck: false,
		shim: false,
		tsConfig: {
			compilerOptions: {
				module: "esnext",
				moduleResolution: "bundler",
				target: "es2022",
				lib: ["dom", "dom.iterable", "es2022"],
				paths: {
					"~/*": ["./app/*"],
					"~~/*": ["./*"],
				},
			},
		},
	},
});
