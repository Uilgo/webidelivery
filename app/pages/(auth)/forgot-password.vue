<script setup lang="ts">
/**
 * /forgot-password → ForgotPage (auth-layout)
 */

import ForgotPage from "~/features/auth/pages/ForgotPage.vue";

definePageMeta({ layout: "auth-layout" });

useSeoMeta({
	title: "Recuperar senha — WebiDelivery",
	robots: "noindex",
});
</script>

<template>
	<ForgotPage />
</template>
