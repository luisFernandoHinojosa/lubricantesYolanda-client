<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		ProductosReportData,
		ProductosReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import {
		TrendingDownIcon,
		BoxIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		TredingUpIcon
	} from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { generateProductosPdf } from '$lib/utils/pdf/productos.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<ProductosReportData | null>(null);

	let filters = $state<ProductosReportFilters>({
		desde: '',
		hasta: '',
		id_sucursal: '',
		id_categoria: ''
	});

	// Pagination variables
	const perPage = 20;

	// For Más Vendidos
	let pageMas = $state(1);
	let paginatedMasVendidos = $derived(
		data ? data.mas_vendidos.slice((pageMas - 1) * perPage, pageMas * perPage) : []
	);
	let totalPagesMas = $derived(data ? Math.ceil(data.mas_vendidos.length / perPage) : 0);

	// For Menos Vendidos
	let pageMenos = $state(1);
	let paginatedMenosVendidos = $derived(
		data ? data.menos_vendidos.slice((pageMenos - 1) * perPage, pageMenos * perPage) : []
	);
	let totalPagesMenos = $derived(data ? Math.ceil(data.menos_vendidos.length / perPage) : 0);

	// For Sin Movimiento
	let pageSin = $state(1);
	let paginatedSinMovimiento = $derived(
		data ? data.sin_movimiento.slice((pageSin - 1) * perPage, pageSin * perPage) : []
	);
	let totalPagesSin = $derived(data ? Math.ceil(data.sin_movimiento.length / perPage) : 0);

	async function loadData() {
		try {
			loading = true;
			// Reset paginations
			pageMas = 1;
			pageMenos = 1;
			pageSin = 1;
			data = await reporteService.getProductosReport(filters);
		} catch (error) {
			console.error('Error loading productos report:', error);
			alert('error', 'No se pudo cargar el reporte de rotación de productos');
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
	});

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
	}

	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateProductosPdf(data, filters);
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
		bind:id_categoria={filters.id_categoria}
		showCategory
		showDateRange
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
	/>

	{#if data}
		<!-- Análisis ABC (Stats Grid) -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3" in:fade>
			<!-- Categoría A -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase"
						>Categoría A (Alta Rotación)</span
					>
					<div class="mt-1 flex items-end gap-3">
						<h4 class="text-3xl font-black tracking-tighter text-light-black">
							{data.analisis_abc.A.productos} <span class="text-lg text-light-black/40">prod.</span>
						</h4>
						<span class="mb-1 text-sm font-bold text-emerald-600">
							({data.analisis_abc.A.porcentaje_ventas}%)
						</span>
					</div>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Aportación en ventas globales
					</div>
				</div>
			</div>

			<!-- Categoría B -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Categoría B (Rotación Media)</span
					>
					<div class="mt-1 flex items-end gap-3">
						<h4 class="text-3xl font-black tracking-tighter text-light-black">
							{data.analisis_abc.B.productos} <span class="text-lg text-light-black/40">prod.</span>
						</h4>
						<span class="mb-1 text-sm font-bold text-blue-600">
							({data.analisis_abc.B.porcentaje_ventas}%)
						</span>
					</div>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Aportación en ventas globales
					</div>
				</div>
			</div>

			<!-- Categoría C -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-orange-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-orange-600 uppercase"
						>Categoría C (Baja Rotación)</span
					>
					<div class="mt-1 flex items-end gap-3">
						<h4 class="text-3xl font-black tracking-tighter text-light-black">
							{data.analisis_abc.C.productos} <span class="text-lg text-light-black/40">prod.</span>
						</h4>
						<span class="mb-1 text-sm font-bold text-orange-600">
							({data.analisis_abc.C.porcentaje_ventas}%)
						</span>
					</div>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Aportación en ventas globales
					</div>
				</div>
			</div>
		</div>

		<!-- Tops / Bottoms / No Movement Tables -->
		<div class="flex flex-col gap-8 xl:flex-row">
			<!-- Más Vendidos -->
			<div
				class="flex w-full flex-col gap-4 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm xl:w-1/3"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
							<TredingUpIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Más Vendidos
						</h3>
					</div>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-2 py-3">Producto</th>
								<th class="px-2 py-3 text-center">Cant.</th>
								<th class="px-2 py-3 text-right">Ingresos</th>
								<th class="px-2 py-3 text-right">Margen</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedMasVendidos.length > 0}
								{#each paginatedMasVendidos as item, i (i)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-2 py-3 text-xs font-bold text-light-black">{item.producto}</td>
										<td class="px-2 py-3 text-center text-xs font-black text-emerald-600"
											>{item.cantidad_vendida}</td
										>
										<td class="px-2 py-3 text-right text-xs font-black text-light-black"
											>{formatCurrency(item.ingresos)}</td
										>
										<td class="px-2 py-3 text-right text-xs">
											<div class="flex flex-col gap-0.5">
												<span
													class="font-black {item.margen && item.margen > 0
														? 'text-emerald-600'
														: 'text-light-black/50'}"
												>
													{item.margen !== undefined ? formatCurrency(item.margen) : '-'}
												</span>
												{#if item.margen_porcentaje !== undefined}
													<span class="text-[9px] font-bold text-light-black/40"
														>{item.margen_porcentaje.toFixed(2)}%</span
													>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="4" class="py-8 text-center text-xs text-light-black/40 italic"
										>Sin resultados</td
									>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Más Vendidos -->
				{#if totalPagesMas > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-[10px] font-bold text-light-black/40"
							>Pág {pageMas} / {totalPagesMas}</span
						>
						<div class="flex gap-1">
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageMas > 1 && pageMas--}
								disabled={pageMas === 1}><ChevronLeftIcon class="size-4" /></Button
							>
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageMas < totalPagesMas && pageMas++}
								disabled={pageMas === totalPagesMas}><ChevronRightIcon class="size-4" /></Button
							>
						</div>
					</div>
				{/if}
			</div>

			<!-- Menos Vendidos -->
			<div
				class="flex w-full flex-col gap-4 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm xl:w-1/3"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-orange-50 p-2 text-orange-600">
							<TrendingDownIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Menos Vendidos
						</h3>
					</div>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-2 py-3">Producto</th>
								<th class="px-2 py-3 text-center">Cant.</th>
								<th class="px-2 py-3 text-right">Ingresos</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedMenosVendidos.length > 0}
								{#each paginatedMenosVendidos as item, i (i)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-2 py-3 text-xs font-bold text-light-black">{item.producto}</td>
										<td class="px-2 py-3 text-center text-xs font-black text-orange-600"
											>{item.cantidad_vendida}</td
										>
										<td class="px-2 py-3 text-right text-xs font-black text-light-black"
											>{formatCurrency(item.ingresos)}</td
										>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="3" class="py-8 text-center text-xs text-light-black/40 italic"
										>Sin resultados</td
									>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Menos Vendidos -->
				{#if totalPagesMenos > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-[10px] font-bold text-light-black/40"
							>Pág {pageMenos} / {totalPagesMenos}</span
						>
						<div class="flex gap-1">
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageMenos > 1 && pageMenos--}
								disabled={pageMenos === 1}><ChevronLeftIcon class="size-4" /></Button
							>
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageMenos < totalPagesMenos && pageMenos++}
								disabled={pageMenos === totalPagesMenos}><ChevronRightIcon class="size-4" /></Button
							>
						</div>
					</div>
				{/if}
			</div>

			<!-- Sin Movimiento -->
			<div
				class="flex w-full flex-col gap-4 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm xl:w-1/3"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-red-50 p-2 text-red-600">
							<BoxIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Sin Movimiento
						</h3>
					</div>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-2 py-3">Producto / SKU</th>
								<th class="px-2 py-3 text-center">Estado</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedSinMovimiento.length > 0}
								{#each paginatedSinMovimiento as item (item.id)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-2 py-3 text-xs font-bold text-light-black">{item.producto}</td>
										<td class="px-2 py-3 text-center">
											<span
												class="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-red-600 uppercase"
												>Sin Rotación</span
											>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="2" class="py-8 text-center text-xs text-light-black/40 italic"
										>Todos los productos rotaron</td
									>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Sin Movimiento -->
				{#if totalPagesSin > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-[10px] font-bold text-light-black/40"
							>Pág {pageSin} / {totalPagesSin}</span
						>
						<div class="flex gap-1">
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageSin > 1 && pageSin--}
								disabled={pageSin === 1}><ChevronLeftIcon class="size-4" /></Button
							>
							<Button
								variant="outline"
								size="sm"
								onclick={() => pageSin < totalPagesSin && pageSin++}
								disabled={pageSin === totalPagesSin}><ChevronRightIcon class="size-4" /></Button
							>
						</div>
					</div>
				{/if}
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
				Cargando Reporte de Productos...
			</p>
		</div>
	{/if}
</div>
