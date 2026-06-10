export interface DetalleDevolucion {
	id: string;
	id_devolucion: string;
	id_detalle_venta: string;
	// Producto devuelto
	id_producto_original: string;
	id_presentacion_original: string | null;
	cantidad_devuelta: string;
	factor_original: string;
	precio_original: string;
	subtotal_devuelto: string;
	numero_serie_devuelta: string | null;
	// Producto nuevo (solo CAMBIO)
	id_producto_nuevo: string | null;
	id_presentacion_nueva: string | null;
	cantidad_nueva: string | null;
	factor_nuevo: string | null;
	precio_nuevo: string | null;
	subtotal_nuevo: string | null;
	numero_serie_nueva: string | null;
	// Relaciones expandidas
	producto_original?: { id: string; nombre_comercial: string; codigo_barras: string };
	producto_nuevo?: { id: string; nombre_comercial: string; codigo_barras: string } | null;
	presentacion_original?: { id: string; nombre: string; factor_conversion: string } | null;
	presentacion_nueva?: { id: string; nombre: string; factor_conversion: string } | null;
}

export interface Devolucion {
	id: string;
	numero_devolucion: string;
	id_venta_original: string;
	id_sucursal: string;
	id_sesion_caja: string;
	id_empleado: string;
	id_cliente: string | null;
	tipo: 'DEVOLUCION' | 'CAMBIO';
	motivo: string | null;
	metodo_reembolso: 'EFECTIVO' | 'CREDITO';
	monto_devuelto: string;
	monto_diferencia: string;
	estado: 'COMPLETADA' | 'ANULADA';
	createdAt: string;
	// Relaciones expandidas
	venta_original?: { id: string; numero_comprobante: string; total: string; createdAt: string };
	cliente?: { id: string; nombre: string; ci: string; apellido_paterno: string; apellido_materno?: string } | null;
	empleado?: { id: string; nombre: string; apellido_paterno: string };
	sucursal?: { id: string; nombre: string };
	detalles?: DetalleDevolucion[];
}

export interface DevolucionesResponse {
	devoluciones: Devolucion[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
}

export interface DevolucionFilters {
	page?: number;
	perPage?: number;
	search?: string;
	tipo?: 'DEVOLUCION' | 'CAMBIO';
	desde?: string;
	hasta?: string;
}

export interface CreateDevolucionItemDto {
	id_detalle_venta: string;
	cantidad_devuelta: number;
}

export interface CreateDevolucionDto {
	id_venta: string;
	id_sesion_caja: string;
	items: CreateDevolucionItemDto[];
	motivo?: string;
	metodo_reembolso?: 'EFECTIVO';
}

export interface CreateCambioItemDto {
	id_detalle_venta: string;
	cantidad_devuelta: number;
	id_producto_nuevo: string;
	id_presentacion_nueva?: string | null;
	cantidad_nueva: number;
	numero_serie_nueva?: string | null;
}

export interface CreateCambioDto {
	id_venta: string;
	id_sesion_caja: string;
	items: CreateCambioItemDto[];
	motivo?: string;
	metodo_reembolso?: 'EFECTIVO';
}
