import { apiMilenium } from '$lib/config';
import type {
	Ubicacion,
	UbicacionResponse,
	CreateUbicacionDto,
	UpdateUbicacionDto,
	UbicacionCatalogo,
	UbicacionCatalogoResponse,
	UbicacionFisica,
	UbicacionesFisicasResponse,
	CreateUbicacionFisicaDto,
	UpdateUbicacionFisicaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class UbicacionService {
	async getUbicaciones(filters: { page?: number; perPage?: number; search?: string; id_sucursal?: string; tipo_area?: string } = {}): Promise<UbicacionResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.tipo_area) params.append('tipo_area', filters.tipo_area);

		const response = await apiMilenium.get<UbicacionResponse>(`/ubicaciones?${params.toString()}`);
		return response.data;
	}

	async getUbicacionesBySucursal(id_sucursal: string): Promise<UbicacionResponse['data']> {
		const response = await apiMilenium.get<UbicacionResponse>(`/ubicaciones?id_sucursal=${id_sucursal}&esta_activo=true`);
		return response.data;
	}

	async getUbicacionById(id: string): Promise<Ubicacion> {
		const response = await apiMilenium.get<{ status: string; data: Ubicacion }>(`/ubicaciones/${id}`);
		return response.data;
	}

	async getUbicacionesCatalogo(): Promise<Ubicacion[]> {
		const response = await apiMilenium.get<UbicacionCatalogoResponse>('/ubicaciones/catalogo');
		return response.data;
	}

	async getUbicacionesFull(): Promise<Ubicacion[]> {
		const response = await apiMilenium.get<ApiResponse<Ubicacion[]>>('/ubicaciones/full');
		return response.data;
	}

	async createUbicacion(data: CreateUbicacionDto): Promise<Ubicacion> {
		const response = await apiMilenium.post<{ status: string; data: Ubicacion }>('/ubicaciones', data);
		return response.data;
	}

	async updateUbicacion(id: string, data: UpdateUbicacionDto): Promise<Ubicacion> {
		const response = await apiMilenium.put<{ status: string; data: Ubicacion }>(`/ubicaciones/${id}`, data);
		return response.data;
	}

	async deleteUbicacion(id: string): Promise<void> {
		await apiMilenium.delete(`/ubicaciones/${id}`);
	}

	// --- Ubicaciones Físicas ---

	async getUbicacionesFisicasByUbicacion(idUbicacion: string): Promise<UbicacionFisica[]> {
		const response = await apiMilenium.get<ApiResponse<UbicacionFisica[]>>(
			`/ubicaciones_fisicas/por-ubicacion/${idUbicacion}`
		);
		return response.data;
	}

	async createUbicacionFisica(data: CreateUbicacionFisicaDto): Promise<UbicacionFisica> {
		const response = await apiMilenium.post<ApiResponse<UbicacionFisica>>(
			'/ubicaciones_fisicas',
			data
		);
		return response.data;
	}

	async updateUbicacionFisica(id: string, data: UpdateUbicacionFisicaDto): Promise<UbicacionFisica> {
		const response = await apiMilenium.put<ApiResponse<UbicacionFisica>>(
			`/ubicaciones_fisicas/${id}`,
			data
		);
		return response.data;
	}

	async getUbicacionFisicaCatalogo(): Promise<UbicacionFisica[]> {
		const response = await apiMilenium.get<ApiResponse<UbicacionFisica[]>>('/ubicaciones_fisicas/catalogo');
		return response.data;
	}

	async deleteUbicacionFisica(id: string): Promise<void> {
		await apiMilenium.delete(`/ubicaciones_fisicas/${id}`);
	}
}

export const ubicacionService = new UbicacionService();
