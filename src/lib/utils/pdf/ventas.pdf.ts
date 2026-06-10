import type { VentaReportData, VentaReportFilters } from '$lib/interfaces/reporte.interface';
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

function fmtN(val: number): string {
	return new Intl.NumberFormat('es-BO').format(val);
}

/**
 * Generates and triggers download of the Ventas PDF report.
 */
export async function generateVentasPdf(
	data: VentaReportData,
	filters: VentaReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	// Determine readable filter values
	const metodoPago = filters.metodo_pago ?? 'Todos';
	const extraInfo = `Método pago: ${metodoPago}  •  Agrupado por: ${filters.agrupar_por}`;

	// ── Header ──────────────────────────────────────────────────────────────────
	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Ventas',
		reportSubtitle: 'Análisis de ingresos y transacciones',
		desde: filters.desde,
		hasta: filters.hasta,
		extraInfo
	});

	// ── 1. KPI Resumen ───────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen Ejecutivo');

	y = addKpiRow(doc, y, [
		{
			label: 'Ventas Totales',
			value: fmt(data.resumen.total_ventas),
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: 'Transacciones',
			value: fmtN(data.resumen.cantidad_ventas),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Ticket Promedio',
			value: fmt(data.resumen.ticket_promedio),
			color: PDF_COLORS.light
		},
		{
			label: 'Venta Máxima',
			value: fmt(data.resumen.venta_maxima),
			color: PDF_COLORS.light
		}
	]);

	y = addKpiRow(doc, y, [
		{
			label: 'Total Descuentos',
			value: fmt(data.resumen.total_descuentos),
			color: PDF_COLORS.primaryLight,
			textColor: PDF_COLORS.primary
		},
		{
			label: 'Venta Mínima',
			value: fmt(data.resumen.venta_minima),
			color: PDF_COLORS.light
		},
		{
			label: 'Variación vs Anterior',
			value: `${data.comparativa_periodo_anterior.variacion_porcentual >= 0 ? '+' : ''}${data.comparativa_periodo_anterior.variacion_porcentual.toFixed(1)}%`,
			color:
				data.comparativa_periodo_anterior.variacion_porcentual >= 0
					? PDF_COLORS.successLight
					: PDF_COLORS.primaryLight,
			textColor:
				data.comparativa_periodo_anterior.variacion_porcentual >= 0
					? PDF_COLORS.success
					: PDF_COLORS.primary
		},
		{
			label: 'Período Anterior',
			value: fmt(data.comparativa_periodo_anterior.total_anterior),
			color: PDF_COLORS.light
		}
	]);

	// ── 2. Medios de Pago ────────────────────────────────────────────────────────
	y = ensurePageSpace(doc, y, 60);
	y = addSectionTitle(doc, y, 'Desglose por Medio de Pago');

	const metodosHead = [['Método de Pago', 'Cantidad de Ventas', 'Total (Bs.)', '% del Total']];
	const metodosBody = Object.entries(data.por_metodo_pago).map(([metodo, stats]) => [
		metodo,
		fmtN(stats.cantidad),
		fmt(stats.total),
		`${stats.porcentaje.toFixed(1)}%`
	]);

	y = addPdfTable(doc, {
		head: metodosHead,
		body: metodosBody,
		startY: y,
		headColor: PDF_COLORS.success
	});

	// ── 3. Serie Temporal ────────────────────────────────────────────────────────
	y = ensurePageSpace(doc, y, 60);
	y = addSectionTitle(doc, y, `Evolución de Ventas (agrupado por ${filters.agrupar_por})`);

	const serieHead = [['Período', 'Cantidad de Ventas', 'Total Ventas (Bs.)']];
	const serieBody = data.serie_temporal.map((row) => [
		row.fecha,
		fmtN(row.cantidad),
		fmt(row.total)
	]);

	y = addPdfTable(doc, {
		head: serieHead,
		body: serieBody,
		startY: y,
		headColor: PDF_COLORS.info
	});

	// ── 4. Desempeño por Sucursal ────────────────────────────────────────────────
	if (data.por_sucursal.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Desempeño por Sucursal');

		const sucHead = [['Sucursal', 'Ventas', 'Total (Bs.)', '% Part.']];
		const totalVentas = data.resumen.total_ventas || 1;
		const sucBody = data.por_sucursal.map((s) => [
			s.sucursal,
			fmtN(s.cantidad),
			fmt(s.total),
			`${((s.total / totalVentas) * 100).toFixed(1)}%`
		]);

		y = addPdfTable(doc, {
			head: sucHead,
			body: sucBody,
			startY: y,
			headColor: PDF_COLORS.warning
		});
	}

	// ── 5. Top Cajeros ───────────────────────────────────────────────────────────
	if (data.top_cajeros.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Top Cajeros / Empleados');

		const cajerosHead = [['Empleado', 'Transacciones', 'Total Ventas (Bs.)', 'Ticket Promedio']];
		const cajerosBody = data.top_cajeros.map((c) => [
			c.empleado,
			fmtN(c.cantidad),
			fmt(c.total),
			fmt(c.cantidad > 0 ? c.total / c.cantidad : 0)
		]);

		addPdfTable(doc, {
			head: cajerosHead,
			body: cajerosBody,
			startY: y
		});
	}

	// ── Footer on all pages ───────────────────────────────────────────────────────
	addPdfFooter(doc);

	// ── Save ─────────────────────────────────────────────────────────────────────
	const filename = `reporte-ventas_${filters.desde}_al_${filters.hasta}.pdf`;
	doc.save(filename);
}
