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
	MetodoPagoVenta
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
		console.log('venta individual', response.data);
		return response.data;
	},

	async listarVentas(params: Record<string, string | number> = {}): Promise<VentasResponse> {
		const query = new URLSearchParams(params as any);
		const response = await apiMilenium.get<ApiResponse<VentasResponse>>(`/ventas?${query}`);
		console.log(response.data);
		return response.data;
	},

	// Emite la factura SIAT de una venta que nunca tuvo factura
	// El backend calcula el monto del recargo a partir del porcentaje (igual que al crear la venta)
	// y lo registra como un pago más con el método indicado.
	// Con id_cliente la venta pasa a ese cliente registrado (solo ventas de la caja abierta).
	async facturarVenta(
		id: string,
		porcentaje_recargo_iva: number,
		metodo_pago_recargo: MetodoPagoVenta = 'EFECTIVO',
		id_cliente?: string
	): Promise<VentaResponse> {
		const response = await apiMilenium.post<ApiResponse<VentaResponse>>(`/ventas/${id}/facturar`, {
			porcentaje_recargo_iva,
			metodo_pago_recargo,
			...(id_cliente ? { id_cliente } : {})
		});
		return response.data;
	},

	// Vuelve a emitir la factura de una venta cuya factura falló (ERROR) o se anuló.
	// Los montos no cambian; con id_cliente la venta pasa a ese cliente ya registrado.
	async reintentarFactura(id: string, id_cliente?: string): Promise<VentaResponse> {
		const response = await apiMilenium.post<ApiResponse<VentaResponse>>(
			`/ventas/${id}/reintentar-factura`,
			id_cliente ? { id_cliente } : {}
		);
		return response.data;
	},

	// Anula en el SIAT la factura vigente; la venta y su recargo no cambian
	async anularFactura(id: string): Promise<{ status: string; message: string; data: VentaResponse }> {
		const response = await apiMilenium.post<{ status: string; message: string; data: VentaResponse }>(
			`/ventas/${id}/anular-factura`,
			{}
		);
		return response;
	},

	async anularVenta(id: string): Promise<{ status: string; message: string }> {
		const response = await apiMilenium.put<{ status: string; message: string }>(
			`/ventas/${id}/anular`,
			{}
		);
		return response;
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
	}
};
