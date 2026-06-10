import type { EmpleadoData, Producto, Proveedor } from './index';
import type { Lote } from './lote.interface';

export interface DetalleCompra {
	id?: string;
	id_producto: string;
	id_lote?: string;
	cantidad: number | string;
	costo_unitario: number;
	subtotal: number | string;
	fecha_vencimiento_lote?: string | null;
	codigo_lote_provisto?: string | null;
	producto?: Producto;
	lote?: Lote;

	precio_venta_actual?: number;
	nuevo_precio_venta?: number;
	alerta_margen?: boolean;
	show_config?: boolean;
	historial_costos?: HistorialCostoLote[];
	cargando_historial?: boolean;
}

export interface HistorialCostoLote {
	id: string;
	codigo_lote: string;
	costo_compra_unitario: number | string;
	fecha_ingreso: string;
}

export interface Compra {
	id?: string;
	id_proveedor: string;
	id_empleado?: string;
	id_sucursal: string;
	numero_comprobante?: string;
	total: number | string;
	estado_pago: 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO';
	fecha_compra?: string;
	empleado?: EmpleadoData;
	notas?: string;
	proveedor?: Proveedor;
	detalles?: DetalleCompra[];
	createdAt?: string;
}

export interface ComprasResponse {
	status: string;
	data: {
		compras: Compra[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
	extraData: Record<string, unknown>;
}

export interface CompraFilters {
	page?: number;
	perPage?: number;
	search?: string;
	proveedor_id?: string;
	estado_pago?: 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO';
	fecha_inicio?: string;
	fecha_fin?: string;
}

export interface CreateCompraDto {
	id_proveedor: string;
	id_sucursal: string;
	id_ubicacion_destino: string;
	numero_comprobante?: string;
	estado_pago?: 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO';
	notas?: string;
	detalles: DetalleCompra[];
}

export interface UpdateCompraDto extends Partial<Omit<CreateCompraDto, 'detalles'>> {
	estado_pago?: 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO';
	detalles?: DetalleCompra[];
}
