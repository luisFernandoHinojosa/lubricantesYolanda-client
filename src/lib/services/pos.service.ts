import { apiMilenium } from '$lib/config';
import type {
	ProductoPOS,
	CreateVentaDto,
	VentaResponse,
	VentasResponse,
	SesionCaja,
	AbrirCajaDto,
	CerrarCajaDto,
	ResumenCierre,
	ResumenVentasSesion,
	ClientePOS
} from '$lib/interfaces/venta.interface';

// ─── CATÁLOGO POS ────────────────────────────────────────────────────────────

interface ApiResponse<T> {
	status: string;
	data: T;
}

export const posService = {
	async buscarProductos(q: string, soloConStock = true): Promise<ProductoPOS[]> {
		const params = new URLSearchParams({
			q,
			solo_con_stock: String(soloConStock)
			// limit: '24',
		});
		const response = await apiMilenium.get<ApiResponse<ProductoPOS[]>>(
			`/productos/pos/buscar?${params}`
		);
		return response.data;
	},

	async buscarPorBarcode(codigo: string): Promise<ProductoPOS> {
		const response = await apiMilenium.get<ApiResponse<ProductoPOS>>(
			`/productos/pos/barcode/${encodeURIComponent(codigo)}`
		);
		return response.data;
	},

	async getProducto(id: string): Promise<ProductoPOS> {
		const response = await apiMilenium.get<ApiResponse<ProductoPOS>>(`/productos/pos/${id}`);
		return response.data;
	},

	async validarCantidad(
		id: string,
		cantidad: number,
		id_presentacion?: string | null
	): Promise<{ valido: boolean; cantidad_maxima: number }> {
		const params = new URLSearchParams({ cantidad: String(cantidad) });
		if (id_presentacion) params.append('id_presentacion', id_presentacion);
		const response = await apiMilenium.get<
			ApiResponse<{ valido: boolean; cantidad_maxima: number }>
		>(`/productos/pos/${id}/validar-cantidad?${params}`);
		return response.data;
	},

	// ─── VENTAS ────────────────────────────────────────────────────────────────

	async crearVenta(data: CreateVentaDto): Promise<VentaResponse> {
		const response = await apiMilenium.post<ApiResponse<VentaResponse>>('/ventas', data);
		return response.data;
	},

	async getVenta(id: string): Promise<VentaResponse> {
		const response = await apiMilenium.get<ApiResponse<VentaResponse>>(`/ventas/${id}`);
		return response.data;
	},

	async listarVentas(params: Record<string, string | number> = {}): Promise<VentasResponse> {
		const query = new URLSearchParams(params as any);
		const response = await apiMilenium.get<ApiResponse<VentasResponse>>(`/ventas?${query}`);
		return response.data;
	},

	// ─── CAJA ──────────────────────────────────────────────────────────────────

	async getSesionActiva(): Promise<SesionCaja | null> {
		try {
			const response = await apiMilenium.get<ApiResponse<SesionCaja>>('/session_caja/activa');
			return response.data;
		} catch {
			return null;
		}
	},

	async abrirCaja(data: AbrirCajaDto): Promise<SesionCaja> {
		const response = await apiMilenium.post<ApiResponse<SesionCaja>>('/session_caja/abrir', data);
		return response.data;
	},

	async getResumenSesion(id: string): Promise<ResumenVentasSesion> {
		const response = await apiMilenium.get<ApiResponse<ResumenVentasSesion>>(
			`/ventas/sesion/${id}/resumen`
		);
		return response.data;
	},

	async cerrarCaja(id: string, data: CerrarCajaDto): Promise<ResumenCierre> {
		const response = await apiMilenium.patch<ApiResponse<ResumenCierre>>(
			`/session_caja/${id}/cerrar`,
			data
		);
		return response.data;
	},

	// ─── CLIENTES ─────────────────────────────────────────────────────────────

	async buscarClientes(q: string): Promise<ClientePOS[]> {
		const params = new URLSearchParams({ search: q, perPage: '10' });
		const response = await apiMilenium.get<{ status: string; data: { clientes: ClientePOS[] } }>(
			`/clientes?${params}`
		);
		return response.data.clientes ?? [];
	}
};
