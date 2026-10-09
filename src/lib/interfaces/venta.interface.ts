// ─── POS / VENTAS ─────────────────────────────────────────────────────────────
export type METODOS_PAGO = 'EFECTIVO' | 'QR' | 'TARJETA';
export interface PresentacionPOS {
	id: string;
	nombre: string;
	factor_conversion: number;
	precio_especial: number;
	codigo_barras: string | null;
	stock_disponible: number;
}

export interface ProductoPOS {
	id: string;
	codigo_barras: string | null;
	nombre_comercial: string;
	maneja_serie: boolean;
	maneja_vencimiento: boolean;
	stock_minimo: number;
	precio_venta: number | null;
	stock_disponible: number;
	disponible: boolean;
	stock_bajo: boolean;
	alerta_vencimiento: boolean;
	lotes_proximos_vencer: LoteVencimiento[];
	imagen_url: string | null;
	presentaciones: PresentacionPOS[];
	// campos adicionales del scan
	_tipo_scan?: 'unidad' | 'presentacion' | 'serie';
	id_presentacion?: string | null;
	numero_serie_scaneado?: string;
	unidad_medida_abreviatura?: string;
	unidad_medida_nombre?: string;
}

export interface LoteVencimiento {
	codigo_lote: string;
	fecha_vencimiento: string;
	stock: number;
}

export interface CartItem {
	cartId: string; // ID único en el carrito (timestamp)
	id_producto: string;
	id_presentacion: string | null;
	nombre_comercial: string;
	nombre_presentacion: string | null;
	precio_unitario: number;
	cantidad: number;
	factor: number;
	monto_descuento: number;
	subtotal: number;
	maneja_serie: boolean;
	numero_serie: string;
	stock_disponible: number;
	unidad_medida_abreviatura: string;
	unidad_medida_nombre: string;
}

export interface ClienteVentaDto {
	ci: string;
	nombre: string;
	apellido_paterno?: string;
	apellido_materno?: string;
	fecha_nacimiento?: string;
	telefono?: string;
	correo_electronico?: string;
	genero?: 'M' | 'F' | 'O';
}

export interface DatosFacturacionDto {
	razonSocial: string;
	tipoDocumento: number;
	numeroDocumento: string;
}

export interface CreateVentaDto {
	id_sesion_caja: string;
	id_cliente?: string | null;
	cliente?: ClienteVentaDto;
	tipo_descuento_global?: 'PORCENTAJE' | 'FIJO' | 'NINGUNO';
	valor_descuento_global?: number;
	items: CreateVentaItem[];
	pagos: {
		metodo_pago: 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO';
		monto: number;
		referencia?: string;
	}[];
	notas?: string;
	facturar: boolean;
	datos_facturacion?: DatosFacturacionDto;
}

export interface CreateVentaItem {
	id_producto: string;
	id_presentacion?: string | null;
	cantidad: number;
	monto_descuento?: number;
	numero_serie?: string | null;
}

export interface FacturaVentaResponse {
	id: string;
	id_venta: string;
	estado: string;
	numero_factura: number;
	cuf: string;
	url_factura_pdf: string;
	xml_factura?: string;
	monto_iva?: string;
	errores_facturacion?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ResultadoFacturacionResponse {
	success: boolean;
	numeroFactura?: number;
	cuf?: string;
	urlPdf?: string;
	error?: string;
}

export interface VentaResponse {
	id: string;
	numero_comprobante: string;
	id_sucursal?: string;
	id_sesion_caja?: string;
	id_empleado?: string;
	id_cliente?: string | null;
	total: string;
	subtotal: string;
	tipo_descuento_global?: string;
	valor_descuento_global?: string;
	monto_descuento_global: string;
	cambio_entregado: string;
	monto_pagado: string;
	notas?: string | null;
	pagos: {
		id: string;
		metodo_pago: string;
		monto: string;
		referencia: string | null;
	}[];
	createdAt: string;
	cliente?: {
		id: string;
		nombre: string;
		apellido_paterno?: string;
		apellido_materno?: string;
		ci: string;
		telefono?: string;
	} | null;
	sucursal?: {
		id: string;
		nombre: string;
	};
	cajero?: {
		id: string;
		nombre: string;
		apellido_paterno: string;
		apellido_materno: string | null;
	};
	factura?: FacturaVentaResponse | null;
	resultado_facturacion?: ResultadoFacturacionResponse | null;
	detalles: DetalleVentaResponse[];
	devoluciones?: any[];
}


export interface DetalleVentaResponse {
	id: string;
	cantidad: string;
	precio_unitario: string;
	subtotal: string;
	numero_serie: string | null;
	producto: {
		id: string;
		nombre_comercial: string;
		codigo_barras: string;
		unidad_medida: {
			id: string;
			nombre: string;
			abreviatura: string;
		};
	};
	presentacion: { id: string; nombre: string; factor_conversion: string } | null;
}

export interface VentaListItem {
	id: string;
	numero_comprobante: string;
	id_sesion_caja: string;
	subtotal: string;
	tipo_descuento_global: string | null;
	valor_descuento_global: string;
	monto_descuento_global: string;
	total: string;
	monto_pagado: string;
	cambio_entregado: string;
	createdAt: string;
	updatedAt: string;
	pagos: {
		id: string;
		metodo_pago: string;
		monto: string;
		referencia: string | null;
	}[];
	cliente: { id: string; nombre: string; apellido_paterno: string; ci: string } | null;
	cajero: {
		id: string;
		nombre: string;
		apellido_paterno: string;
		apellido_materno: string | null;
	} | null;
	sucursal: { id: string; nombre: string } | null;
	esta_activo: boolean;
}

export interface VentasResponse {
	ventas: VentaListItem[];
	total: number;
	totalMontoVentas: number;
	widgets: {
		cantidad_ventas_registradas: number;
		cantidad_ventas_anuladas: number;
		total_monto_registradas: number;
		total_monto_anuladas: number;
	};
	page: number;
	perPage: number;
	totalPages: number;
}

// ─── SESIÓN DE CAJA ────────────────────────────────────────────────────────────

export interface SesionCaja {
	id: string;
	monto_apertura: string;
	estado: 'ABIERTA' | 'CERRADA';
	fecha_apertura: string;
	id_sucursal: string;
	id_usuario: string;
}

export interface AbrirCajaDto {
	monto_apertura: number;
}

export interface CerrarCajaDto {
	monto_cierre: number;
}

export interface ResumenCierre {
	sesion: SesionCaja;
	resumen: {
		monto_apertura: number;
		ventas_efectivo: number;
		ventas_digital: number;
		total_ventas: number;
		cantidad_ventas: number;
		monto_teorico: number;
		monto_cierre: number;
		diferencia: number;
	};
}

export interface ResumenVentasSesion {
	cantidad_ventas: number;
	total_efectivo: number;
	total_qr: number;
	total_tarjeta: number;
	total_descuentos: number;
	gran_total: number;
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export interface ClientePOS {
	id: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	ci: string;
	nit: string;
	telefono: string;
	direccion: string;
	puntos: number;
}
