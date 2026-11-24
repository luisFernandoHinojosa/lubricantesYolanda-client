import { apiMilenium } from '$lib/config';
import type {
	KardexFilters,
	KardexApiResponse,
	KardexPaginatedData,
	TarjetaKardex,
	TarjetaKardexFilters
} from '$lib/interfaces/kardexMovimiento.interface';

// Solo envía los filtros con valor
const toParams = (filters: object): string => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
	}
	return params.toString();
};

export const kardexService = {
	async getKardexMovimientos(filters: KardexFilters = {}): Promise<KardexPaginatedData> {
		const response = await apiMilenium.get<KardexApiResponse>(
			`/kardex_movimientos?${toParams(filters)}`
		);
		return response.data;
	},

	async getTarjetaKardex(
		idProducto: string,
		filters: TarjetaKardexFilters = {}
	): Promise<TarjetaKardex> {
		const response = await apiMilenium.get<{ status: string; data: TarjetaKardex }>(
			`/kardex_movimientos/producto/${idProducto}?${toParams(filters)}`
		);
		return response.data;
	}
};
