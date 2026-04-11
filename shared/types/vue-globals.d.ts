/**
 * Arquivo de declarações globais para suprir gaps do TypeScript/Volar (ts-plugin).
 * Como algumas macros do Nuxt (ex: definePageMeta) podem demorar para serem indexadas
 * ou se perderem no cache da IDE caso os tipos gerados no .nuxt estejam desatualizados,
 * esta declaração força a IDE a reconhecer a assinatura no contexto global das views.
 */

declare global {
	/**
	 * Macro de compilador do Nuxt 3/4 para definir o layout, middleware, etc.
	 * Não precisa (nem deve) ser importada manualmente nos arquivos .vue.
	 */
	const definePageMeta: (_meta: Record<string, unknown>) => void;
}

export {};
