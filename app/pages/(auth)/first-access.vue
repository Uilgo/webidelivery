<script setup lang="ts">
/**
 * /first-access → FirstAccessPage (auth-layout)
 * Troca de senha obrigatória para contas criadas nativamente.
 */

import FirstAccessPage from "~/features/auth/pages/FirstAccessPage.vue";

definePageMeta({ layout: "auth-layout" });

useSeoMeta({
	title: "Primeiro acesso — WebiDelivery",
	robots: "noindex",
});
</script>

<template>
	<FirstAccessPage />
</template>
