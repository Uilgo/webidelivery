<script setup lang="ts">
/**
 * FirstAccessPage — Troca de senha obrigatória para contas criadas nativamente.
 */

import AuthManager from "~/features/auth/components/AuthManager.vue";
</script>

<template>
	<AuthManager mode="first-access" />
</template>
