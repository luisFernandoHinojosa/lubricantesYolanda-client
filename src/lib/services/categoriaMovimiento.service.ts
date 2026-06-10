import { apiMilenium } from '$lib/config';
import type {
	CategoriaMovimientoFilters,
	CategoriaMovimientoResponse,
	CreateCategoriaMovimientoDto,
	UpdateCategoriaMovimientoDto,
	CategoriaMovimiento
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

export const categoriaMovimientoService = {
	async getCategoriasMovimientos(filters: CategoriaMovimientoFilters = {}): Promise<CategoriaMovimientoResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.tipo) params.append('tipo', filters.tipo);

		const response = await apiMilenium.get<CategoriaMovimientoResponse>(`/categorias_movimientos?${params.toString()}`);
		return response.data;
	},

	async createCategoriaMovimiento(data: CreateCategoriaMovimientoDto): Promise<CategoriaMovimiento> {
		const response = await apiMilenium.post<ApiResponse<CategoriaMovimiento>>('/categorias_movimientos', data);
		return response.data;
	},

	async updateCategoriaMovimiento(id: string, data: UpdateCategoriaMovimientoDto): Promise<CategoriaMovimiento> {
		const response = await apiMilenium.put<ApiResponse<CategoriaMovimiento>>(`/categorias_movimientos/${id}`, data);
		return response.data;
	},

	async deleteCategoriaMovimiento(id: string): Promise<void> {
		await apiMilenium.delete(`/categorias_movimientos/${id}`);
	}
};
