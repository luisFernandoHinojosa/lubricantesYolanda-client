import { apiMilenium } from '$lib/config';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class DashboardService {
	async getResumen() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/resumen');
		return response.data;
	}

	async getChartData(filtro: 'semana' | 'mes' | 'año' = 'año') {
		const response = await apiMilenium.get<ApiResponse<any>>(`/dashboard/chart?filtro=${filtro}`);
		return response.data;
	}

	async getClientesTop() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/clientes-top');
		return response.data;
	}

	async getProductosStock() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/productos-stock');
		return response.data;
	}

	async getUltimosMovimientos() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/movimientos');
		return response.data;
	}

	async getCobranzasPendientes() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/cobranzas');
		return response.data;
	}

	async getProductosMasVendidos() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/productos-top');
		return response.data;
	}

	async getProductosPorVencer() {
		const response = await apiMilenium.get<ApiResponse<any>>('/dashboard/productos-vencer');
		return response.data;
	}
}

export const dashboardService = new DashboardService();
