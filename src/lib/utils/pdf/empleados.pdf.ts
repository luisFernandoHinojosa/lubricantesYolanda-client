import type {
	EmpleadosReportData,
	EmpleadosReportFilters
} from '$lib/interfaces/reporte.interface';
import {
	createPdfDoc,
	addPdfHeader,
	addPdfFooter,
	addSectionTitle,
	addKpiRow,
	addPdfTable,
	ensurePageSpace,
	PDF_COLORS
} from './pdfBase';

function fmt(val: number): string {
	return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
}

export async function generateEmpleadosPdf(
	data: EmpleadosReportData,
	filters: EmpleadosReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Desempeño de Empleados',
		reportSubtitle: 'Productividad y ventas por personal',
		desde: filters.desde,
		hasta: filters.hasta
	});

	// ── 1. KPI Resumen ────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen de Recursos Humanos');

	y = addKpiRow(doc, y, [
		{
			label: 'Empleados Activos',
			value: String(data.resumen.total_empleados_activos),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Costo de Nómina',
			value: fmt(data.resumen.costo_nomina_mensual),
			color: PDF_COLORS.warningLight,
			textColor: PDF_COLORS.warning
		},
		{
			label: 'Salario Promedio',
			value: fmt(data.resumen.promedio_salario),
			color: PDF_COLORS.light
		}
	]);

	// ── 2. Rendimiento en Ventas ──────────────────────────────────────────────
	if (data.rendimiento_ventas.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Rendimiento en Ventas por Empleado');

		y = addPdfTable(doc, {
			head: [['Empleado', 'Cargo', 'Cant. Ventas', 'Ticket Promedio', 'Total Ventas (Bs.)']],
			body: data.rendimiento_ventas.map((e) => [
				e.empleado,
				e.cargo,
				String(e.cantidad_ventas),
				fmt(e.ticket_promedio),
				fmt(e.ventas_total)
			]),
			startY: y,
			headColor: PDF_COLORS.success
		});
	}

	// ── 3. Productividad Operativa ────────────────────────────────────────────
	if (data.productividad.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Productividad Operativa');

		addPdfTable(doc, {
			head: [['Empleado', 'Sesiones', 'Horas Trabajadas', 'Venta/Hora', 'Venta/Sesión']],
			body: data.productividad.map((e) => [
				e.empleado,
				String(e.sesiones_trabajadas),
				`${e.horas_trabajadas.toFixed(2)} hrs`,
				fmt(e.ventas_por_hora),
				fmt(e.ventas_por_sesion)
			]),
			startY: y,
			headColor: PDF_COLORS.info
		});
	}

	addPdfFooter(doc);
	const desde = filters.desde || 'inicio';
	const hasta = filters.hasta || 'hoy';
	doc.save(`reporte-empleados_${desde}_al_${hasta}.pdf`);
}
