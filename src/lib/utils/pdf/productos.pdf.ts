import type {
	ProductosReportData,
	ProductosReportFilters
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

export async function generateProductosPdf(
	data: ProductosReportData,
	filters: ProductosReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Rotación de Productos',
		reportSubtitle: 'Análisis ABC y rendimiento de productos',
		desde: filters.desde,
		hasta: filters.hasta
	});

	// ── 1. Análisis ABC ───────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Análisis ABC – Clasificación de Productos');

	y = addKpiRow(doc, y, [
		{
			label: `Cat. A – Alta Rotación (${data.analisis_abc.A.porcentaje_ventas}%)`,
			value: `${data.analisis_abc.A.productos} prod.`,
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: `Cat. B – Rotación Media (${data.analisis_abc.B.porcentaje_ventas}%)`,
			value: `${data.analisis_abc.B.productos} prod.`,
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: `Cat. C – Baja Rotación (${data.analisis_abc.C.porcentaje_ventas}%)`,
			value: `${data.analisis_abc.C.productos} prod.`,
			color: PDF_COLORS.warningLight,
			textColor: PDF_COLORS.warning
		}
	]);

	// ── 2. Más Vendidos ───────────────────────────────────────────────────────
	if (data.mas_vendidos.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Top Productos más Vendidos');

		y = addPdfTable(doc, {
			head: [['#', 'Producto', 'Cant. Vendida', 'Ingresos', 'Margen', 'Margen %']],
			body: data.mas_vendidos.map((p, i) => [
				String(i + 1),
				p.producto,
				String(p.cantidad_vendida),
				fmt(p.ingresos),
				p.margen !== undefined ? fmt(p.margen) : '-',
				p.margen_porcentaje !== undefined ? `${p.margen_porcentaje.toFixed(2)}%` : '-'
			]),
			startY: y,
			headColor: PDF_COLORS.success
		});
	}

	// ── 3. Menos Vendidos ─────────────────────────────────────────────────────
	if (data.menos_vendidos.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Productos con Menor Movimiento');

		y = addPdfTable(doc, {
			head: [['#', 'Producto', 'Cant. Vendida', 'Ingresos']],
			body: data.menos_vendidos.map((p, i) => [
				String(i + 1),
				p.producto,
				String(p.cantidad_vendida),
				fmt(p.ingresos)
			]),
			startY: y,
			headColor: PDF_COLORS.warning
		});
	}

	// ── 4. Sin Movimiento ─────────────────────────────────────────────────────
	if (data.sin_movimiento.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, `Productos Sin Rotación (${data.sin_movimiento.length})`);

		addPdfTable(doc, {
			head: [['Producto', 'Estado']],
			body: data.sin_movimiento.map((p) => [p.producto, 'Sin Rotación']),
			startY: y,
			headColor: PDF_COLORS.primary
		});
	}

	addPdfFooter(doc);
	const desde = filters.desde || 'inicio';
	const hasta = filters.hasta || 'hoy';
	doc.save(`reporte-productos_${desde}_al_${hasta}.pdf`);
}
