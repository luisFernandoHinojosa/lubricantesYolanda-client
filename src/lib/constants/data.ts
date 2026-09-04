import type { METODOS_PAGO } from '$lib/interfaces/venta.interface';

export const NO_DATA_LABEL = '—';

export const METODOS_PAGO_LABEL: Record<METODOS_PAGO, string> = {
	EFECTIVO: 'Efectivo',
	QR: 'QR',
	TARJETA: 'Tarjeta'
};
