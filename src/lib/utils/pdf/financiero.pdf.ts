import type {
	FinancieroReportData,
	FinancieroReportFilters
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

export async function generateFinancieroPdf(
	data: FinancieroReportData,
	filters: FinancieroReportFilters
): Promise<void> {
	const doc = createPdfDoc();

	let y = addPdfHeader(doc, {
		reportTitle: 'Reporte Financiero – Flujo de Caja',
		reportSubtitle: 'Balance general de movimientos monetarios',
		desde: filters.desde,
		hasta: filters.hasta
	});

	// ── 1. Flujo de Caja (KPIs) ───────────────────────────────────────────────
	y = addSectionTitle(doc, y, 'Flujo de Caja del Período');

	const flujoNeto = data.flujo_caja.flujo_neto;
	y = addKpiRow(doc, y, [
		{
			label: 'Total Ingresado',
			value: fmt(data.flujo_caja.total_ingresado),
			color: PDF_COLORS.successLight,
			textColor: PDF_COLORS.success
		},
		{
			label: 'Total Egresado',
			value: fmt(data.flujo_caja.total_egresado),
			color: PDF_COLORS.primaryLight,
			textColor: PDF_COLORS.primary
		},
		{
			label: 'Flujo Neto',
			value: fmt(flujoNeto),
			color: flujoNeto >= 0 ? PDF_COLORS.successLight : PDF_COLORS.primaryLight,
			textColor: flujoNeto >= 0 ? PDF_COLORS.success : PDF_COLORS.primary
		}
	]);

	// ── 2. Flujo por Método de Pago ───────────────────────────────────────────
	y = ensurePageSpace(doc, y, 60);
	y = addSectionTitle(doc, y, 'Flujos por Método de Pago');

	const flujoBody = Object.entries(data.flujo_caja.por_metodo_pago).map(([metodo, stats]) => [
		metodo,
		fmt(stats.ingresos),
		fmt(stats.egresos),
		fmt(stats.neto)
	]);

	y = addPdfTable(doc, {
		head: [['Método de Pago', 'Ingresos', 'Egresos', 'Neto']],
		body: flujoBody,
		startY: y,
		headColor: PDF_COLORS.success
	});

	// ── 3. Estado de Resultados (P&L) ─────────────────────────────────────────
	y = ensurePageSpace(doc, y, 80);
	y = addSectionTitle(doc, y, 'Estado de Resultados (P&L)');

	const er = data.estado_resultados;
	const plBody: (string | number)[][] = [
		['Ventas Brutas', fmt(er.ingresos.ventas_brutas)],
		['(-) Descuentos Otorgados', `-${fmt(er.ingresos.descuentos_otorgados)}`],
		['= Ventas Netas', fmt(er.ingresos.ventas_netas)],
		['(+) Otros Ingresos', fmt(er.ingresos.otros_ingresos)],
		['= Total Ingresos', fmt(er.ingresos.total_ingresos)],
		['(-) CMV (Costo Mercadería Vendida)', `-${fmt(er.costos.costo_mercaderia_vendida)}`],
		['= Utilidad Bruta', `${fmt(er.utilidad_bruta)} (${er.margen_bruto_porcentaje}%)`]
	];

	er.gastos_operativos.por_categoria.forEach((g) => {
		plBody.push([`   - Gasto: ${g.categoria}`, `-${fmt(g.monto)}`]);
	});

	plBody.push(
		['(-) Total Gastos Operativos', `-${fmt(er.gastos_operativos.total_gastos_operativos)}`],
		['(-) Costo de Nómina', `-${fmt(er.costo_nomina_mensual)}`],
		['= Utilidad Operativa', `${fmt(er.utilidad_operativa)} (${er.margen_operativo_porcentaje}%)`]
	);

	y = addPdfTable(doc, {
		head: [['Concepto', 'Monto (Bs.)']],
		body: plBody,
		startY: y,
		headColor: PDF_COLORS.info
	});

	// ── 4. Serie Temporal Mensual ─────────────────────────────────────────────
	if (data.serie_temporal_mensual.length > 0) {
		y = ensurePageSpace(doc, y, 60);
		y = addSectionTitle(doc, y, 'Tendencia de Ingresos Mensuales');

		addPdfTable(doc, {
			head: [['Mes', 'Ingresos (Bs.)']],
			body: data.serie_temporal_mensual.map((m) => [m.mes, fmt(m.ingresos)]),
			startY: y
		});
	}

	addPdfFooter(doc);
	const desde = filters.desde || 'inicio';
	const hasta = filters.hasta || 'hoy';
	doc.save(`reporte-financiero_${desde}_al_${hasta}.pdf`);
}
