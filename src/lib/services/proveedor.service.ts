import { apiMilenium } from '$lib/config';
import type {
	Proveedor,
	ProveedorResponse,
	ProveedorFilters,
	CreateProveedorDto,
	UpdateProveedorDto,
	ProveedorCatalogoResponse,
	ProveedorCatalogo
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class ProveedoresService {
	async getProveedores(filters: ProveedorFilters = {}): Promise<ProveedorResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		// if (filters.zona_id) params.append('zona_id', filters.zona_id);

		const response = await apiMilenium.get<ProveedorResponse>(`/proveedores?${params.toString()}`);
		return response.data;
	}

	async getProveedoresNormal(): Promise<Proveedor[]> {
		const response = await apiMilenium.get<ApiResponse<Proveedor[]>>(`/proveedores`);
		return response.data;
	}

	async getProveedorById(id: string): Promise<Proveedor> {
		const response = await apiMilenium.get<ApiResponse<Proveedor>>(`/proveedores/${id}`);
		return response.data;
	}

	async createProveedor(proveedor: CreateProveedorDto): Promise<Proveedor> {
		const response = await apiMilenium.post<ApiResponse<Proveedor>>('/proveedores', proveedor);
		return response.data;
	}

	async updateProveedor(id: string, proveedor: UpdateProveedorDto): Promise<Proveedor> {
		const response = await apiMilenium.put<ApiResponse<Proveedor>>(`/proveedores/${id}`, proveedor);
		return response.data;
	}

	async deleteProveedor(id: string): Promise<void> {
		await apiMilenium.delete(`/proveedores/${id}`);
	}

	async getProveedoresCatalogo(): Promise<ProveedorCatalogo[]> {
		const response = await apiMilenium.get<ProveedorCatalogoResponse>('/proveedores/catalogo');
		return response.data;
	}

}

export const proveedoresService = new ProveedoresService();
