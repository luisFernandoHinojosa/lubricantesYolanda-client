<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Chart, registerables } from 'chart.js';
	import { reporteService } from '$lib/services/reporte.service';
	import type { VentaReportData, VentaReportFilters } from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { TrendingDownIcon, UsersIcon, HomeDotIcon, TredingUpIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { CoinIcon } from '$lib/icons/solid';
	import { generateVentasPdf } from '$lib/utils/pdf/ventas.pdf';

	Chart.register(...registerables);

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<VentaReportData | null>(null);

	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	let filters = $state<VentaReportFilters>({
		desde: firstDayOfMonth.toISOString().split('T')[0],
		hasta: now.toISOString().split('T')[0],
		agrupar_por: 'dia',
		id_sucursal: '',
		metodo_pago: undefined
	});

	let chartCanvas: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = null;

	async function loadData() {
		try {
			loading = true;
			const apiFilters = {
				...filters,
				desde: filters.desde.split('-').join('-'),
				hasta: filters.hasta.split('-').join('-')
			};
			console.log('apiFilters', apiFilters);
			data = await reporteService.getVentasReport(apiFilters);
			console.log('data', data);
		} catch (error) {
			console.error('Error loading sales report:', error);
			alert('error', 'No se pudo cargar el reporte de ventas');
		} finally {
			loading = false;
		}
	}

	function updateChart() {
		if (!chartCanvas || !data || !data.serie_temporal) return;

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		if (chart) chart.destroy();

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.serie_temporal.map((d) => d.fecha),
				datasets: [
					{
						label: 'Ventas Totales (Bs)',
						data: data.serie_temporal.map((d) => d.total),
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						borderWidth: 3,
						pointRadius: 4,
						pointHoverRadius: 6,
						tension: 0.3,
						fill: true
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
							label: (context) => `Total: ${formatCurrency(Number(context.parsed.y))}`
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

	$effect(() => {
		if (data && chartCanvas) {
			untrack(() => updateChart());
		}
	});

	onMount(loadData);
	onDestroy(() => chart?.destroy());

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
	}

	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateVentasPdf(data, filters);
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
		bind:metodo_pago={filters.metodo_pago}
		bind:agrupar_por={filters.agrupar_por}
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
		showPaymentMethod
		showGrouping
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" in:fade>
			<!-- Total Ventas -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-green-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-green-600 uppercase"
						>Ventas Totales</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.total_ventas)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span
							class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700"
						>
							{data.resumen.cantidad_ventas} Transacciones
						</span>
					</div>
				</div>
			</div>

			<!-- Ticket Promedio -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Ticket Promedio</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.ticket_promedio)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span class="text-[10px] font-bold text-light-black/40 uppercase">Venta más alta:</span>
						<span class="text-[10px] font-bold text-light-black"
							>{formatCurrency(data.resumen.venta_maxima)}</span
						>
					</div>
				</div>
			</div>

			<!-- Descuentos -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-red-600 uppercase"
						>Descuentos</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.total_descuentos)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span class="text-[10px] font-bold text-light-black/40 uppercase">Venta mínima:</span>
						<span class="text-[10px] font-bold text-light-black"
							>{formatCurrency(data.resumen.venta_minima)}</span
						>
					</div>
				</div>
			</div>

			<!-- Comparativa -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-indigo-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-indigo-600 uppercase"
						>Comparativa</span
					>
					<div class="flex items-baseline gap-2">
						<h4 class="text-3xl font-black tracking-tighter text-light-black">
							{Math.abs(data.comparativa_periodo_anterior.variacion_porcentual)}%
						</h4>
						<div
							class="flex items-center {data.comparativa_periodo_anterior.variacion_porcentual >= 0
								? 'text-green-600'
								: 'text-red-600'}"
						>
							{#if data.comparativa_periodo_anterior.variacion_porcentual >= 0}
								<TredingUpIcon class="size-4" />
							{:else}
								<TrendingDownIcon class="size-4" />
							{/if}
						</div>
					</div>
					<div class="mt-2 flex flex-col">
						<span class="text-[10px] font-bold text-light-black/40 uppercase"
							>vs Periodo Anterior</span
						>
						<span class="text-[10px] font-medium text-light-black/30"
							>Anterior: {formatCurrency(data.comparativa_periodo_anterior.total_anterior)}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Chart & Details -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3" in:fade>
			<!-- Main Chart Card -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:col-span-2"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-red-50 p-2 text-red-600">
							<TredingUpIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Tendencia de Ventas
						</h3>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-[10px] font-bold text-light-black/40 uppercase">Agrupado por:</span>
						<span
							class="rounded-full bg-light-four px-2 py-0.5 text-[10px] font-bold text-light-black uppercase"
						>
							{filters.agrupar_por}
						</span>
					</div>
				</div>
				<div class="h-[350px] w-full">
					<canvas bind:this={chartCanvas}></canvas>
				</div>
			</div>

			<!-- Payment Method Breakdown -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
						<CoinIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Medios de Pago
					</h3>
				</div>

				<div class="flex flex-col gap-4">
					{#each Object.entries(data.por_metodo_pago) as [metodo, stats] (metodo)}
						<div
							class="group flex items-center justify-between rounded-2xl border border-light-four p-4 transition-all hover:bg-light-one_d"
						>
							<div class="flex flex-col gap-1">
								<span class="text-[10px] font-black tracking-widest text-light-black/40 uppercase"
									>{metodo}</span
								>
								<span class="text-sm font-bold text-light-black">{stats.cantidad} Ventas</span>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="text-lg font-black tracking-tight text-emerald-600"
									>{formatCurrency(stats.total)}</span
								>
								<div class="h-1 w-20 overflow-hidden rounded-full bg-light-four">
									<div
										class="h-full rounded-full bg-emerald-500"
										style="width: {stats.porcentaje}%"
									></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Rankings & Performance -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2" in:fade>
			<!-- Top Sucursales -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-orange-50 p-2 text-orange-600">
						<HomeDotIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Desempeño por Sucursal
					</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr
								class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
							>
								<th class="px-4 py-4">Sucursal</th>
								<th class="px-4 py-4 text-center">Ventas</th>
								<th class="px-4 py-4 text-right">Total</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each data.por_sucursal as s (s.id_sucursal)}
								<tr class="group transition-all hover:bg-light-one_d">
									<td class="px-4 py-4 text-xs font-bold text-light-black uppercase"
										>{s.sucursal}</td
									>
									<td class="px-4 py-4 text-center">
										<span
											class="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600"
										>
											{s.cantidad}
										</span>
									</td>
									<td class="px-4 py-4 text-right font-black text-light-black">
										{formatCurrency(s.total)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Top Cajeros -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2 text-purple-600">
						<UsersIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">Top Cajeros</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr
								class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
							>
								<th class="px-4 py-4">Empleado</th>
								<th class="px-4 py-4 text-center">Transacciones</th>
								<th class="px-4 py-4 text-right">Total Bs.</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each data.top_cajeros as c (c.empleado)}
								<tr class="group transition-all hover:bg-light-one_d">
									<td class="px-4 py-4 text-xs font-bold text-light-black uppercase"
										>{c.empleado}</td
									>
									<td class="px-4 py-4 text-center">
										<span
											class="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-600"
										>
											{c.cantidad}
										</span>
									</td>
									<td class="px-4 py-4 text-right font-black text-light-black">
										{formatCurrency(c.total)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-light-four bg-light-one"
		>
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600"
			></div>
			<p
				class="animate-pulse text-[10px] font-black tracking-widest text-light-black/40 uppercase italic"
			>
				Analizando Datos de Ventas...
			</p>
		</div>
	{/if}
</div>
