import type { CompraReportData, CompraReportFilters } from '$lib/interfaces/reporte.interface';
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
 * Generates and triggers download of the Compras PDF report.
 */
export async function generateComprasPdf(
	data: CompraReportData,
	filters: CompraReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	const estadoPago = filters.estado_pago ?? 'Todos';
	const extraInfo = `Estado de pago: ${estadoPago}`;

	// ── Header ──────────────────────────────────────────────────────────────────
	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Compras',
		reportSubtitle: 'Seguimiento de adquisiciones e inversiones',
		desde: filters.desde,
		hasta: filters.hasta,
		extraInfo
	});

	// ── 1. KPI Resumen ───────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen Ejecutivo');

	y = addKpiRow(doc, y, [
		{
			label: 'Total Compras',
			value: fmt(data.resumen.total_compras),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Órdenes de Compra',
			value: fmtN(data.resumen.cantidad_compras),
			color: PDF_COLORS.light
		},
		{
			label: 'Compra Promedio',
			value: fmt(data.resumen.compra_promedio),
			color: PDF_COLORS.light
		},
		{
			label: 'Pendientes de Pago',
			value: fmt(data.resumen.pendientes_pago),
			color: PDF_COLORS.primaryLight,
			textColor: PDF_COLORS.primary
		}
	]);

	// ── 2. Estado de Pago ────────────────────────────────────────────────────────
	y = ensurePageSpace(doc, y, 50);
	y = addSectionTitle(doc, y, 'Desglose por Estado de Pago');

	const estadoHead = [['Estado', 'Cantidad de Órdenes', 'Total (Bs.)']];
	const estadoBody = Object.entries(data.por_estado_pago).map(([estado, stats]) => [
		estado,
		fmtN(stats.cantidad),
		fmt(stats.total)
	]);

	y = addPdfTable(doc, {
		head: estadoHead,
		body: estadoBody,
		startY: y,
		headColor: PDF_COLORS.warning
	});

	// ── 3. Proveedores ───────────────────────────────────────────────────────────
	if (data.por_proveedor.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Desglose por Proveedor');

		const provHead = [['Proveedor', 'Cantidad de Compras', 'Total (Bs.)', '% del Total']];
		const provBody = data.por_proveedor.map((p) => [
			p.proveedor,
			fmtN(p.cantidad),
			fmt(p.total),
			`${p.porcentaje.toFixed(1)}%`
		]);

		y = addPdfTable(doc, {
			head: provHead,
			body: provBody,
			startY: y,
			headColor: PDF_COLORS.info
		});
	}

	// ── 4. Serie Temporal ────────────────────────────────────────────────────────
	y = ensurePageSpace(doc, y, 60);
	y = addSectionTitle(doc, y, 'Evolución de Adquisiciones');

	const serieHead = [['Período', 'Cantidad de Compras', 'Total Invertido (Bs.)']];
	const serieBody = data.serie_temporal.map((row) => [
		row.fecha,
		fmtN(row.cantidad),
		fmt(row.total)
	]);

	y = addPdfTable(doc, {
		head: serieHead,
		body: serieBody,
		startY: y
	});

	// ── 5. Productos más Comprados (completo, sin paginación) ────────────────────
	if (data.productos_mas_comprados.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Productos más Comprados');

		const prodHead = [['#', 'Producto', 'Cant. Total', 'Inversión Total (Bs.)', 'Costo Promedio']];
		const prodBody = data.productos_mas_comprados.map((item, i) => [
			String(i + 1),
			item.producto,
			fmtN(item.cantidad_total),
			fmt(item.costo_total),
			fmt(item.cantidad_total > 0 ? item.costo_total / item.cantidad_total : 0)
		]);

		addPdfTable(doc, {
			head: prodHead,
			body: prodBody,
			startY: y,
			headColor: PDF_COLORS.warning
		});
	}

	// ── Footer ────────────────────────────────────────────────────────────────────
	addPdfFooter(doc);

	// ── Save ──────────────────────────────────────────────────────────────────────
	const filename = `reporte-compras_${filters.desde}_al_${filters.hasta}.pdf`;
	doc.save(filename);
}
