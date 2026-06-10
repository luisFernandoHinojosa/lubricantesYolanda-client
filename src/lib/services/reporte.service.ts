import { apiMilenium } from '$lib/config';
import type {
	VentaReportFilters,
	VentaReportData,
	CompraReportFilters,
	CompraReportData,
	InventarioReportFilters,
	InventarioReportData,
	FinancieroReportFilters,
	FinancieroReportData,
	SesionesCajaReportFilters,
	SesionesCajaReportData,
	ProductosReportFilters,
	ProductosReportData,
	ClientesReportFilters,
	ClientesReportData,
	EmpleadosReportFilters,
	EmpleadosReportData,
	ReportApiResponse
} from '$lib/interfaces/reporte.interface';

class ReporteService {
	async getVentasReport(filters: VentaReportFilters): Promise<VentaReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.metodo_pago) params.append('metodo_pago', filters.metodo_pago);
		if (filters.agrupar_por) params.append('agrupar_por', filters.agrupar_por);

		const response = await apiMilenium.get<ReportApiResponse<VentaReportData>>(
			`/reportes/ventas?${params.toString()}`
		);
		return response.data;
	}

	async getVentasQuickStats(): Promise<{ total_hoy: number; total_ayer: number }> {
		const now = new Date();
		const formattedDate = now
			.toLocaleDateString('es-ES', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			})
			.replace(/\//g, '-');

		const response = await this.getVentasReport({
			desde: formattedDate,
			hasta: formattedDate,
			agrupar_por: 'dia'
		});

		return {
			total_hoy: response.resumen.total_ventas,
			total_ayer: 0
		};
	}

	async getComprasReport(filters: CompraReportFilters): Promise<CompraReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.id_proveedor) params.append('id_proveedor', filters.id_proveedor);
		if (filters.estado_pago) params.append('estado_pago', filters.estado_pago);

		const response = await apiMilenium.get<ReportApiResponse<CompraReportData>>(
			`/reportes/compras?${params.toString()}`
		);
		return response.data;
	}

	async getInventarioReport(filters: InventarioReportFilters): Promise<InventarioReportData> {
		const params = new URLSearchParams();

		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.id_categoria) params.append('id_categoria', filters.id_categoria);

		const response = await apiMilenium.get<ReportApiResponse<InventarioReportData>>(
			`/reportes/inventario?${params.toString()}`
		);
		return response.data;
	}

	async getFinancieroReport(filters: FinancieroReportFilters): Promise<FinancieroReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);

		const response = await apiMilenium.get<ReportApiResponse<FinancieroReportData>>(
			`/reportes/financiero?${params.toString()}`
		);
		return response.data;
	}

	async getSesionesCajaReport(filters: SesionesCajaReportFilters): Promise<SesionesCajaReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.id_empleado) params.append('id_empleado', filters.id_empleado);

		const response = await apiMilenium.get<ReportApiResponse<SesionesCajaReportData>>(
			`/reportes/sesiones-caja?${params.toString()}`
		);
		return response.data;
	}

	async getProductosReport(filters: ProductosReportFilters): Promise<ProductosReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);
		if (filters.id_categoria) params.append('id_categoria', filters.id_categoria);

		const response = await apiMilenium.get<ReportApiResponse<ProductosReportData>>(
			`/reportes/productos?${params.toString()}`
		);
		return response.data;
	}

	async getClientesReport(filters: ClientesReportFilters): Promise<ClientesReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.tipo_cliente) params.append('tipo_cliente', filters.tipo_cliente);

		const response = await apiMilenium.get<ReportApiResponse<ClientesReportData>>(
			`/reportes/clientes?${params.toString()}`
		);
		return response.data;
	}

	async getEmpleadosReport(filters: EmpleadosReportFilters): Promise<EmpleadosReportData> {
		const params = new URLSearchParams();

		if (filters.desde) params.append('desde', filters.desde);
		if (filters.hasta) params.append('hasta', filters.hasta);
		if (filters.id_sucursal) params.append('id_sucursal', filters.id_sucursal);

		const response = await apiMilenium.get<ReportApiResponse<EmpleadosReportData>>(
			`/reportes/empleados?${params.toString()}`
		);
		return response.data;
	}
}

export const reporteService = new ReporteService();
