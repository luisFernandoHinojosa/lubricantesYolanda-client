import type {
	InventarioReportData,
	InventarioReportFilters
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

export async function generateInventarioPdf(data: InventarioReportData): Promise<void> {
	const doc = createPdfDoc();

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Inventario',
		reportSubtitle: 'Valoración y estado de existencias en almacenes'
	});

	// ── 1. KPI Resumen ────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen de Valorización');

	y = addKpiRow(doc, y, [
		{
			label: 'Productos Activos',
			value: String(data.resumen.total_productos_activos),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Inversión (Costo)',
			value: fmt(data.resumen.valor_total_costo),
			color: PDF_COLORS.light
		},
		{
			label: 'Valor Venta',
			value: fmt(data.resumen.valor_total_venta),
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: 'Margen Bruto',
			value: fmt(data.resumen.margen_bruto_potencial),
			color: PDF_COLORS.light
		}
	]);

	y = addKpiRow(doc, y, [
		{
			label: 'Rentabilidad %',
			value: `${data.resumen.porcentaje_margen}%`,
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: 'Stock Crítico',
			value: String(data.resumen.productos_stock_critico),
			color: PDF_COLORS.warningLight,
			textColor: PDF_COLORS.warning
		},
		{
			label: 'Agotados',
			value: String(data.resumen.productos_sin_stock),
			color: PDF_COLORS.primaryLight,
			textColor: PDF_COLORS.primary
		},
		{
			label: 'Vencen 30 días',
			value: String(data.resumen.lotes_por_vencer_30dias),
			color: PDF_COLORS.primaryLight,
			textColor: PDF_COLORS.primary
		}
	]);

	// ── 2. Por Categoría ──────────────────────────────────────────────────────
	if (data.por_categoria.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Valorización por Categoría');

		y = addPdfTable(doc, {
			head: [['Categoría', 'Productos', 'Inversión (Costo)', 'Valor Venta']],
			body: data.por_categoria.map((c) => [
				c.categoria,
				String(c.productos),
				fmt(c.valor_costo),
				fmt(c.valor_venta)
			]),
			startY: y,
			headColor: PDF_COLORS.info
		});
	}

	// ── 3. Stock Crítico ──────────────────────────────────────────────────────
	if (data.stock_critico.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Alerta de Stock Crítico');

		y = addPdfTable(doc, {
			head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Déficit']],
			body: data.stock_critico.map((s) => [
				s.producto,
				String(s.stock_actual),
				String(s.stock_minimo),
				`-${s.deficit}`
			]),
			startY: y,
			headColor: PDF_COLORS.warning
		});
	}

	// ── 4. Próximos Vencimientos ──────────────────────────────────────────────
	if (data.proximos_vencimientos.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Próximos Vencimientos (Lotes)');

		addPdfTable(doc, {
			head: [['Producto', 'Lote', 'Fecha Vencimiento', 'Cantidad Restante']],
			body: data.proximos_vencimientos.map((v) => [
				v.producto,
				v.lote,
				v.fecha_vencimiento,
				v.cantidad_restante
			]),
			startY: y,
			headColor: PDF_COLORS.primary
		});
	}

	addPdfFooter(doc);
	doc.save(`reporte-inventario_${new Date().toISOString().split('T')[0]}.pdf`);
}
