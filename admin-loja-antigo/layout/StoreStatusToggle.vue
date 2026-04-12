<script setup lang="ts">
import { computed } from "vue";
import { usePerfilStore } from "~/stores/perfilStore";
import { CARGOS } from "~~/shared/constants/rbac";
import { useLojaStatus } from "../../composables/useLojaStatus";

const perfilStore = usePerfilStore();
const { lojaAberta, toggleLojaAberta } = useLojaStatus();

const isGerente = computed(
	() => perfilStore.cargo === CARGOS.ADMIN_LOJA || perfilStore.cargo === CARGOS.GERENTE_LOJA,
);
</script>

<template>
	<span v-if="isGerente" class="hidden md:inline-flex">
		<UiBadge
			:color="lojaAberta ? 'success' : 'error'"
			variant="soft"
			size="lg"
			rounded
			class="cursor-pointer items-center gap-2 px-4 py-2"
		>
			<UiSwitch
				:model-value="lojaAberta"
				:color="lojaAberta ? 'success' : 'error'"
				size="sm"
				@update:model-value="toggleLojaAberta"
			/>
			<span class="inline-block w-[88px]">{{ lojaAberta ? "Loja Aberta" : "Loja Fechada" }}</span>
		</UiBadge>
	</span>
</template>
