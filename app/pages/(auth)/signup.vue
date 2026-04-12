<script setup lang="ts">
/**
 * /signup → SignupPage (auth-layout)
 */

import SignupPage from "~/features/auth/pages/SignupPage.vue";

definePageMeta({ layout: "auth-layout" });

useSeoMeta({
	title: "Criar conta — WebiDelivery",
	description: "Crie sua conta e comece a receber pedidos hoje.",
	robots: "noindex",
});
</script>

<template>
	<SignupPage />
</template>
