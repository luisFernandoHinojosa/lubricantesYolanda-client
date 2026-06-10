export interface IngresoInventario {
	id: string;
	tipo_movimiento: string;
	cantidad: number | string;
	fecha: string;
	observacion: string | null;
	lote?: {
		id: string;
		codigo_lote: string;
		costo_compra_unitario: number | string;
		precio_venta_sugerido: number | string;
		fecha_vencimiento: string | null;
		fecha_ingreso: string;
		producto?: {
			id: string;
			nombre_comercial: string;
			codigo_barras: string | null;
			imagen_url: string | null;
		};
		proveedor?: {
			id: string;
			nombre: string;
		};
	};
	ubicacion_destino?: {
		id: string;
		nombre: string;
		tipo_area: string;
	};
	usuario?: {
		id: string;
		nombre: string;
	};
}

export interface CreateIngresoDto {
	id_producto: string;
	id_proveedor: string;
	cantidad: number;
	costo_unitario: number;
	precio_venta_sugerido?: number | null;
	id_ubicacion: string;
	id_ubicacion_fisica?: string | null;
	codigo_lote?: string | null;
	fecha_vencimiento?: string | null;
	observacion?: string | null;
}

export interface IngresosResponse {
	status: string;
	data: {
		ingresos: IngresoInventario[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

/**
 * DTO para Carga de Inventario Inicial.
 * No requiere proveedor — el stock ya existe en la ferretería antes del sistema.
 */
export interface CreateCargaInicialDto {
	id_producto: string;
	cantidad: number;
	costo_estimado: number;
	precio_venta?: number | null;
	id_ubicacion: string;
	id_ubicacion_fisica?: string | null;
	fecha_vencimiento?: string | null;
	observacion?: string | null;
}

