<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "~/composables/core/useAuth";
import { usePerfilStore } from "~/stores/perfilStore";

interface Props {
	isOpen: boolean;
}

defineProps<Props>();

const perfilStore = usePerfilStore();
const { logout } = useAuth();

const ADMIN_BASE = "/admin";

const nomeCompleto = computed(() => perfilStore.nomeCompleto);
const email = computed(() => perfilStore.email);
const avatarUrl = computed(() => perfilStore.avatarUrl);

const userMenuItems = computed(() => [
	{ label: "Meu Perfil", value: "perfil", icon: "lucide:user" },
	{ label: "Notificações", value: "notificacoes", icon: "lucide:bell" },
	{ label: "", value: "sep-sair", separator: true },
	{ label: "Sair", value: "sair", icon: "lucide:log-out" },
]);

function handleUserMenuSelect(item: { value: string }): void {
	if (item.value === "perfil") navigateTo(`${ADMIN_BASE}/perfil`);
	else if (item.value === "notificacoes") navigateTo(`${ADMIN_BASE}/notificacoes`);
	else if (item.value === "sair") void logout();
}
</script>

<template>
	<div class="border-border overflow-visible border-t p-2">
		<UiDropdown
			:items="userMenuItems"
			align="left"
			:side="isOpen ? 'top-bottom' : 'right'"
			full-width
			class="w-full"
			@select="handleUserMenuSelect"
		>
			<template #trigger>
				<div
					class="sidebar-footer-btn bg-muted hover:bg-accent relative flex w-full cursor-pointer items-center rounded-lg py-2 pr-2 transition-colors"
				>
					<UiAvatar :src="avatarUrl ?? undefined" :name="nomeCompleto" size="md" class="shrink-0" />
					<div
						v-show="isOpen"
						class="sidebar-item-transition ml-3 flex min-w-0 flex-1 flex-col text-left"
						:class="isOpen ? 'opacity-100' : 'opacity-0'"
					>
						<span class="text-foreground w-full truncate text-sm font-medium">{{
							nomeCompleto
						}}</span>
						<span class="text-muted-foreground w-full truncate text-xs">{{ email }}</span>
					</div>
					<Icon
						v-show="isOpen"
						name="lucide:chevrons-up-down"
						class="text-muted-foreground sidebar-item-transition ml-1 h-4 w-4 shrink-0"
						:class="isOpen ? 'opacity-100' : 'opacity-0'"
					/>
				</div>
			</template>
		</UiDropdown>
	</div>
</template>
