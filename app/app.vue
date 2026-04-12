<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>

		<!-- Sistema Global de Notificações (Client-only para evitar hydration mismatch) -->
		<ClientOnly>
			<UiToaster />
		</ClientOnly>
	</div>
</template>
