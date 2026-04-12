<script setup lang="ts">
/**
 * 📌 SidebarAdmin — Menu lateral do Painel Admin da Loja
 *
 * Exibe navegação com base no cargo do usuário (admin_loja, gerente_loja, staff_loja).
 * Itens invisíveis para cargos sem permissão (regra de "invisibilidade" do PRD).
 */

import { useLojaStore } from "~/stores/lojaStore";
import { useAdminMenu } from "../../composables/useAdminMenu";
import SidebarUserProfile from "./SidebarUserProfile.vue";

interface Props {
	modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: true,
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
}>();

const lojaStore = useLojaStore();
const { labelCargo, menuItems, isActiveRoute } = useAdminMenu();

const isOpen = computed({
	get: () => props.modelValue,
	set: (value) => emit("update:modelValue", value),
});

const nomeLoja = computed(() => lojaStore.nomeEstabelecimento);

// Logos brutas da Store (links diretos do banco: logo_light_url e logo_dark_url)
const urlLogoLight = computed(() => lojaStore.logoLightUrl);
const urlLogoDark = computed(() => lojaStore.logoDarkUrl);
</script>

<template>
	<aside
		class="sidebar-transition border-border bg-card flex h-full flex-col rounded-lg border shadow-sm"
	>
		<!-- Cabeçalho: logo + nome da loja -->
		<div class="sidebar-header border-border relative h-16 overflow-hidden border-b">
			<div
				v-if="urlLogoLight || urlLogoDark"
				class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg"
			>
				<!-- Renderiza as duas. O CSS (Tailwind dark:) decide qual esconder instantaneamente -->
				<img
					v-if="urlLogoLight"
					:src="urlLogoLight"
					:alt="`${nomeLoja} logo`"
					class="block h-full w-full object-contain dark:hidden"
				/>
				<img
					v-if="urlLogoDark"
					:src="urlLogoDark"
					:alt="`${nomeLoja} logo`"
					class="hidden h-full w-full object-contain dark:block"
				/>
			</div>
			<div v-else class="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
				<Icon name="lucide:store" class="text-primary-foreground h-7 w-7" />
			</div>
			<div
				v-show="isOpen"
				class="sidebar-item-transition ml-3 flex min-w-0 flex-col"
				:class="isOpen ? 'opacity-100' : 'opacity-0'"
			>
				<span class="text-foreground truncate text-sm font-semibold">{{ nomeLoja }}</span>
				<span class="text-muted-foreground text-xs">{{ labelCargo }}</span>
			</div>
		</div>

		<!-- Navegação principal -->
		<nav class="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2 py-4">
			<NuxtLink
				v-for="item in menuItems"
				:key="item.to"
				:to="item.to"
				class="sidebar-item relative h-11 rounded-lg font-medium transition-colors"
				:class="
					isActiveRoute(item.to) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
				"
			>
				<div
					v-if="isActiveRoute(item.to)"
					class="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full"
				></div>
				<Icon :name="item.icon" class="sidebar-item-icon" />
				<span
					v-show="isOpen"
					class="sidebar-item-text sidebar-item-transition text-[15px]"
					:class="isOpen ? 'opacity-100' : 'opacity-0'"
				>
					{{ item.label }}
				</span>
				<span
					v-if="item.badge && isOpen"
					class="sidebar-item-transition bg-destructive absolute right-3 rounded-full px-2 py-0.5 text-xs font-medium text-white"
					:class="isOpen ? 'opacity-100' : 'opacity-0'"
				>
					{{ item.badge }}
				</span>
				<span
					v-if="item.badge && !isOpen"
					class="bg-destructive absolute top-1.5 right-1.5 size-2 rounded-full"
				></span>
			</NuxtLink>
		</nav>

		<!-- Rodapé: card do usuário com dropdown -->
		<SidebarUserProfile :is-open="isOpen" />
	</aside>
</template>
