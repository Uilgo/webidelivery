<script setup lang="ts">
/**
 * LayoutsModeToggle — Alternador de tema (light/dark/system)
 *
 * Dropdown próprio sem dependências externas.
 * Fecha ao clicar fora (onClickOutside via @vueuse/core).
 */

const colorMode = useColorMode();
const open = ref(false);
const containerRef = ref<HTMLElement | null>(null);

onClickOutside(containerRef, () => (open.value = false));

const options = [
	{ label: "Light", value: "light", icon: "lucide:sun" },
	{ label: "Dark", value: "dark", icon: "lucide:moon" },
	{ label: "System", value: "system", icon: "lucide:monitor" },
] as const;

type Option = (typeof options)[number];

const current = computed<Option>(
	() => options.find((o) => o.value === (colorMode.preference || "system")) ?? options[2],
);

function select(value: Option["value"]) {
	colorMode.preference = value;
	open.value = false;
}
</script>

<template>
	<div ref="containerRef" class="relative">
		<!-- Trigger -->
		<button
			type="button"
			:aria-label="`Tema atual: ${current.label}. Clique para alterar`"
			:aria-expanded="open"
			aria-haspopup="listbox"
			class="hover:bg-accent inline-flex size-10 items-center justify-center rounded transition-colors"
			@click="open = !open"
		>
			<Icon :name="current.icon" />
		</button>

		<!-- Dropdown -->
		<Transition
			enter-active-class="transition-all duration-150 ease-out"
			enter-from-class="opacity-0 scale-95 -translate-y-1"
			enter-to-class="opacity-100 scale-100 translate-y-0"
			leave-active-class="transition-all duration-100 ease-in"
			leave-from-class="opacity-100 scale-100 translate-y-0"
			leave-to-class="opacity-0 scale-95 -translate-y-1"
		>
			<div
				v-if="open"
				role="listbox"
				:aria-label="`Selecionar tema`"
				class="border-border bg-popover absolute top-full right-0 z-50 mt-1 min-w-36 space-y-0.5 rounded-md border p-1 shadow-md"
			>
				<button
					v-for="option in options"
					:key="option.value"
					type="button"
					role="option"
					:aria-selected="option.value === current.value"
					class="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm transition-colors"
					:class="
						option.value === current.value
							? 'bg-accent text-foreground font-medium'
							: 'text-muted-foreground hover:bg-accent hover:text-foreground'
					"
					@click="select(option.value)"
				>
					<Icon :name="option.icon" />
					<span class="flex-1 text-left">{{ option.label }}</span>
					<Icon v-if="option.value === current.value" name="lucide:check" aria-hidden="true" />
				</button>
			</div>
		</Transition>
	</div>
</template>
