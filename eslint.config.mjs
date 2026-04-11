// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
// @ts-ignore - tipos não disponíveis para flat config
import tsPlugin from "@typescript-eslint/eslint-plugin";
// @ts-ignore - tipos não disponíveis para flat config
import tsParser from "@typescript-eslint/parser";

export default withNuxt(
	{
		files: ["**/*.{js,ts,vue}"],
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			// Permitir @ts-ignore em arquivos de configuração
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{
					"ts-ignore": "allow-with-description",
					"ts-expect-error": "allow-with-description",
					minimumDescriptionLength: 10,
				},
			],
			// Regras Vue
			"vue/multi-word-component-names": "off",
			"vue/no-v-html": "warn",
			"vue/require-default-prop": "error",
			"vue/require-explicit-emits": "error",
			"vue/component-name-in-template-casing": ["error", "PascalCase"],
			"vue/html-button-has-type": "error",
			"vue/no-unused-refs": "warn",
			"vue/html-self-closing": [
				"error",
				{
					html: {
						void: "any",
						normal: "never",
						component: "always",
					},
					svg: "always",
					math: "always",
				},
			],

			// Regras JavaScript/TypeScript gerais
			"no-console": ["warn", { allow: ["warn", "error"] }],
			"prefer-const": "error",
			"no-var": "error",
		},
	},
	{
		files: ["app/**/*.ts", "app/**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			// Regras TypeScript rigorosas para arquivos .ts/.tsx
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		files: ["app/**/*.vue"],
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			// Regras TypeScript para arquivos .vue (sem sobrescrever o parser)
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
		},
	},
);
