<script setup lang="ts">
/**
 * /login → LoginPage (auth-layout)
 */

import LoginPage from "~/features/auth/pages/LoginPage.vue";

definePageMeta({ layout: "auth-layout" });

useSeoMeta({
	title: "Entrar — WebiDelivery",
	description: "Acesse o painel do seu estabelecimento.",
	robots: "noindex",
});
</script>

<template>
	<LoginPage />
</template>
