import { apiMilenium } from '$lib/config';
import type {
	StockDistribucion,
	StockDistribucionResponse,
	StockPorUbicacionRaw,
	StockPorUbicacionResponse,
	TotalStockResponse,
	TrasladoStockDto
} from '$lib/interfaces/producto.interface';

class StockDistribucionService {

	async getStockDistribucion(filters: Record<string, any> = {}): Promise<StockDistribucionResponse['data']> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, val]) => {
			if (val !== undefined && val !== null && val !== '') {
				params.append(key, String(val));
			}
		});
		const response = await apiMilenium.get<StockDistribucionResponse>(
			`/stock_distribucion?${params.toString()}`
		);
		return response.data;
	}

	async getTotalStockProducto(id_producto: string): Promise<number> {
		const response = await apiMilenium.get<TotalStockResponse>(
			`/stock_distribucion/total/${id_producto}`
		);
		return response.data.total;
	}

	async getStockPorUbicacion(id_producto: string): Promise<StockPorUbicacionRaw[]> {
		const response = await apiMilenium.get<StockPorUbicacionResponse>(
			`/stock_distribucion/por-ubicacion/${id_producto}`
		);
		return response.data;
	}

	async trasladarStock(data: TrasladoStockDto): Promise<void> {
		await apiMilenium.post<{ status: string; message: string }>(
			'/stock_distribucion/traslado',
			data
		);
	}
}

export const stockDistribucionService = new StockDistribucionService();