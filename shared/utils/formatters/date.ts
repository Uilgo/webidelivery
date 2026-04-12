/**
 * Formatadores de datas no padrão brasileiro.
 */

/**
 * Formata data no padrão brasileiro (DD/MM/YYYY).
 *
 * @example
 * formatDate(new Date('2024-01-15')) // '15/01/2024'
 */
export const formatDate = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	return `${day}/${month}/${d.getFullYear()}`;
};

/**
 * Formata data no padrão ISO (YYYY-MM-DD).
 *
 * @example
 * formatDateISO(new Date('2024-01-15')) // '2024-01-15'
 */
export const formatDateISO = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * Formata data e hora no padrão brasileiro (DD/MM/YYYY HH:mm).
 *
 * @example
 * formatDateTime(new Date('2024-01-15T14:30:00')) // '15/01/2024 14:30'
 */
export const formatDateTime = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const hours = String(d.getHours()).padStart(2, "0");
	const minutes = String(d.getMinutes()).padStart(2, "0");
	return `${day}/${month}/${d.getFullYear()} ${hours}:${minutes}`;
};

/**
 * Formata apenas a hora (HH:mm).
 *
 * @example
 * formatTime(new Date('2024-01-15T14:30:00')) // '14:30'
 */
export const formatTime = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	const hours = String(d.getHours()).padStart(2, "0");
	const minutes = String(d.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

/**
 * Formata data de forma relativa (há X minutos, há X horas, etc).
 *
 * @example
 * formatRelativeDate(new Date(Date.now() - 60000)) // 'há 1 minuto'
 */
export const formatRelativeDate = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";

	const diffMs = Date.now() - d.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	if (diffSec < 60) return "agora mesmo";
	if (diffMin < 60) return `há ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
	if (diffHour < 24) return `há ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`;
	if (diffDay < 30) return `há ${diffDay} ${diffDay === 1 ? "dia" : "dias"}`;
	if (diffMonth < 12) return `há ${diffMonth} ${diffMonth === 1 ? "mês" : "meses"}`;
	return `há ${diffYear} ${diffYear === 1 ? "ano" : "anos"}`;
};

/**
 * Formata data por extenso.
 *
 * @example
 * formatDateExtensive(new Date('2024-01-15')) // '15 de janeiro de 2024'
 */
export const formatDateExtensive = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";

	const months = [
		"janeiro",
		"fevereiro",
		"março",
		"abril",
		"maio",
		"junho",
		"julho",
		"agosto",
		"setembro",
		"outubro",
		"novembro",
		"dezembro",
	];

	return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
};

/**
 * Formata data abreviada (DD/MM).
 *
 * @example
 * formatDateShort(new Date('2024-01-15')) // '15/01'
 */
export const formatDateShort = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	return `${day}/${month}`;
};

/**
 * Converte string DD/MM/YYYY para Date.
 *
 * @example
 * parseDate('15/01/2024') // Date object
 */
export const parseDate = (dateString: string): Date | null => {
	if (!dateString || typeof dateString !== "string") return null;
	const parts = dateString.split("/");
	if (parts.length !== 3) return null;
	const day = parseInt(parts[0] ?? "0", 10);
	const month = parseInt(parts[1] ?? "0", 10) - 1;
	const year = parseInt(parts[2] ?? "0", 10);
	const date = new Date(year, month, day);
	return isNaN(date.getTime()) ? null : date;
};

/**
 * Converte string ISO (YYYY-MM-DD) para Date.
 *
 * @example
 * parseDateISO('2024-01-15') // Date object
 */
export const parseDateISO = (isoString: string): Date | null => {
	if (!isoString || typeof isoString !== "string") return null;
	const dateStr = isoString.includes("T") ? isoString : `${isoString}T00:00:00`;
	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
};

/**
 * Formata período entre duas datas.
 *
 * @example
 * formatDateRange(new Date('2024-01-15'), new Date('2024-01-20'))
 * // '15/01/2024 - 20/01/2024'
 */
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
	return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Calcula idade a partir da data de nascimento.
 *
 * @example
 * calculateAge(new Date('2000-01-15')) // 24 (em 2024)
 */
export const calculateAge = (birthDate: Date | string): number => {
	const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
	if (isNaN(birth.getTime())) return 0;

	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
	return age;
};
