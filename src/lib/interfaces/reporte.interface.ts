export type ReportGrouping = 'dia' | 'semana' | 'mes';
export type PaymentMethodValue =
	| 'EFECTIVO'
	| 'TARJETA'
	| 'TRANSFERENCIA'
	| 'QR'
	| 'CHEQUE'
	| 'OTRO';

export interface VentaReportFilters {
	desde: string;
	hasta: string;
	id_sucursal?: string;
	metodo_pago?: PaymentMethodValue;
	agrupar_por: ReportGrouping;
}

export interface VentaResumen {
	total_ventas: number;
	cantidad_ventas: number;
	ticket_promedio: number;
	total_descuentos: number;
	venta_maxima: number;
	venta_minima: number;
}

export interface MetodoPagoStats {
	total: number;
	cantidad: number;
	porcentaje: number;
}

export interface VentaSerieTemporal {
	fecha: string;
	total: number;
	cantidad: number;
}

export interface VentaPorSucursal {
	id_sucursal: string;
	sucursal: string;
	total: number;
	cantidad: number;
}

export interface TopCajero {
	empleado: string;
	total: number;
	cantidad: number;
}

export interface ComparativaPeriodo {
	total_actual: number;
	total_anterior: number;
	variacion_porcentual: number;
}

export interface VentaReportData {
	resumen: VentaResumen;
	por_metodo_pago: Record<string, MetodoPagoStats>;
	serie_temporal: VentaSerieTemporal[];
	por_sucursal: VentaPorSucursal[];
	top_cajeros: TopCajero[];
	comparativa_periodo_anterior: ComparativaPeriodo;
}

// Purchase Report Interfaces
export type CompraPaymentStatus = 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO';

export interface CompraReportFilters {
	desde: string;
	hasta: string;
	id_sucursal?: string;
	id_proveedor?: string;
	estado_pago?: CompraPaymentStatus;
}

export interface CompraResumen {
	total_compras: number;
	cantidad_compras: number;
	compra_promedio: number;
	pendientes_pago: number;
}

export interface CompraPorProveedor {
	proveedor: string;
	total: number;
	cantidad: number;
	porcentaje: number;
}

export interface CompraPorEstadoPago {
	total: number;
	cantidad: number;
}

export interface CompraProductoMasComprado {
	producto: string;
	cantidad_total: number;
	costo_total: number;
}

export interface CompraReportData {
	resumen: CompraResumen;
	por_proveedor: CompraPorProveedor[];
	por_estado_pago: Record<string, CompraPorEstadoPago>;
	serie_temporal: VentaSerieTemporal[]; // Reusing VentaSerieTemporal as it's the same structure (fecha, total, cantidad)
	productos_mas_comprados: CompraProductoMasComprado[];
}

// Inventory Report Interfaces
export interface InventarioReportFilters {
	id_sucursal?: string;
	id_categoria?: string;
}

export interface InventarioResumen {
	total_productos_activos: number;
	valor_total_costo: number;
	valor_total_venta: number;
	margen_bruto_potencial: number;
	porcentaje_margen: number;
	productos_stock_critico: number;
	productos_sin_stock: number;
	lotes_por_vencer_30dias: number;
}

export interface InventarioPorCategoria {
	categoria: string;
	productos: number;
	valor_costo: number;
	valor_venta: number;
}

export interface InventarioStockCritico {
	producto: string;
	stock_actual: number;
	stock_minimo: number;
	deficit: number;
}

export interface InventarioProximoVencimiento {
	producto: string;
	lote: string;
	fecha_vencimiento: string;
	cantidad_restante: string;
}

export interface InventarioReportData {
	resumen: InventarioResumen;
	por_categoria: InventarioPorCategoria[];
	stock_critico: InventarioStockCritico[];
	proximos_vencimientos: InventarioProximoVencimiento[];
}

export interface FinancieroReportFilters {
	desde?: string;
	hasta?: string;
	id_sucursal?: string;
}

export interface IngresosReport {
	ventas_brutas: number;
	descuentos_otorgados: number;
	ventas_netas: number;
	otros_ingresos: number;
	total_ingresos: number;
}

export interface CostosReport {
	costo_mercaderia_vendida: number;
	total_costos: number;
}

export interface GastosOperativosReport {
	por_categoria: { categoria: string; monto: number }[];
	total_gastos_operativos: number;
}

export interface EstadoResultados {
	ingresos: IngresosReport;
	costos: CostosReport;
	utilidad_bruta: number;
	margen_bruto_porcentaje: number;
	gastos_operativos: GastosOperativosReport;
	utilidad_operativa: number;
	margen_operativo_porcentaje: number;
	costo_nomina_mensual: number;
}

export interface MetodoPagoCajaDetalle {
	ingresos: number;
	egresos: number;
	neto: number;
}

export interface FlujoCajaReport {
	por_metodo_pago: Record<string, MetodoPagoCajaDetalle>;
	total_ingresado: number;
	total_egresado: number;
	flujo_neto: number;
}

export interface SerieTemporalMensual {
	mes: string;
	ingresos: number;
}

export interface FinancieroReportData {
	estado_resultados: EstadoResultados;
	flujo_caja: FlujoCajaReport;
	serie_temporal_mensual: SerieTemporalMensual[];
}

export interface SesionesCajaReportFilters {
	desde?: string;
	hasta?: string;
	id_sucursal?: string;
	id_empleado?: string;
}

export interface SesionesCajaResumen {
	total_sesiones: number;
	sesiones_con_diferencia: number;
	diferencia_total_acumulada: number;
	promedio_duracion_horas: number;
}

export interface SesionesCajaPorEmpleado {
	empleado: string;
	sesiones: number;
	total_ventas: number;
	diferencia_acumulada: number;
}

export interface SesionesCajaDetalle {
	id: string;
	fecha: string;
	empleado: string;
	sucursal: string;
	estado: string;
	monto_apertura: number;
	monto_teorico: number;
	monto_cierre: number;
	diferencia: number | null;
	cantidad_ventas: number;
	total_ventas: number;
	duracion_horas: number | null;
}

export interface SesionesCajaReportData {
	resumen: SesionesCajaResumen;
	por_empleado: SesionesCajaPorEmpleado[];
	detalle_sesiones: SesionesCajaDetalle[];
}

export interface ProductosReportFilters {
	desde?: string;
	hasta?: string;
	id_sucursal?: string;
	id_categoria?: string;
}

export interface ProductoMasVendido {
	producto: string;
	cantidad_vendida: number;
	ingresos: number;
	margen?: number;
	margen_porcentaje?: number;
}

export interface ProductoSinMovimiento {
	id: string;
	producto: string;
}

export interface ProductosReportData {
	mas_vendidos: ProductoMasVendido[];
	menos_vendidos: ProductoMasVendido[];
	sin_movimiento: ProductoSinMovimiento[];
	analisis_abc: {
		A: { productos: number; porcentaje_ventas: number };
		B: { productos: number; porcentaje_ventas: number };
		C: { productos: number; porcentaje_ventas: number };
	};
}

export interface ClientesReportFilters {
	desde?: string;
	hasta?: string;
	tipo_cliente?: string;
}

export interface ClientesResumen {
	total_clientes_activos: number;
	clientes_nuevos_periodo: number;
	clientes_recurrentes: number;
	clientes_mayoristas: number;
	clientes_minoristas: number;
}

export interface TopCliente {
	cliente: string;
	ci: string;
	tipo: string;
	total_compras: number;
	cantidad_ventas: number;
	puntos: number;
}

export interface ClientePorZona {
	zona: string;
	total_ventas: number;
	cantidad: number;
}

export interface ClientesReportData {
	resumen: ClientesResumen;
	top_clientes: TopCliente[];
	por_zona: ClientePorZona[];
}

export interface EmpleadosReportFilters {
	desde?: string;
	hasta?: string;
	id_sucursal?: string;
}

export interface EmpleadoResumen {
	total_empleados_activos: number;
	costo_nomina_mensual: number;
	promedio_salario: number;
}

export interface RendimientoVentas {
	empleado: string;
	cargo: string;
	ventas_total: number;
	cantidad_ventas: number;
	ticket_promedio: number;
}

export interface ProductividadEmpleado {
	empleado: string;
	sesiones_trabajadas: number;
	horas_trabajadas: number;
	ventas_por_hora: number;
	ventas_por_sesion: number;
}

export interface EmpleadosReportData {
	resumen: EmpleadoResumen;
	rendimiento_ventas: RendimientoVentas[];
	productividad: ProductividadEmpleado[];
}

export interface ReportApiResponse<T> {
	status: string;
	data: T;
}
