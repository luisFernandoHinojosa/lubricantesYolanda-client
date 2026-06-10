import { apiMilenium } from '$lib/config';
import type {
	KardexFilters,
	KardexApiResponse,
	KardexPaginatedData
} from '$lib/interfaces/kardexMovimiento.interface';

export const kardexService = {
	async getKardexMovimientos(filters: KardexFilters = {}): Promise<KardexPaginatedData> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.tipo_movimiento) params.append('tipo_movimiento', filters.tipo_movimiento);

		const response = await apiMilenium.get<KardexApiResponse>(`/kardex_movimientos?${params.toString()}`);

		return response.data;
	}
};