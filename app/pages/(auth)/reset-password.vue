<script setup lang="ts">
/**
 * /reset-password → ResetPage (auth-layout)
 */

import ResetPage from "~/features/auth/pages/ResetPage.vue";

definePageMeta({ layout: "auth-layout" });

useSeoMeta({
	title: "Nova senha — WebiDelivery",
	robots: "noindex",
});
</script>

<template>
	<ResetPage />
</template>
