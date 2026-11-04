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
	// Código SIAT: 1=CI, 2=CEX, 3=PAS, 4=OD, 5=NIT
	tipo_documento: number;
	complemento?: string;
	nombre: string;
	apellido_paterno?: string;
	apellido_materno?: string;
	fecha_nacimiento?: string;
	telefono?: string;
	correo_electronico?: string;
	genero?: 'M' | 'F' | 'O';
}

// Códigos de METODO_PAGO_FACTURA (métodos de pago del SIAT)
export type MetodoPagoVenta = 'EFECTIVO' | 'QR' | 'TARJETA' | 'CHEQUE' | 'VALES' | 'OTROS' | 'DEPOSITO';

export interface PagoVenta {
	metodo_pago: MetodoPagoVenta;
	monto: number;
	referencia?: string;
}

export interface CreateVentaDto {
	id_sesion_caja: string;
	id_cliente?: string | null;
	cliente?: ClienteVentaDto;
	tipo_descuento_global?: 'PORCENTAJE' | 'FIJO' | 'NINGUNO';
	valor_descuento_global?: number;
	items: CreateVentaItem[];
	pagos: PagoVenta[];
	notas?: string;
	facturar: boolean;
	// 0 a 100; 0 o sin enviar = sin recargo
	porcentaje_recargo_iva?: number;
}

export interface CreateVentaItem {
	id_producto: string;
	id_presentacion?: string | null;
	cantidad: number;
	monto_descuento?: number;
	numero_serie?: string | null;
}

// ─── VENTA (response del backend: ventas.dto.js) ───────────────────────────────
// Montos siempre como number. `total` es lo cobrado; `total_neto` descuenta
// devoluciones y suma diferencias de cambios (0 si la venta está anulada).

export type EstadoVenta = 'COMPLETADA' | 'ANULADA';
// ANULADA solo llega en el listado (la última anulada cuando no hay factura vigente)
export type EstadoFactura = 'PENDIENTE' | 'FACTURADA' | 'ERROR' | 'ANULADA';
export type TipoDevolucionVenta = 'DEVOLUCION' | 'CAMBIO';

// Listado: solo lo necesario para mostrar el estado de la factura
export interface FacturaResumen {
	estado: EstadoFactura;
	numero_factura: number;
	fecha_emision: string | null;
}

// Detalle: datos para mostrar/imprimir la factura
export interface FacturaVentaResponse extends FacturaResumen {
	id: string;
	cuf: string | null;
	codigo_control: string | null;
	url_factura_pdf: string | null;
	url_siat: string | null;
	monto_facturado: number; // total − recargo (lo que se envió al SIAT)
	monto_iva: number | null; // débito fiscal (13% legal)
	error: string | null; // solo cuando estado = 'ERROR'
}

// Historial: siguen existiendo en el SIAT como anuladas
export interface FacturaAnuladaResponse {
	id: string;
	numero_factura: number;
	cuf: string | null;
	fecha_emision: string | null;
	fecha_anulacion: string | null;
	url_factura_pdf: string | null;
	url_siat: string | null;
}

export interface ResultadoFacturacionResponse {
	success: boolean;
	numeroFactura?: number;
	cuf?: string;
	urlPdf?: string;
	urlSiat?: string;
	error?: string;
}

export interface PagoVentaResponse {
	metodo_pago: string;
	monto: number;
	referencia: string | null;
}

interface MontosVenta {
	subtotal: number; // suma de líneas (ya con descuento por ítem)
	tipo_descuento_global: 'PORCENTAJE' | 'FIJO' | 'NINGUNO';
	valor_descuento_global: number;
	monto_descuento_global: number;
	porcentaje_recargo_iva: number;
	monto_recargo_iva: number;
	total: number; // lo que se cobró
	monto_devuelto: number;
	diferencia_cambio: number;
	total_neto: number;
}

export interface VentaListItem extends MontosVenta {
	id: string;
	numero_comprobante: string;
	fecha: string;
	estado: EstadoVenta;
	id_sesion_caja: string;
	cliente: { id: string; nombre_completo: string; ci: string } | null;
	cajero: { id: string; nombre_completo: string } | null;
	sucursal: { id: string; nombre: string } | null;
	pagos: PagoVentaResponse[];
	factura: FacturaResumen | null;
}

// Lo que confirma el modal de facturar: al facturar por primera vez se usan el recargo y su
// método de pago; id_cliente solo si se cambia de cliente
export interface DatosFacturar {
	porcentaje_recargo_iva: number;
	metodo_pago_recargo: MetodoPagoVenta;
	id_cliente?: string;
}

export interface ProductoVentaResponse {
	id: string;
	nombre_comercial: string;
	codigo_barras: string | null;
	unidad_medida: { id: string; nombre: string; abreviatura: string } | null;
}

export interface PresentacionVentaResponse {
	id: string;
	nombre: string;
	factor_conversion: number;
}

// Línea tal como se vendió (las devoluciones van aparte, en `devoluciones`)
export interface DetalleVentaResponse {
	id: string;
	producto: ProductoVentaResponse;
	presentacion: PresentacionVentaResponse | null;
	numero_serie: string | null;
	cantidad: number;
	precio_unitario: number;
	monto_descuento: number;
	subtotal: number;
	cantidad_devuelta: number;
	cantidad_disponible: number; // lo que todavía se puede devolver
}

export interface ItemDevolucionVentaResponse {
	id: string;
	id_detalle_venta: string; // línea de `detalles` de la que sale el producto devuelto
	cantidad_devuelta: number;
	subtotal_devuelto: number; // reembolsado (con su parte del descuento global y recargo)
	numero_serie_devuelta: string | null;
	// Solo en un CAMBIO: lo que se llevó el cliente a cambio
	producto_entregado: {
		producto: ProductoVentaResponse;
		presentacion: PresentacionVentaResponse | null;
		numero_serie: string | null;
		cantidad: number;
		precio_unitario: number;
		subtotal: number;
	} | null;
}

export interface DevolucionVentaResponse {
	id: string;
	numero_devolucion: string;
	tipo: TipoDevolucionVenta;
	fecha: string;
	motivo: string | null;
	metodo_reembolso: string | null;
	monto_devuelto: number;
	monto_diferencia: number;
	items: ItemDevolucionVentaResponse[];
}

export interface VentaResponse extends Omit<VentaListItem, 'cliente' | 'factura'> {
	cliente: {
		id: string;
		nombre_completo: string;
		nombre: string;
		apellido_paterno: string | null;
		apellido_materno: string | null;
		ci: string;
		telefono: string | null;
	} | null;
	monto_pagado: number;
	cambio_entregado: number;
	notas: string | null;
	// Líneas tal como se vendieron: lo que imprime el ticket y lo que se factura
	detalles: DetalleVentaResponse[];
	// Devoluciones y cambios completados (vacío si la venta está anulada)
	devoluciones: DevolucionVentaResponse[];
	// La vigente; null si nunca se facturó o si la última se anuló y aún no se volvió a emitir
	factura: FacturaVentaResponse | null;
	facturas_anuladas: FacturaAnuladaResponse[];
	// Solo en las respuestas de crear venta, facturar y reintentar factura
	resultado_facturacion?: ResultadoFacturacionResponse | null;
}

export interface ResumenVentas {
	cantidad_registradas: number;
}

export interface VentasResponse {
	ventas: VentaListItem[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
	resumen: ResumenVentas;
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

export type MetodoPagoResumen =
	| 'EFECTIVO'
	| 'TARJETA'
	| 'CHEQUE'
	| 'VALES'
	| 'OTROS'
	| 'QR'
	| 'DEPOSITO';

export interface ResumenVentasSesion {
	cantidad_ventas: number;
	total_efectivo: number;
	total_qr: number;
	total_tarjeta: number;
	totales_por_metodo: Record<MetodoPagoResumen, number>;
	total_descuentos: number;
	gran_total: number;
	cantidad_anuladas: number;
	cantidad_devoluciones: number;
	cantidad_cambios: number;
	total_reembolsado: number;
	total_diferencias_cobradas: number;
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export interface ClientePOS {
	id: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	ci: string;
	nit: string;
	tipo_documento?: number;
	complemento?: string | null;
	telefono: string;
	direccion: string;
	puntos: number;
}
