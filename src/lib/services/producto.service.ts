import { apiMilenium } from '$lib/config';
import type {
	ProductoFilters,
	ProductosResponse,
	Producto,
	UpdateProductoDto,
	CreateProductoDto,
	HistorialCostoLote
} from '$lib/interfaces';
import { API_CONFIG } from '$lib/config';
import { authService } from '$lib/services/auth.service';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class ProductoService {
	async getProductos(filters: ProductoFilters = {}): Promise<ProductosResponse> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.id_categoria) params.append('id_categoria', filters.id_categoria);
		if (filters.id_marca) params.append('id_marca', filters.id_marca);
		if (filters.id_proveedor) params.append('id_proveedor', filters.id_proveedor);

		const response = await apiMilenium.get<ProductosResponse>(`/productos?${params.toString()}`);
		return response;
	}

	async getProductoById(id: string): Promise<Producto> {
		const response = await apiMilenium.get<ApiResponse<Producto>>(`/productos/${id}`);
		return response.data;
	}

	async getProductoConLotes(id: string): Promise<Producto> {
		const response = await apiMilenium.get<ApiResponse<Producto>>(`/productos/lotes/${id}`);
		return response.data;
	}

	async getHistorialCostos(id_producto: string): Promise<HistorialCostoLote[]> {
		const response = await apiMilenium.get<ApiResponse<HistorialCostoLote[]>>(
			`/productos/${id_producto}/historial-costos`
		);

		return response.data;
	}

	async createProducto(producto: CreateProductoDto): Promise<Producto> {
		//console.log('producto', producto);
		const { foto, presentaciones, ...scalarData } = producto;

		// Si hay foto, usar FormData; si no, enviar JSON
		if (foto && foto instanceof File) {
			const formData = new FormData();
			formData.append('foto', foto);

			// Agregar campos escalares
			Object.entries(scalarData).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					if (value instanceof File) {
						formData.append(key, value);
					} else if (typeof value === 'object') {
						formData.append(key, JSON.stringify(value)); // ✅ carga_inicial, etc.
					} else {
						formData.append(key, String(value));
					}
				}
			});

			// Agregar presentaciones como JSON string
			if (presentaciones && Array.isArray(presentaciones) && presentaciones.length > 0) {
				const cleanPresentaciones = JSON.stringify(presentaciones);
				console.log('[createProducto] presentaciones JSON:', cleanPresentaciones);
				formData.append('presentaciones', cleanPresentaciones);
			}

			const response = await apiMilenium.post<ApiResponse<Producto>>('/productos', formData);
			return response.data;
		} else {
			// Para JSON, construir payload limpio sin foto
			const jsonPayload: Record<string, unknown> = { ...scalarData };
			if (presentaciones && Array.isArray(presentaciones) && presentaciones.length > 0) {
				jsonPayload.presentaciones = presentaciones;
			}
			const response = await apiMilenium.post<ApiResponse<Producto>>('/productos', jsonPayload);
			return response.data;
		}
	}

	async updateProducto(id: string, producto: UpdateProductoDto): Promise<Producto> {
		console.log('producto', producto);
		const formData = new FormData();
		Object.entries(producto).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				if (value instanceof File) {
					formData.append(key, value);
				} else {
					formData.append(key, value.toString());
				}
			}
		});

		const response = await apiMilenium.put<ApiResponse<Producto>>(`/productos/${id}`, formData);
		return response.data;
	}

	async deleteProducto(id: string): Promise<void> {
		await apiMilenium.delete(`/productos/${id}`);
	}

	async generateBarcode(): Promise<string> {
		const response = await apiMilenium.get<ApiResponse<string>>('/productos/generate-barcode');
		return response.data;
	}

	async exportarExcel(): Promise<void> {
		const token = authService.getToken();
		const headers: HeadersInit = token
			? {
					Authorization: `Bearer ${token}`
				}
			: {};

		const response = await fetch(`${API_CONFIG.BASE_URL}/productos/exportar-excel`, {
			method: 'GET',
			headers
		});

		if (!response.ok) {
			throw new Error('Error al descargar el archivo Excel');
		}

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// Obtener nombre del archivo de los headers si es posible
		const contentDisposition = response.headers.get('Content-Disposition');
		let filename = 'InventarioLotes.xlsx';
		if (contentDisposition && contentDisposition.includes('filename=')) {
			const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
			if (filenameMatch && filenameMatch.length === 2) {
				filename = filenameMatch[1];
			}
		}
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}
}

export const productoService = new ProductoService();
