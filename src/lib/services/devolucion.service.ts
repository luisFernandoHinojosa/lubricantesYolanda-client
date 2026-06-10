import { apiMilenium } from '$lib/config';
import type {
	Devolucion,
	DevolucionesResponse,
	DevolucionFilters,
	CreateDevolucionDto,
	CreateCambioDto
} from '$lib/interfaces/devolucion.interface';
import type { VentaResponse } from '$lib/interfaces/venta.interface';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class DevolucionService {
	// ─── Listar devoluciones con filtros ──────────────────────────────────────
	async getDevoluciones(filters: DevolucionFilters = {}): Promise<DevolucionesResponse> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.tipo) params.append('tipo', filters.tipo);
		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);

		const response = await apiMilenium.get<ApiResponse<DevolucionesResponse>>(
			`/devoluciones?${params.toString()}`
		);
		return response.data;
	}

	// ─── Obtener detalle de una devolución/cambio ─────────────────────────────
	async getDevolucionById(id: string): Promise<Devolucion> {
		const response = await apiMilenium.get<ApiResponse<Devolucion>>(`/devoluciones/${id}`);
		return response.data;
	}

	// ─── Obtener devoluciones/cambios de una venta ────────────────────────────
	async getDevolucionesDeVenta(id_venta: string): Promise<Devolucion[]> {
		const response = await apiMilenium.get<ApiResponse<Devolucion[]>>(
			`/devoluciones/venta/${id_venta}`
		);
		return response.data;
	}

	// ─── Buscar venta por número de comprobante (para el formulario) ──────────
	async buscarVenta(numero_comprobante: string): Promise<VentaResponse> {
		const params = new URLSearchParams({ search: numero_comprobante, perPage: '1' });
		const response = await apiMilenium.get<ApiResponse<{ ventas: any[] }>>(`/ventas?${params}`);
		const ventas = response.data.ventas;
		if (!ventas || ventas.length === 0) {
			throw new Error('No se encontró la venta con ese comprobante.');
		}
		// Obtener detalle completo de la venta
		const ventaDetalle = await apiMilenium.get<ApiResponse<VentaResponse>>(
			`/ventas/${ventas[0].id}`
		);
		return ventaDetalle.data;
	}

	// ─── Obtener venta por ID ─────────────────────────────────────────────────
	async getVentaById(id: string): Promise<VentaResponse> {
		const response = await apiMilenium.get<ApiResponse<VentaResponse>>(`/ventas/${id}`);
		return response.data;
	}

	// ─── Crear devolución (reembolso) ─────────────────────────────────────────
	async crearDevolucion(data: CreateDevolucionDto): Promise<Devolucion> {
		const response = await apiMilenium.post<ApiResponse<Devolucion>>(
			'/devoluciones/devolucion',
			data
		);
		return response.data;
	}

	// ─── Crear cambio de producto ────────────────────────────────────────────
	async crearCambio(data: CreateCambioDto): Promise<Devolucion> {
		const response = await apiMilenium.post<ApiResponse<Devolucion>>('/devoluciones/cambio', data);
		return response.data;
	}
}

export const devolucionService = new DevolucionService();
