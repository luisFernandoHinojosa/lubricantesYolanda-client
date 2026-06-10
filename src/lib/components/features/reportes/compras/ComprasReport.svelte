<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Chart, registerables } from 'chart.js';
	import { reporteService } from '$lib/services/reporte.service';
	import type { CompraReportData, CompraReportFilters } from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import {
		UsersIcon,
		BoxIcon,
		TredingUpIcon,
		ChevronLeftIcon,
		ChevronRightIcon
	} from '$lib/icons/outline';
	import Button from '$lib/components/ui/button.svelte';
	import { alert } from '$lib/utils';
	import { generateComprasPdf } from '$lib/utils/pdf/compras.pdf';

	Chart.register(...registerables);

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<CompraReportData | null>(null);

	let itemsPerPage = 5;
	let pageProductos = $state(1);

	let paginatedProductos = $derived(
		data?.productos_mas_comprados?.slice(
			(pageProductos - 1) * itemsPerPage,
			pageProductos * itemsPerPage
		) || []
	);

	let totalPagesProductos = $derived(
		Math.ceil((data?.productos_mas_comprados?.length || 0) / itemsPerPage)
	);

	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	let filters = $state<CompraReportFilters>({
		desde: firstDayOfMonth.toISOString().split('T')[0],
		hasta: now.toISOString().split('T')[0],
		id_sucursal: '',
		id_proveedor: '',
		estado_pago: undefined
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
			data = await reporteService.getComprasReport(apiFilters);
			pageProductos = 1; // Reset pagination
		} catch (error) {
			console.error('Error loading purchase report:', error);
			alert('error', 'No se pudo cargar el reporte de compras');
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
						label: 'Compras Totales (Bs)',
						data: data.serie_temporal.map((d) => d.total),
						borderColor: 'rgb(59, 130, 246)', // Blue for purchases
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
			await generateComprasPdf(data, filters);
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
		bind:id_proveedor={filters.id_proveedor}
		bind:estado_pago={filters.estado_pago}
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
		showProvider
		showPaymentStatus
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" in:fade>
			<!-- Total Compras -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Total Compras</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.total_compras)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
							{data.resumen.cantidad_compras} Órdenes
						</span>
					</div>
				</div>
			</div>

			<!-- Compra Promedio -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-indigo-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-indigo-600 uppercase"
						>Compra Promedio</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.compra_promedio)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span class="text-[10px] font-bold text-light-black/40 uppercase"
							>Eficiencia de Adquisición</span
						>
					</div>
				</div>
			</div>

			<!-- Pendientes de Pago -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-red-600 uppercase"
						>Pendientes de Pago</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-red-600">
						{formatCurrency(data.resumen.pendientes_pago)}
					</h4>
					<div class="mt-2 flex items-center gap-1.5">
						<span class="text-[10px] font-bold text-red-600/60 uppercase">Deuda Total</span>
					</div>
				</div>
			</div>

			<!-- Métricas Adicionales -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase"
						>Estado General</span
					>
					<div class="mt-2 flex flex-col gap-2">
						{#each Object.entries(data.por_estado_pago) as [estado, stats], index (index)}
							<div class="flex items-center justify-between">
								<span class="text-[10px] font-bold text-light-black/40 uppercase">{estado}</span>
								<span class="text-[10px] font-black text-light-black"
									>{formatCurrency(stats.total)}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Chart & Provider Breakdown -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3" in:fade>
			<!-- Main Chart Card -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:col-span-2"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-blue-50 p-2 text-blue-600">
							<TredingUpIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Tendencia de Adquisiciones
						</h3>
					</div>
				</div>
				<div class="h-[350px] w-full">
					<canvas bind:this={chartCanvas}></canvas>
				</div>
			</div>

			<!-- Provider Breakdown -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-indigo-50 p-2 text-indigo-600">
						<UsersIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Desglose por Proveedor
					</h3>
				</div>

				<div class="flex flex-col gap-4">
					{#each data.por_proveedor as p, index (index)}
						<div
							class="group flex items-center justify-between rounded-2xl border border-light-four p-4 transition-all hover:bg-light-one_d"
						>
							<div class="flex flex-col gap-1">
								<span
									class="max-w-[150px] truncate text-[10px] font-black tracking-widest text-light-black/40 uppercase"
									>{p.proveedor}</span
								>
								<span class="text-sm font-bold text-light-black">{p.cantidad} Compras</span>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="text-lg font-black tracking-tight text-blue-600"
									>{formatCurrency(p.total)}</span
								>
								<div class="h-1 w-20 overflow-hidden rounded-full bg-light-four">
									<div class="h-full rounded-full bg-blue-500" style="width: {p.porcentaje}%"></div>
								</div>
							</div>
						</div>
					{:else}
						<p
							class="text-xs text-light-black/40 text-center py-10 uppercase font-bold tracking-widest"
						>
							No hay datos de proveedores
						</p>
					{/each}
				</div>
			</div>
		</div>

		<!-- Top Products Table -->
		<div
			class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			in:fade
		>
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-orange-50 p-2 text-orange-600">
					<BoxIcon class="size-5" />
				</div>
				<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
					Productos más Comprados
				</h3>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead>
						<tr
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<th class="w-16 px-4 py-4 text-center">#</th>
							<th class="px-4 py-4">Producto</th>
							<th class="px-4 py-4 text-center">Cantidad</th>
							<th class="px-4 py-4 text-right">Inversión Total</th>
							<th class="px-4 py-4 text-right">Costo Prom.</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-light-four">
						{#each paginatedProductos as item, i (item.producto)}
							<tr class="group transition-all hover:bg-light-one_d">
								<td class="px-4 py-4 text-center font-black text-light-black/20"
									>{(pageProductos - 1) * itemsPerPage + i + 1}</td
								>
								<td class="px-4 py-4 text-xs font-bold text-light-black uppercase"
									>{item.producto}</td
								>
								<td class="px-4 py-4 text-center">
									<span
										class="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600"
									>
										{item.cantidad_total} Unidades
									</span>
								</td>
								<td class="px-4 py-4 text-right font-black text-light-black">
									{formatCurrency(item.costo_total)}
								</td>
								<td class="px-4 py-4 text-right font-medium text-light-black/40">
									{formatCurrency(item.costo_total / (item.cantidad_total || 1))}
								</td>
							</tr>
						{:else}
							<tr>
								<td
									colspan="5"
									class="px-4 py-12 text-center text-light-black/40 uppercase text-[10px] tracking-widest font-black"
								>
									No se encontraron productos en este periodo
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if totalPagesProductos > 1}
				<div class="mt-4 flex items-center justify-between border-t border-light-four pt-4">
					<span class="text-[10px] font-bold text-light-black/40"
						>Pág {pageProductos} / {totalPagesProductos}</span
					>
					<div class="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							onclick={() => pageProductos > 1 && pageProductos--}
							disabled={pageProductos === 1}><ChevronLeftIcon class="size-4" /></Button
						>
						<Button
							variant="outline"
							size="sm"
							onclick={() => pageProductos < totalPagesProductos && pageProductos++}
							disabled={pageProductos === totalPagesProductos}
							><ChevronRightIcon class="size-4" /></Button
						>
					</div>
				</div>
			{/if}
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
				Sincronizando Historial de Compras...
			</p>
		</div>
	{/if}
</div>
