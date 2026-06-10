import { apiMilenium } from '$lib/config';
import type { Sucursal, SucursalCatalogoResponse, SucursalResponse } from '$lib/interfaces';

class SucursalService {
	async getSucursales(filters: any = {}): Promise<SucursalResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<SucursalResponse>(`/sucursales?${params.toString()}`);
		return response.data;
	}

	async getSucursalesActivas(): Promise<SucursalResponse['data']> {
		const response = await apiMilenium.get<SucursalResponse>(`/sucursales?esta_activo=true`);
		return response.data;
	}

	async getSucursalById(id: string): Promise<Sucursal> {
		const response = await apiMilenium.get<{ status: string; data: Sucursal }>(`/sucursales/${id}`);
		return response.data;
	}

	async getSucursalesCatalogo(): Promise<Sucursal[]> {
		const response = await apiMilenium.get<SucursalCatalogoResponse>(`/sucursales/catalogo`);
		return response.data;
	}

	// async getSucursalesCatalogo(): Promise<Ubicacion[]> {
	// 	const response = await apiMilenium.get<UbicacionCatalogoResponse>('/ubicaciones/catalogo');
	// 	return response.data;
	// }

}

export const sucursalService = new SucursalService();
