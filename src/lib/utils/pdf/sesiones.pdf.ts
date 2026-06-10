import type {
	SesionesCajaReportData,
	SesionesCajaReportFilters
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

function fmtHours(h: number | null): string {
	if (h === null || h === undefined) return 'N/A';
	return `${h.toFixed(2)} hrs`;
}

export async function generateSesionesPdf(
	data: SesionesCajaReportData,
	filters: SesionesCajaReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Sesiones de Caja',
		reportSubtitle: 'Control de aperturas, cierres y arqueos',
		desde: filters.desde,
		hasta: filters.hasta
	});

	// ── 1. KPI Resumen ────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen del Período');

	const difAcum = data.resumen.diferencia_total_acumulada;
	y = addKpiRow(doc, y, [
		{
			label: 'Total Sesiones',
			value: String(data.resumen.total_sesiones),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Cierres con Diferencia',
			value: String(data.resumen.sesiones_con_diferencia),
			color:
				data.resumen.sesiones_con_diferencia > 0
					? PDF_COLORS.warningLight
					: PDF_COLORS.successLight,
			textColor: data.resumen.sesiones_con_diferencia > 0 ? PDF_COLORS.warning : PDF_COLORS.success
		},
		{
			label: 'Diferencia Acumulada',
			value: fmt(difAcum),
			color: difAcum < 0 ? PDF_COLORS.primaryLight : PDF_COLORS.successLight,
			textColor: difAcum < 0 ? PDF_COLORS.primary : PDF_COLORS.success
		},
		{
			label: 'Duración Promedio',
			value: `${data.resumen.promedio_duracion_horas.toFixed(1)} hrs`,
			color: PDF_COLORS.light
		}
	]);

	// ── 2. Resumen por Empleado ───────────────────────────────────────────────
	if (data.por_empleado.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Rendimiento por Empleado');

		y = addPdfTable(doc, {
			head: [['Empleado', 'Sesiones', 'Total Ventas (Bs.)', 'Diferencia Acumulada']],
			body: data.por_empleado.map((e) => [
				e.empleado,
				String(e.sesiones),
				fmt(e.total_ventas),
				fmt(e.diferencia_acumulada)
			]),
			startY: y,
			headColor: PDF_COLORS.info
		});
	}

	// ── 3. Detalle de Sesiones ────────────────────────────────────────────────
	if (data.detalle_sesiones.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(
			doc,
			y,
			`Historial de Sesiones (${data.detalle_sesiones.length} registros)`
		);

		addPdfTable(doc, {
			head: [
				['Fecha', 'Empleado', 'Sucursal', 'Estado', 'Apertura', 'Ventas', 'Diferencia', 'Duración']
			],
			body: data.detalle_sesiones.map((s) => [
				s.fecha,
				s.empleado,
				s.sucursal,
				s.estado,
				fmt(s.monto_apertura),
				fmt(s.total_ventas),
				s.diferencia !== null ? fmt(s.diferencia) : '-',
				fmtHours(s.duracion_horas)
			]),
			startY: y,
			headColor: PDF_COLORS.warning
		});
	}

	addPdfFooter(doc);
	const desde = filters.desde || 'inicio';
	const hasta = filters.hasta || 'hoy';
	doc.save(`reporte-sesiones-caja_${desde}_al_${hasta}.pdf`);
}
