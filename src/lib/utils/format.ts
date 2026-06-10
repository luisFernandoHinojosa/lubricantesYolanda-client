import { NO_DATA_LABEL } from '$lib/constants';

type BaseOptions = {
	fallback?: string;
};

const isNullish = (value: unknown): value is null | undefined =>
	value === null || value === undefined;

const isEmptyString = (value: unknown): boolean => typeof value === 'string' && value.trim() === '';

/**
 * Valor genérico (string, number, etc.)
 */
export function formatValue<T>(
	value: T,
	options?: BaseOptions & { treatEmptyStringAsNull?: boolean }
): T | string {
	const fallback = options?.fallback ?? NO_DATA_LABEL;

	if (isNullish(value)) return fallback;

	if (options?.treatEmptyStringAsNull !== false && isEmptyString(value)) {
		return fallback;
	}

	return value;
}

/**
 * Números
 */
export function formatNumber(
	value: number | null | undefined,
	options?: BaseOptions & Intl.NumberFormatOptions
): string {
	const fallback = options?.fallback ?? NO_DATA_LABEL;

	if (isNullish(value)) return fallback;

	return new Intl.NumberFormat(undefined, options).format(value);
}

/**
 * Moneda
 */
export function formatCurrency(
	value: number | string | null | undefined,
	currency = 'BOB',
	options?: BaseOptions
): string {
	const fallback = options?.fallback ?? NO_DATA_LABEL;

	if (isNullish(value)) return fallback;

	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency
	}).format(Number(value));
}

/**
 * Fechas
 */
// export function formatDate(
// 	value: string | Date | null | undefined,
// 	options?: BaseOptions & Intl.DateTimeFormatOptions
// ): string {
// 	const fallback = options?.fallback ?? NO_DATA_LABEL;

// 	if (isNullish(value)) return fallback;

// 	const date = new Date(value);

// 	if (isNaN(date.getTime())) return fallback;

// 	return new Intl.DateTimeFormat(undefined, options).format(date);
// }

export function formatDate(dateString?: string): string {
	if (isNullish(dateString)) return NO_DATA_LABEL;
	const [year, month, day] = dateString.split('T')[0].split('-');

	return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('es-ES', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}
/**
 * Booleanos
 */
export function formatBoolean(
	value: boolean | null | undefined,
	options?: BaseOptions & { trueLabel?: string; falseLabel?: string }
): string {
	const fallback = options?.fallback ?? NO_DATA_LABEL;

	if (isNullish(value)) return fallback;

	return value ? (options?.trueLabel ?? 'Sí') : (options?.falseLabel ?? 'No');
}
