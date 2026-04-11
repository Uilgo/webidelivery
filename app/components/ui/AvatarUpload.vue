<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, inject } from "vue";
import { useId } from "#imports";

/**
 * UiAvatarUpload — Componente de upload de avatar do design system WebiDelivery
 *
 * Comprime e redimensiona imagens. Default: 256x256px e ~50KB.
 * Usa classes do design system, como ring-border, bg-muted, text-foreground, etc.
 *
 * @example
 * <UiAvatarUpload v-model="avatarUrl" label="Foto de perfil" />
 * <UiAvatarUpload v-model="avatarUrl" :size="150" :maxSize="512" />
 */

interface Props {
	modelValue: string;
	label?: string;
	hint?: string;
	error?: string;
	/** Tamanho do preview em pixels (default: 120) */
	size?: number;
	/** Tamanho máximo da imagem em pixels (default: 256) */
	maxSize?: number;
	/** Tamanho máximo em KB (default: 50) */
	maxSizeKB?: number;
	disabled?: boolean;
	id?: string;
	name?: string;
}

const props = withDefaults(defineProps<Props>(), {
	label: undefined,
	hint: undefined,
	error: undefined,
	size: 120,
	maxSize: 256,
	maxSizeKB: 2048,
	disabled: false,
	id: undefined,
	name: undefined,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

// Injeta id do FormField se disponível, senão gera um novo
const generatedId = useId();
const fieldId = inject<string>("formfield-id", "");
const computedId = computed(() => props.id || fieldId || generatedId);

const activeTab = ref("upload");
const tempUrl = ref("");
const fileInputRef = ref<HTMLInputElement | null>(null);
const isCompressing = ref(false);
const showPreviewModal = ref(false);
const imageSize = ref<number | null>(null);
const imageSource = ref<"upload" | "url">("upload");

const calculateBase64Size = (base64: string): number => {
	const base64Data = base64.split(",")[1] || base64;
	return Math.round((base64Data.length * 3) / 4);
};

const formattedSize = computed(() => {
	if (!imageSize.value) return null;
	if (imageSize.value < 1024) return `${imageSize.value} B`;
	return `${(imageSize.value / 1024).toFixed(1)} KB`;
});

const tabs = [
	{ key: "upload", id: "upload", label: "Upload", icon: "lucide:upload" },
	{ key: "url", id: "url", label: "URL", icon: "lucide:link" },
];

const compressImage = async (file: File): Promise<string> => {
	try {
		const imageCompression = (await import("browser-image-compression")).default;
		const options = {
			maxSizeMB: props.maxSizeKB / 1024,
			maxWidthOrHeight: props.maxSize,
			useWebWorker: true,
			fileType: "image/webp" as const,
			initialQuality: 0.9,
		};
		const compressedFile = await imageCompression(file, options);
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(compressedFile);
		});
	} catch (error) {
		console.error("Erro ao comprimir imagem:", error);
		// Fallback
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}
};

const compressFromUrl = async (url: string): Promise<string> => {
	try {
		// Se a URL já é base64, usar diretamente
		if (url.startsWith("data:image/")) {
			imageSize.value = calculateBase64Size(url);
			return url;
		}

		const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;
		const response = await fetch(proxyUrl);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
		}
		const blob = await response.blob();
		if (!blob.type.startsWith("image/")) {
			throw new Error("O arquivo baixado não é uma imagem válida");
		}
		const file = new File([blob], "avatar.jpg", { type: blob.type });
		return compressImage(file);
	} catch (error) {
		console.error("Erro ao baixar/processar imagem:", error);
		throw new Error(
			`Erro ao processar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
		);
	}
};

const applyUrl = async () => {
	if (!tempUrl.value) return;
	isCompressing.value = true;
	try {
		const compressed = await compressFromUrl(tempUrl.value);
		imageSize.value = calculateBase64Size(compressed);
		imageSource.value = "url";
		emit("update:modelValue", compressed);
		tempUrl.value = "";
	} catch (error) {
		console.error("Erro ao processar avatar:", error);
		alert(
			`Erro: ${error instanceof Error ? error.message : "Não foi possível processar a imagem"}`,
		);
	} finally {
		isCompressing.value = false;
	}
};

const removeImage = () => {
	emit("update:modelValue", "");
	imageSize.value = null;
	imageSource.value = "upload";
};

const triggerFileInput = () => {
	if (props.disabled) return;
	fileInputRef.value?.click();
};

const handleFileSelect = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (file) {
		isCompressing.value = true;
		try {
			const compressed = await compressImage(file);
			imageSize.value = calculateBase64Size(compressed);
			imageSource.value = "upload";
			emit("update:modelValue", compressed);
		} catch (error) {
			console.error("Erro ao comprimir avatar:", error);
		} finally {
			isCompressing.value = false;
		}
	}
	input.value = "";
};

const handleChangeClick = () => {
	if (props.disabled) return;
	if (imageSource.value === "url") {
		activeTab.value = "url";
		removeImage();
	} else {
		triggerFileInput();
	}
};

const handlePreviewClick = () => {
	if (isCompressing.value || props.disabled) return;
	if (props.modelValue) {
		showPreviewModal.value = true;
	} else if (activeTab.value === "upload") {
		triggerFileInput();
	}
};

watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue) {
			imageSize.value = calculateBase64Size(newValue);
		} else {
			imageSize.value = null;
		}
	},
	{ immediate: true },
);

const isMounted = ref(false);
onMounted(() => {
	nextTick(() => {
		isMounted.value = true;
	});
});

/**
 * Classes computadas para o container do Avatar (baseadas no Design System)
 */
const previewContainerClasses = computed(() => {
	const classes = [
		"relative",
		"flex",
		"items-center",
		"justify-center",
		"rounded-full",
		"border-2",
		"transition-all",
		"overflow-hidden",
		"bg-muted",
	];

	if (props.modelValue) {
		classes.push("border-border", "cursor-pointer");
	} else {
		classes.push("border-dashed", "border-border");
	}

	if (props.error) {
		classes.push("border-error!");
	}

	if (!props.modelValue && !isCompressing.value && !props.disabled) {
		classes.push("cursor-pointer", "hover:border-primary");
	}

	if (props.disabled) {
		classes.push("opacity-60", "cursor-not-allowed", "hover:border-border");
	}

	return classes;
});
</script>

<template>
	<div class="max-w-sm space-y-2">
		<!-- Label do componente -->
		<label v-if="label" :for="computedId" class="text-foreground block text-sm font-medium">
			{{ label }}
		</label>

		<!-- Abas: Upload local vs URL (full-width acima de tudo) -->
		<div class="bg-muted flex w-full gap-1 rounded-lg p-1">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				type="button"
				:class="[
					'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
					activeTab === tab.key
						? 'bg-card text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground',
				]"
				@click="activeTab = tab.key"
			>
				<Icon v-if="tab.icon" :name="tab.icon" class="size-4" />
				<span>{{ tab.label }}</span>
			</button>
		</div>

		<!-- Layout: Preview circular + Controles -->
		<div class="mt-3 flex items-start gap-4">
			<!-- Preview do Avatar -->
			<div class="flex shrink-0 flex-col items-center gap-1.5">
				<div class="group relative">
					<!-- Container com background -->
					<div
						:class="previewContainerClasses"
						:style="{ width: `${size}px`, height: `${size}px` }"
						@click="handlePreviewClick"
					>
						<!-- Loading de compressão -->
						<div v-if="isCompressing" class="flex flex-col items-center">
							<Icon name="lucide:loader-circle" class="text-primary size-6 animate-spin" />
							<span class="text-muted-foreground mt-1 text-xs">Processando</span>
						</div>

						<!-- Imagem Renderizada -->
						<img
							v-else-if="modelValue"
							:src="modelValue"
							alt="Avatar"
							class="absolute inset-0 h-full w-full object-cover"
						/>

						<!-- Estado vazio -->
						<div v-else class="flex flex-col items-center">
							<Icon name="lucide:user" class="text-muted-foreground size-8" />
							<span class="text-muted-foreground mt-1 px-1 text-center text-[10px]">Avatar</span>
						</div>

						<!-- Overlay Zoom/Focus -->
						<div
							v-if="modelValue && !isCompressing"
							class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/40"
						>
							<Icon
								name="lucide:camera"
								class="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</div>
					</div>

					<!-- Botão Remover Avatar -->
					<button
						v-if="modelValue && !isCompressing && !disabled"
						type="button"
						class="bg-error text-error-foreground hover:bg-error/90 ring-border focus-visible:ring-ring absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
						title="Remover avatar"
						@click.stop="removeImage"
					>
						<Icon name="lucide:x" class="size-4" />
					</button>
				</div>

				<!-- Tamanho recomendado abaixo do avatar -->
				<span class="text-muted-foreground/60 text-center text-[9px]"
					>{{ maxSize }}x{{ maxSize }}</span
				>
			</div>

			<!-- Espaço de Controles Laterais -->
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<!-- Alterar / Selecionar -->
				<button
					v-if="activeTab === 'upload' || modelValue"
					type="button"
					:disabled="isCompressing || disabled"
					class="border-neutral text-foreground hover:bg-neutral/10 inline-flex h-10 w-full items-center justify-center gap-2 rounded border bg-transparent px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 select-none disabled:opacity-50"
					@click="handleChangeClick"
				>
					<Icon
						:name="modelValue && imageSource === 'url' ? 'lucide:link' : 'lucide:upload'"
						class="size-4 shrink-0"
						aria-hidden="true"
					/>
					{{ modelValue ? "Alterar" : "Selecionar" }}
				</button>

				<!-- URL Input -->
				<div v-if="activeTab === 'url' && !modelValue" class="flex w-full items-stretch gap-2">
					<!-- Input URL nativo -->
					<div
						class="bg-input border-border flex h-10 min-w-0 flex-1 items-center gap-2 rounded border px-3 text-sm transition-colors"
					>
						<Icon
							name="lucide:link"
							class="text-muted-foreground size-4 shrink-0"
							aria-hidden="true"
						/>
						<input
							v-model="tempUrl"
							type="url"
							placeholder="Cole a URL da img"
							:disabled="isCompressing || disabled"
							class="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
						/>
					</div>
					<!-- Botão Confirmar URL -->
					<button
						type="button"
						:disabled="!tempUrl || isCompressing || disabled"
						class="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-sm font-medium transition-colors duration-150 select-none disabled:opacity-50"
						@click="applyUrl"
					>
						<Icon v-if="isCompressing" name="lucide:loader-circle" class="size-4 animate-spin" />
						<Icon v-else name="lucide:check" class="size-4" />
					</button>
				</div>

				<!-- Regras de Upload -->
				<div class="text-muted-foreground/70 mt-1 space-y-1 text-[11px] leading-tight">
					<p>PNG, JPG, JPEG, SVG, WebP</p>
					<p>
						Tam máx:
						{{
							maxSizeKB >= 1024
								? (maxSizeKB / 1024).toFixed(1).replace(".0", "") + "MB"
								: maxSizeKB + "KB"
						}}.
					</p>
					<p v-if="formattedSize" class="text-primary mt-1 font-medium">
						Atual: {{ formattedSize }}
					</p>
				</div>
			</div>
		</div>

		<!-- Input nativo (escondido) -->
		<input
			:id="computedId"
			ref="fileInputRef"
			type="file"
			:name="name"
			accept="image/*"
			class="hidden"
			:disabled="disabled"
			@change="handleFileSelect"
		/>

		<!-- Erro de validação -->
		<p v-if="error" class="text-error mt-1 flex items-center gap-1.5 text-xs">
			<Icon name="lucide:alert-circle" class="size-3.5" />
			{{ error }}
		</p>

		<!-- Modal de Preview Ampliado -->
		<Teleport v-if="isMounted && showPreviewModal" to="body">
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="showPreviewModal = false"
			>
				<div
					class="bg-card border-border relative w-full max-w-sm overflow-hidden rounded-xl border shadow-xl"
				>
					<!-- Header do Modal -->
					<div class="border-border flex items-center justify-between border-b p-4">
						<h3 class="text-foreground text-base font-semibold">Visualização Completa</h3>
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:ring-2 focus:outline-none"
							@click="showPreviewModal = false"
						>
							<Icon name="lucide:x" class="size-5" />
						</button>
					</div>

					<!-- Visualização -->
					<div class="flex flex-col items-center gap-4 p-6">
						<div
							class="border-border bg-muted flex items-center justify-center overflow-hidden rounded-full border"
							style="width: 256px; height: 256px"
						>
							<img
								v-if="modelValue"
								:src="modelValue"
								alt="Avatar em tamanho maior"
								class="h-full w-full object-cover"
							/>
						</div>
						<!-- Hint compacto abaixo do avatar no portal ampliado -->
						<p
							class="text-muted-foreground flex items-center justify-center gap-1.5 text-center text-[11px] font-medium tracking-wide opacity-70"
						>
							<Icon name="lucide:info" class="size-3.5" />
							<span
								>Otimizado para {{ maxSize }}x{{ maxSize }}px. Máx
								{{
									maxSizeKB >= 1024
										? (maxSizeKB / 1024).toFixed(1).replace(".0", "") + "MB"
										: maxSizeKB + "KB"
								}}.</span
							>
							<span v-if="formattedSize">• Atual: {{ formattedSize }}</span>
						</p>
					</div>

					<!-- Fechar Modal -->
					<div class="border-border bg-muted/30 flex justify-end border-t p-4">
						<button
							type="button"
							class="border-neutral text-neutral hover:bg-neutral/10 inline-flex h-10 items-center justify-center gap-2 rounded border bg-transparent px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 select-none"
							@click="showPreviewModal = false"
						>
							Fechar Preview
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
