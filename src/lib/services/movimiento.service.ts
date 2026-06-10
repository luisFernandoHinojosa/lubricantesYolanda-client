import { apiMilenium } from '$lib/config';
import type {
	MovimientoFilters,
	MovimientoResponse,
	CreateMovimientoDto,
	UpdateMovimientoDto,
	Movimiento
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

export const movimientoService = {
	async getMovimientos(filters: MovimientoFilters = {}): Promise<MovimientoResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.tipo) params.append('tipo', filters.tipo);
		if (filters.tipoPago) params.append('tipoPago', filters.tipoPago);
		if (filters.divisa) params.append('divisa', filters.divisa);
		if (filters.categoriaMovimientoId)
			params.append('categoriaMovimientoId', filters.categoriaMovimientoId);
		if (filters.sucursalId) params.append('sucursalId', filters.sucursalId);
		if (filters.sortBy) params.append('sortBy', filters.sortBy);
		if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

		const response = await apiMilenium.get<MovimientoResponse>(`/movimientos?${params.toString()}`);
		return response.data;
	},

	async createMovimiento(data: CreateMovimientoDto): Promise<Movimiento> {
		const response = await apiMilenium.post<ApiResponse<Movimiento>>('/movimientos', data);
		return response.data;
	},

	async updateMovimiento(id: string, data: UpdateMovimientoDto): Promise<Movimiento> {
		const response = await apiMilenium.put<ApiResponse<Movimiento>>(`/movimientos/${id}`, data);
		return response.data;
	},

	async deleteMovimiento(id: string): Promise<void> {
		await apiMilenium.delete(`/movimientos/${id}`);
	},

	async getReporteMovimientos(
		filters: import('$lib/interfaces').ReporteMovimientoFilters
	): Promise<import('$lib/interfaces').ReporteMovimientoResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.startDate) params.append('startDate', filters.startDate);
		if (filters.endDate) params.append('endDate', filters.endDate);
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<import('$lib/interfaces').ReporteMovimientoResponse>(
			`/movimientos/reporte/rango-fechas?${params.toString()}`
		);
		return response.data;
	}
};
