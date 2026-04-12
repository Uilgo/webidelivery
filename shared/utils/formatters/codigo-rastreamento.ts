/**
 * Formatadores de código de rastreamento e número de pedido.
 *
 * NOTA: A geração do codigo_rastreamento é feita pelo banco via trigger
 * (on_pedido_set_numero). Aqui ficam apenas formatação e validação para UI.
 */

/**
 * Formata código de rastreamento com hífen (XXXX-XXXX).
 *
 * @example
 * formatTrackingCode('A1B2C3D4') // 'A1B2-C3D4'
 */
export const formatTrackingCode = (code: string): string => {
	if (!code || typeof code !== "string") return "";
	const cleanCode = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
	if (cleanCode.length !== 8) return code;
	return `${cleanCode.slice(0, 4)}-${cleanCode.slice(4)}`;
};

/**
 * Valida formato de código de rastreamento (8 chars alfanuméricos).
 *
 * @example
 * isValidTrackingCode('A1B2-C3D4') // true
 * isValidTrackingCode('123') // false
 */
export const isValidTrackingCode = (code: string): boolean => {
	if (!code || typeof code !== "string") return false;
	const cleanCode = code.replace(/[^A-Z0-9]/gi, "");
	return /^[A-Z0-9]{8}$/i.test(cleanCode);
};

/**
 * Formata número sequencial de pedido para exibição nos cards do Kanban.
 *
 * @example
 * formatOrderNumber(1) // '#0001'
 * formatOrderNumber(123) // '#0123'
 */
export const formatOrderNumber = (numero: number): string => {
	return `#${String(numero).padStart(4, "0")}`;
};
