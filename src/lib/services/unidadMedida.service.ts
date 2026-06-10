import { apiMilenium } from '$lib/config';
import type {
	UnidadMedidaResponse,
	UnidadMedidaFilters,
	UnidadMedida,
	CreateUnidadMedidaDto,
	UpdateUnidadMedidaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class UnidadMedidaService {
	async getUnidadMedidas(filters: UnidadMedidaFilters = {}): Promise<UnidadMedidaResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<UnidadMedidaResponse>(
			`/unidad_medidas?${params.toString()}`
		);
		return response.data;
	}

	async getUnidadMedidaById(id: string): Promise<UnidadMedida> {
		const response = await apiMilenium.get<ApiResponse<UnidadMedida>>(`/unidad_medidas/${id}`);
		return response.data;
	}

	async createUnidadMedida(unidadMedida: CreateUnidadMedidaDto): Promise<UnidadMedida> {
		const response = await apiMilenium.post<ApiResponse<UnidadMedida>>(
			'/unidad_medidas',
			unidadMedida
		);
		return response.data;
	}

	async updateUnidadMedida(id: string, unidadMedida: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
		const response = await apiMilenium.put<ApiResponse<UnidadMedida>>(
			`/unidad_medidas/${id}`,
			unidadMedida
		);
		return response.data;
	}

	async deleteUnidadMedida(id: string): Promise<void> {
		await apiMilenium.delete(`/unidad_medidas/${id}`);
	}
}

export const unidadMedidaService = new UnidadMedidaService();
