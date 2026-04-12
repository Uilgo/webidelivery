<script setup lang="ts">
/**
 * ResetPage — Página de redefinição de senha (após clicar no link do e-mail).
 */

import AuthManager from "~/features/auth/components/AuthManager.vue";
</script>

<template>
	<AuthManager mode="reset" />
</template>
