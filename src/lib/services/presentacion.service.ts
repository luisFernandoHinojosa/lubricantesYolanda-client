import { apiMilenium } from '$lib/config';
import type { Presentacion, CreatePresentacionDto, UpdatePresentacionDto } from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class PresentacionService {
	async createPresentacion(presentacion: CreatePresentacionDto): Promise<Presentacion> {
		const response = await apiMilenium.post<ApiResponse<Presentacion>>('/presentaciones', presentacion);
		return response.data;
	}

	async updatePresentacion(id: string, presentacion: UpdatePresentacionDto): Promise<Presentacion> {
		const response = await apiMilenium.put<ApiResponse<Presentacion>>(`/presentaciones/${id}`, presentacion);
		return response.data;
	}

	async deletePresentacion(id: string): Promise<void> {
		await apiMilenium.delete(`/presentaciones/${id}`);
	}
}

export const presentacionService = new PresentacionService();
