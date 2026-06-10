import { apiMilenium } from '$lib/config';
import type {
	MarcaResponse,
	MarcaFilters,
	Marca,
	CreateMarcaDto,
	UpdateMarcaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class MarcaService {
	async getMarcas(filters: MarcaFilters = {}): Promise<MarcaResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<MarcaResponse>(`/marcas?${params.toString()}`);
		return response.data;
	}

	async getMarcaById(id: string): Promise<Marca> {
		const response = await apiMilenium.get<ApiResponse<Marca>>(`/marcas/${id}`);
		return response.data;
	}

	async createMarca(marca: CreateMarcaDto): Promise<Marca> {
		const response = await apiMilenium.post<ApiResponse<Marca>>('/marcas', marca);
		return response.data;
	}

	async updateMarca(id: string, marca: UpdateMarcaDto): Promise<Marca> {
		const response = await apiMilenium.put<ApiResponse<Marca>>(`/marcas/${id}`, marca);
		return response.data;
	}

	async deleteMarca(id: string): Promise<void> {
		await apiMilenium.delete(`/marcas/${id}`);
	}
}

export const marcaService = new MarcaService();
