<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, inject } from "vue";
import { useId } from "#imports";

/**
 * UiPictureUpload — Componente de upload de imagem com compressão automática e preview.
 * Suporta upload de arquivo ou URL com validação de tamanho.
 * Adaptado para o design system WebiDelivery.
 */

interface Props {
	modelValue: string;
	label?: string;
	hint?: string;
	error?: string;
	previewBg?: "light" | "dark";
	maxSize?: number;
	maxSizeKB?: number;
	disabled?: boolean;
	id?: string;
	name?: string;
}

const props = withDefaults(defineProps<Props>(), {
	label: undefined,
	hint: undefined,
	error: undefined,
	previewBg: "light",
	maxSize: 512,
	maxSizeKB: 2048,
	disabled: false,
	id: undefined,
	name: undefined,
});

// Injeta id do FormField se disponível, senão gera um novo
const generatedId = useId();
const fieldId = inject<string>("formfield-id", "");
const computedId = computed(() => props.id || fieldId || generatedId);

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

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
		// Fallback se compressão falhar
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
		const file = new File([blob], "image.jpg", { type: blob.type });
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
		// Se a URL já é base64, usar diretamente
		if (tempUrl.value.startsWith("data:image/")) {
			imageSize.value = calculateBase64Size(tempUrl.value);
			imageSource.value = "url";
			emit("update:modelValue", tempUrl.value);
			tempUrl.value = "";
			isCompressing.value = false;
			return;
		}

		// Caso contrário, baixar via proxy e comprimir
		const compressed = await compressFromUrl(tempUrl.value);
		imageSize.value = calculateBase64Size(compressed);
		imageSource.value = "url";
		emit("update:modelValue", compressed);
		tempUrl.value = "";
	} catch (error) {
		console.error("Erro ao processar imagem:", error);
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
			console.error("Erro ao comprimir imagem:", error);
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

// Computa classes do preview
const previewBgClass = computed(() => (props.previewBg === "dark" ? "bg-muted" : "bg-card"));

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
</script>

<template>
	<div class="max-w-sm space-y-2">
		<!-- Label -->
		<label v-if="label" :for="computedId" class="text-foreground block text-sm font-medium">
			{{ label }}
		</label>

		<!-- Tabs (full-width acima de tudo) -->
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

		<!-- Layout responsivo -->
		<div class="mt-3 flex items-start gap-4">
			<!-- Preview -->
			<div class="flex shrink-0 flex-col items-center gap-1.5">
				<div class="group relative">
					<!-- Container Preview -->
					<div
						:class="[
							'relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 transition-all',
							!modelValue && 'border-border border-dashed',
							!modelValue && !isCompressing && !disabled && 'hover:border-primary cursor-pointer',
							modelValue && 'border-border hover:border-primary cursor-pointer',
							error && 'border-error!',
							disabled && 'hover:border-border cursor-not-allowed opacity-60',
							previewBgClass,
						]"
						@click="handlePreviewClick"
					>
						<!-- Loading -->
						<div v-if="isCompressing" class="flex flex-col items-center">
							<Icon name="lucide:loader-circle" class="text-primary size-8 animate-spin" />
							<span class="text-muted-foreground mt-1 text-xs">Processando...</span>
						</div>

						<!-- Imagem base64/url -->
						<img
							v-else-if="modelValue"
							:src="modelValue"
							alt="Preview"
							class="absolute inset-0 h-full w-full object-cover"
						/>

						<!-- Vazio (Placeholder) -->
						<div v-else class="flex flex-col items-center">
							<Icon name="lucide:image-plus" class="text-muted-foreground size-8" />
							<span class="text-muted-foreground mt-1 text-xs">Selecionar</span>
						</div>

						<!-- Overlay Zoom Hover -->
						<div
							v-if="modelValue && !isCompressing"
							class="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-all group-hover:bg-black/40"
						>
							<Icon
								name="lucide:zoom-in"
								class="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</div>
					</div>

					<!-- Fechar/Remover imagem -->
					<button
						v-if="modelValue && !isCompressing && !disabled"
						type="button"
						class="bg-error text-error-foreground ring-border hover:bg-error/90 absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-1 transition-colors"
						title="Remover"
						@click.stop="removeImage"
					>
						<Icon name="lucide:x" class="size-4" />
					</button>
				</div>
				<!-- Tamanho recomendado abaixo do preview -->
				<span class="text-muted-foreground/60 text-center text-[9px]"
					>{{ maxSize }}x{{ maxSize }}</span
				>
			</div>

			<!-- Controles -->
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<!-- Selecionar arquivo / Alterar foto -->
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

				<!-- URL upload tab -->
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

				<!-- Helper/Tips -->
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

		<!-- Input arquivo oculto -->
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

		<!-- Mensagem de erro -->
		<p v-if="error" class="text-error mt-1 flex items-center gap-1.5 text-xs">
			<Icon name="lucide:alert-circle" class="size-3.5" />
			{{ error }}
		</p>

		<!-- Modal Preview -->
		<Teleport v-if="isMounted && showPreviewModal" to="body">
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="showPreviewModal = false"
			>
				<div
					class="bg-card border-border relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border shadow-xl"
				>
					<!-- Header do modal -->
					<div class="border-border flex items-center justify-between border-b px-6 py-4">
						<h3 class="text-foreground text-lg font-semibold">Visualização da Imagem</h3>
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2"
							@click="showPreviewModal = false"
						>
							<Icon name="lucide:x" class="size-5" />
						</button>
					</div>

					<!-- Corpo do modal -->
					<div class="flex-1 overflow-y-auto p-6">
						<div class="flex flex-col items-center gap-4">
							<div
								:class="[
									'border-border flex h-full min-h-64 w-full items-center justify-center rounded-xl border-2 p-4',
									previewBgClass,
								]"
							>
								<img
									v-if="modelValue"
									:src="modelValue"
									alt="Preview completo"
									class="max-h-[500px] max-w-full object-contain"
								/>
							</div>
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
					</div>

					<!-- Footer do modal -->
					<div class="border-border bg-muted/30 flex items-center justify-end border-t px-6 py-4">
						<button
							type="button"
							class="border-neutral text-neutral hover:bg-neutral/10 inline-flex h-10 items-center justify-center gap-2 rounded border bg-transparent px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 select-none"
							@click="showPreviewModal = false"
						>
							Fechar
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
