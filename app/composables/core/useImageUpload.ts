/**
 * useImageUpload — Upload de imagens para storage externo
 *
 * ⚠️ Storage ainda não definido.
 * Quando o provider for escolhido (ex: Cloudinary), implementar aqui.
 * Quem chama só recebe a URL pública final — a implementação interna é transparente.
 */

export interface ImageUploadOptions {
	/** Pasta de destino no storage (ex: "lojas/abc123") */
	folder?: string;
	/** Máximo em bytes (padrão: 2MB) */
	maxSize?: number;
	/** Tipos MIME aceitos */
	accept?: string[];
}

export interface ImageUploadResult {
	url: string;
	publicId: string;
	width: number;
	height: number;
	format: string;
}

export const useImageUpload = () => {
	const isUploading = ref(false);

	/**
	 * TODO: Implementar quando o storage for definido.
	 * Por enquanto lança erro informativo.
	 */
	async function upload(
		_file: File,
		_options: ImageUploadOptions = {},
	): Promise<ImageUploadResult> {
		throw new Error(
			"Storage não configurado. Implemente useImageUpload quando o provider for definido.",
		);
	}

	return {
		upload,
		isUploading: readonly(isUploading),
	};
};
