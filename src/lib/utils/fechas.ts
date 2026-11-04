// Zona horaria del negocio (Bolivia, UTC-4 sin horario de verano)
export const ZONA_HORARIA = 'America/La_Paz';

const formatoFecha = new Intl.DateTimeFormat('en-CA', {
	timeZone: ZONA_HORARIA,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/**
 * Fecha local de Bolivia en formato 'YYYY-MM-DD', para filtros y valores de <input type="date">.
 * No usar `date.toISOString().split('T')[0]`: devuelve la fecha en UTC y después de las
 * 20:00 da el día siguiente.
 */
export const fechaLocal = (date: Date | string = new Date()): string =>
	formatoFecha.format(new Date(date));
