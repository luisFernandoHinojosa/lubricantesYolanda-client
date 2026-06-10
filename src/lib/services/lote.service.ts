import { apiMilenium } from '$lib/config';
import type { Lote, CreateLoteDto, UpdateLoteDto } from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class LoteService {
	async createLote(lote: CreateLoteDto): Promise<Lote> {
		const response = await apiMilenium.post<ApiResponse<Lote>>('/lotes', lote);
		return response.data;
	}

	async updateLote(id: string, lote: UpdateLoteDto): Promise<Lote> {
		const response = await apiMilenium.put<ApiResponse<Lote>>(`/lotes/${id}`, lote);
		return response.data;
	}

	async deleteLote(id: string): Promise<void> {
		await apiMilenium.delete(`/lotes/${id}`);
	}
}

export const loteService = new LoteService();
