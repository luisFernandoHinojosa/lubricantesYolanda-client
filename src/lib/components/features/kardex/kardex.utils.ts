import { fechaLocal } from '$lib/utils';
import type {
	KardexMovimiento,
	NaturalezaKardex,
	TipoMovimientoKardex
} from '$lib/interfaces/kardexMovimiento.interface';

export const TIPOS_MOVIMIENTO: { value: TipoMovimientoKardex; label: string; clase: string }[] = [
	{ value: 'INGRESO', label: 'Ingreso', clase: 'border-green-200 bg-green-50 text-green-700' },
	{ value: 'VENTA', label: 'Venta', clase: 'border-red-200 bg-red-50 text-red-700' },
	{ value: 'TRASLADO', label: 'Traslado', clase: 'border-blue-200 bg-blue-50 text-blue-700' },
	{ value: 'AJUSTE', label: 'Ajuste', clase: 'border-amber-200 bg-amber-50 text-amber-700' },
	{
		value: 'DEVOLUCION',
		label: 'Devolución',
		clase: 'border-violet-200 bg-violet-50 text-violet-700'
	},
	{ value: 'ANULACION', label: 'Anulación', clase: 'border-gray-300 bg-gray-100 text-gray-700' }
];

export const tipoInfo = (tipo: TipoMovimientoKardex) =>
	TIPOS_MOVIMIENTO.find((t) => t.value === tipo) ?? {
		value: tipo,
		label: tipo,
		clase: 'border-gray-200 bg-gray-50 text-gray-700'
	};

export const NATURALEZAS: { value: NaturalezaKardex; label: string }[] = [
	{ value: 'ENTRADA', label: 'Entradas (+)' },
	{ value: 'SALIDA', label: 'Salidas (−)' },
	{ value: 'NEUTRO', label: 'Sin efecto (traslados internos)' }
];

export const colorNaturaleza = (n: NaturalezaKardex) =>
	n === 'ENTRADA' ? 'text-green-600' : n === 'SALIDA' ? 'text-red-600' : 'text-blue-600';

const fmtCantidad = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 });
const fmtMoneda = new Intl.NumberFormat('es-BO', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

export const formatCantidad = (n: number | null | undefined) =>
	n === null || n === undefined ? '—' : fmtCantidad.format(n);

export const formatBs = (n: number | null | undefined) =>
	n === null || n === undefined ? '—' : `Bs ${fmtMoneda.format(n)}`;

/** "+24 Lt", "−2 Lt" o "↔ 10 Lt" según la naturaleza del movimiento */
export const cantidadConSigno = (mov: KardexMovimiento) => {
	const unidad = mov.producto.unidad ? ` ${mov.producto.unidad}` : '';
	const signo = mov.naturaleza === 'ENTRADA' ? '+' : mov.naturaleza === 'SALIDA' ? '−' : '↔ ';
	return `${signo}${formatCantidad(mov.cantidad)}${unidad}`;
};

const fmtFecha = new Intl.DateTimeFormat('es-BO', {
	timeZone: 'America/La_Paz',
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});
const fmtHora = new Intl.DateTimeFormat('es-BO', {
	timeZone: 'America/La_Paz',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

/** Hora en formato 24 h con indicador AM/PM, p. ej. "14:05 PM" */
const formatHora = (d: Date) => {
	const hora = fmtHora.format(d);
	const h = Number(hora.slice(0, 2));
	return `${hora} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Fecha y hora de un instante, en hora de Bolivia */
export const fechaHora = (iso: string) => {
	const d = new Date(iso);
	return { fecha: fmtFecha.format(d), hora: formatHora(d) };
};

/**
 * Número de comprobante de venta del documento, si lo hay. Las devoluciones y anulaciones
 * también traen el número de la venta original.
 */
export const comprobanteVenta = (documento: { tipo: string; numero: string } | null) =>
	documento && ['VENTA', 'DEVOLUCION', 'ANULACION'].includes(documento.tipo)
		? documento.numero
		: null;

/** Fecha de calendario (DATEONLY) sin aplicar zona horaria */
export const formatFechaCalendario = (yyyyMmDd: string | null | undefined) => {
	if (!yyyyMmDd) return '—';
	const [y, m, d] = yyyyMmDd.slice(0, 10).split('-');
	return `${d}/${m}/${y}`;
};

/** Días hasta el vencimiento (negativo si ya venció) */
export const diasParaVencer = (yyyyMmDd: string | null | undefined) => {
	if (!yyyyMmDd) return null;
	const hoy = new Date(`${fechaLocal()}T00:00:00`);
	const venc = new Date(`${yyyyMmDd.slice(0, 10)}T00:00:00`);
	return Math.round((venc.getTime() - hoy.getTime()) / 86_400_000);
};

export type PresetPeriodo = 'hoy' | '7d' | 'mes' | 'mes_anterior' | 'todo' | 'personalizado';

export const PRESETS_PERIODO: { value: PresetPeriodo; label: string }[] = [
	{ value: 'hoy', label: 'Hoy' },
	{ value: '7d', label: '7 días' },
	{ value: 'mes', label: 'Este mes' },
	{ value: 'mes_anterior', label: 'Mes anterior' },
	{ value: 'todo', label: 'Todo' }
];

/** Rango 'YYYY-MM-DD' (hora de Bolivia) para un preset */
export const rangoDePreset = (preset: PresetPeriodo): { desde: string; hasta: string } => {
	const hoyStr = fechaLocal();
	const [y, m, d] = hoyStr.split('-').map(Number);
	// Fechas "de calendario" construidas a mediodía para evitar saltos de día
	const cal = (yy: number, mm: number, dd: number) =>
		fechaLocal(new Date(Date.UTC(yy, mm - 1, dd, 16)));

	switch (preset) {
		case 'hoy':
			return { desde: hoyStr, hasta: hoyStr };
		case '7d':
			return { desde: cal(y, m, d - 6), hasta: hoyStr };
		case 'mes':
			return { desde: cal(y, m, 1), hasta: hoyStr };
		case 'mes_anterior':
			return { desde: cal(y, m - 1, 1), hasta: cal(y, m, 0) };
		default:
			return { desde: '', hasta: '' };
	}
};
