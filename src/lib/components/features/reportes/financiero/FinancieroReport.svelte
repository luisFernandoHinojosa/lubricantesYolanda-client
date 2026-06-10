<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		FinancieroReportData,
		FinancieroReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { WalletIcon, ListIcon, TredingUpIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import Chart from 'chart.js/auto';
	import { generateFinancieroPdf } from '$lib/utils/pdf/financiero.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<FinancieroReportData | null>(null);

	let filters = $state<FinancieroReportFilters>({
		desde: '',
		hasta: '',
		id_sucursal: ''
	});

	let chartCanvas = $state<HTMLCanvasElement>();
	let chartInstance: Chart | null = null;

	async function loadData() {
		try {
			console.log('loading data', filters);
			loading = true;
			data = await reporteService.getFinancieroReport(filters);
			if (data && chartCanvas) {
				updateChart(data);
			}
		} catch (error) {
			console.error('Error loading financiero report:', error);
			alert('error', 'No se pudo cargar el reporte financiero');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		filters.desde = firstDay.toISOString().split('T')[0];
		filters.hasta = now.toISOString().split('T')[0];

		loadData();

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
	}

	$effect(() => {
		if (data && chartCanvas) {
			updateChart(data);
		}
	});

	function updateChart(reportData: FinancieroReportData) {
		if (!chartCanvas) return;
		if (chartInstance) {
			chartInstance.destroy();
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		const labels = reportData.serie_temporal_mensual.map((item) => {
			const date = new Date(item.mes);
			return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
		});
		const values = reportData.serie_temporal_mensual.map((item) => item.ingresos);

		chartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Ingresos',
						data: values,
						borderColor: '#2563eb', // blue-600
						backgroundColor: 'rgba(37, 99, 235, 0.1)',
						borderWidth: 2,
						tension: 0.4,
						fill: true,
						pointBackgroundColor: '#2563eb',
						pointBorderColor: '#fff',
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverRadius: 6
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						padding: 12,
						cornerRadius: 12,
						callbacks: {
							label: (context) => `Ingresos: ${formatCurrency(Number(context.parsed.y))}`
						}
					}
				},
				scales: {
					x: { grid: { display: false } },
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(0,0,0,0.05)' },
						ticks: {
							callback: (value) => formatCurrency(Number(value))
						}
					}
				}
			}
		});
	}

	let flujoMetodos = $derived(
		data
			? Object.entries(data.flujo_caja.por_metodo_pago).map(([metodo, stats]) => ({
					metodo,
					...stats
				}))
			: []
	);
	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateFinancieroPdf(data, filters);
		} catch (e) {
			console.error('Error generando PDF:', e);
			alert('error', 'No se pudo generar el PDF');
		} finally {
			downloadingPdf = false;
		}
	}
</script>

<div class="flex flex-col gap-8">
	<!-- Filter Bar -->
	<ReportFilterBar
		bind:desde={filters.desde}
		bind:hasta={filters.hasta}
		bind:id_sucursal={filters.id_sucursal}
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
		showDateRange
	/>

	{#if data}
		<!-- Flujo de Caja Resumen -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" in:fade>
			<!-- Total Ingresado -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase"
						>Total Ingresado</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.flujo_caja.total_ingresado)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Ingresos de Caja
					</div>
				</div>
			</div>

			<!-- Total Egresado -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-red-600 uppercase"
						>Total Egresado</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.flujo_caja.total_egresado)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Salidas de Caja
					</div>
				</div>
			</div>

			<!-- Flujo Neto -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full {data.flujo_caja.flujo_neto >= 0
						? 'bg-blue-500/5'
						: 'bg-red-500/5'}"
				></div>
				<div class="flex flex-col gap-1">
					<span
						class="text-[10px] font-black tracking-widest {data.flujo_caja.flujo_neto >= 0
							? 'text-blue-600'
							: 'text-red-600'} uppercase">Flujo de Caja Neto</span
					>
					<h4
						class="text-3xl font-black tracking-tighter {data.flujo_caja.flujo_neto >= 0
							? 'text-light-black'
							: 'text-red-600'}"
					>
						{formatCurrency(data.flujo_caja.flujo_neto)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Balance del Periodo
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2" in:fade>
			<!-- Estado de Resultados (P&L) -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-50 p-2 text-blue-600">
						<ListIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Estado de Resultados
					</h3>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<tbody class="divide-y divide-light-four">
							<tr class="group transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold text-light-black">Ventas Brutas</td>
								<td class="px-4 py-4 text-right font-black text-emerald-600"
									>{formatCurrency(data.estado_resultados.ingresos.ventas_brutas)}</td
								>
							</tr>
							<tr class="group text-red-500 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold">Descuentos Otorgados</td>
								<td class="px-4 py-4 text-right font-black"
									>-{formatCurrency(data.estado_resultados.ingresos.descuentos_otorgados)}</td
								>
							</tr>
							<tr class="group bg-light-four/20 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-black text-light-black uppercase">Ventas Netas</td
								>
								<td class="px-4 py-4 text-right font-black text-emerald-600"
									>{formatCurrency(data.estado_resultados.ingresos.ventas_netas)}</td
								>
							</tr>
							<tr class="group transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold text-light-black">Otros Ingresos</td>
								<td class="px-4 py-4 text-right font-black text-emerald-600"
									>{formatCurrency(data.estado_resultados.ingresos.otros_ingresos)}</td
								>
							</tr>
							<tr class="group bg-light-four/40 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-black text-light-black uppercase"
									>Total Ingresos</td
								>
								<td class="px-4 py-4 text-right font-black text-emerald-600"
									>{formatCurrency(data.estado_resultados.ingresos.total_ingresos)}</td
								>
							</tr>

							<!-- ESPACIO -->
							<tr><td colspan="2" class="h-2"></td></tr>

							<tr class="group text-orange-600 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold">Costo Mercadería Vendida (CMV)</td>
								<td class="px-4 py-4 text-right font-black"
									>-{formatCurrency(data.estado_resultados.costos.costo_mercaderia_vendida)}</td
								>
							</tr>
							<tr
								class="group bg-light-four/40 text-orange-600 transition-all hover:bg-light-one_d"
							>
								<td class="px-4 py-4 text-xs font-black uppercase">Total Costos</td>
								<td class="px-4 py-4 text-right font-black"
									>-{formatCurrency(data.estado_resultados.costos.total_costos)}</td
								>
							</tr>
							<tr class="group bg-light-four/20 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-black text-light-black uppercase">
									Utilidad Bruta
									<span class="ml-2 text-[10px] text-light-black/50"
										>({data.estado_resultados.margen_bruto_porcentaje}%)</span
									>
								</td>
								<td
									class="px-4 py-4 text-right font-black {data.estado_resultados.utilidad_bruta >= 0
										? 'text-light-black'
										: 'text-red-500'}"
								>
									{formatCurrency(data.estado_resultados.utilidad_bruta)}
								</td>
							</tr>

							<!-- ESPACIO -->
							<tr><td colspan="2" class="h-2"></td></tr>

							{#if data.estado_resultados.gastos_operativos.por_categoria.length > 0}
								{#each data.estado_resultados.gastos_operativos.por_categoria as gasto, index (index)}
									<tr class="group text-red-500/80 transition-all hover:bg-light-one_d">
										<td class="px-4 py-4 pl-8 text-[11px] font-medium"
											>- Gasto: {gasto.categoria}</td
										>
										<td class="px-4 py-4 text-right font-bold">-{formatCurrency(gasto.monto)}</td>
									</tr>
								{/each}
							{/if}
							<tr class="group text-red-500 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold">Total Gastos Operativos</td>
								<td class="px-4 py-4 text-right font-black"
									>-{formatCurrency(
										data.estado_resultados.gastos_operativos.total_gastos_operativos
									)}</td
								>
							</tr>
							<tr class="group text-red-500 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-bold">Costo de Nómina Mensual</td>
								<td class="px-4 py-4 text-right font-black"
									>-{formatCurrency(data.estado_resultados.costo_nomina_mensual)}</td
								>
							</tr>
							<tr class="group bg-light-four/50 transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-xs font-black text-light-black uppercase">
									Utilidad Operativa
									<span class="ml-2 text-[10px] text-light-black/50"
										>({data.estado_resultados.margen_operativo_porcentaje}%)</span
									>
								</td>
								<td
									class="px-4 py-4 text-right font-black {data.estado_resultados
										.utilidad_operativa >= 0
										? 'text-light-black'
										: 'text-red-500'}"
								>
									{formatCurrency(data.estado_resultados.utilidad_operativa)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="flex flex-col gap-8">
				<!-- Flujo Caba por Método de Pago -->
				<div
					class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
				>
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
							<WalletIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Flujos de Efectivo
						</h3>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-sm">
							<thead
								class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
							>
								<tr>
									<th class="px-4 py-4">Método de Pago</th>
									<th class="px-4 py-4 text-right text-emerald-600">Ingresos</th>
									<th class="px-4 py-4 text-right text-red-500">Egresos</th>
									<th class="px-4 py-4 text-right">Neto</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-light-four">
								{#each flujoMetodos as item (item.metodo)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-4 py-4 text-xs font-bold text-light-black">{item.metodo}</td>
										<td class="px-4 py-4 text-right text-emerald-600"
											>{formatCurrency(item.ingresos)}</td
										>
										<td class="px-4 py-4 text-right text-red-500"
											>-{formatCurrency(item.egresos)}</td
										>
										<td
											class="px-4 py-4 text-right font-black {item.neto >= 0
												? 'text-light-black'
												: 'text-red-500'}">{formatCurrency(item.neto)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Serie Temporal -->
				<div
					class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="rounded-lg bg-blue-50 p-2 text-blue-600">
								<TredingUpIcon class="size-5" />
							</div>
							<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
								Tendencia de Ingresos
							</h3>
						</div>
					</div>
					<div class="h-64 w-full">
						<canvas bind:this={chartCanvas}></canvas>
					</div>
				</div>
			</div>
		</div>
	{:else if loading}
		<div
			class="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-light-four bg-light-one"
		>
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
			></div>
			<p
				class="animate-pulse text-[10px] font-black tracking-widest text-light-black/40 uppercase italic"
			>
				Cargando Reporte Financiero...
			</p>
		</div>
	{/if}
</div>
