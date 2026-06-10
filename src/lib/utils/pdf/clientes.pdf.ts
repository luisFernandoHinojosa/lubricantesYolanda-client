import type { ClientesReportData, ClientesReportFilters } from '$lib/interfaces/reporte.interface';
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

export async function generateClientesPdf(
	data: ClientesReportData,
	filters: ClientesReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	const tipoCliente = filters.tipo_cliente || 'Todos';

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte de Clientes',
		reportSubtitle: 'Ranking de fidelidad y comportamiento de compra',
		desde: filters.desde,
		hasta: filters.hasta,
		extraInfo: `Tipo de cliente: ${tipoCliente}`
	});

	// ── 1. KPI Resumen ────────────────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Resumen de Cartera');

	y = addKpiRow(doc, y, [
		{
			label: 'Total Activos',
			value: String(data.resumen.total_clientes_activos),
			color: PDF_COLORS.infoLight,
			textColor: PDF_COLORS.info
		},
		{
			label: 'Nuevos en Período',
			value: `+${data.resumen.clientes_nuevos_periodo}`,
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: 'Recurrentes',
			value: String(data.resumen.clientes_recurrentes),
			color: PDF_COLORS.light
		},
		{
			label: 'Mayoristas',
			value: String(data.resumen.clientes_mayoristas),
			color: PDF_COLORS.light
		}
	]);

	// ── 2. Top Clientes ───────────────────────────────────────────────────────
	if (data.top_clientes.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Ranking de Top Clientes por Compras');

		y = addPdfTable(doc, {
			head: [['#', 'Cliente', 'CI/NIT', 'Tipo', 'Transacciones', 'Total Compras (Bs.)', 'Puntos']],
			body: data.top_clientes.map((c, i) => [
				String(i + 1),
				c.cliente,
				c.ci,
				c.tipo,
				String(c.cantidad_ventas),
				fmt(c.total_compras),
				String(c.puntos)
			]),
			startY: y,
			headColor: PDF_COLORS.success
		});
	}

	// ── 3. Por Zona ───────────────────────────────────────────────────────────
	if (data.por_zona.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Ventas por Zona Geográfica');

		addPdfTable(doc, {
			head: [['Zona', 'Órdenes', 'Total Ventas (Bs.)']],
			body: data.por_zona.map((z) => [z.zona, String(z.cantidad), fmt(z.total_ventas)]),
			startY: y,
			headColor: PDF_COLORS.info
		});
	}

	addPdfFooter(doc);
	const desde = filters.desde || 'inicio';
	const hasta = filters.hasta || 'hoy';
	doc.save(`reporte-clientes_${desde}_al_${hasta}.pdf`);
}
