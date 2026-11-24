<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		InventarioReportData,
		InventarioReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import {
		AlertTriangleIcon,
		StopwatchIcon,
		ListIcon,
		ChevronLeftIcon,
		ChevronRightIcon
	} from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { generateInventarioPdf } from '$lib/utils/pdf/inventario.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<InventarioReportData | null>(null);

	let filters = $state<InventarioReportFilters>({
		id_sucursal: '',
		id_categoria: ''
	});

	// Pagination States
	let pageCategory = $state(1);
	let pageCritical = $state(1);
	let pageExpiring = $state(1);
	const itemsPerPage = 20;

	async function loadData() {
		try {
			loading = true;
			data = await reporteService.getInventarioReport(filters);
			// Reset pagination when loading new data
			pageCategory = 1;
			pageCritical = 1;
			pageExpiring = 1;
		} catch (error) {
			console.error('Error loading inventory report:', error);
			alert('error', 'No se pudo cargar el reporte de inventario');
		} finally {
			loading = false;
		}
	}

	onMount(loadData);

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
	}

	// Pagination Helper
	function paginate<T>(items: T[], page: number): T[] {
		if (!items) return [];
		const start = (page - 1) * itemsPerPage;
		return items.slice(start, start + itemsPerPage);
	}

	// Derived paginated data
	let paginatedCategories = $derived(data ? paginate(data.por_categoria, pageCategory) : []);
	let paginatedCritical = $derived(data ? paginate(data.stock_critico, pageCritical) : []);
	let paginatedExpiring = $derived(data ? paginate(data.proximos_vencimientos, pageExpiring) : []);

	let totalPagesCategory = $derived(data ? Math.ceil(data.por_categoria.length / itemsPerPage) : 0);
	let totalPagesCritical = $derived(data ? Math.ceil(data.stock_critico.length / itemsPerPage) : 0);
	let totalPagesExpiring = $derived(
		data ? Math.ceil(data.proximos_vencimientos.length / itemsPerPage) : 0
	);
	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateInventarioPdf(data, filters);
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
		bind:id_sucursal={filters.id_sucursal}
		bind:id_categoria={filters.id_categoria}
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
		showCategory
		showDateRange={false}
		desde=""
		hasta=""
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-6" in:fade>
			<!-- Total Productos -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-blue-600"
						>Productos Activos</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-light-black">
						{data.resumen.total_productos_activos.toLocaleString()}
					</h4>
					<div class="mt-2 text-xs font-bold text-light-black/40">En Catálogo</div>
				</div>
			</div>

			<!-- Valorización Costo -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-emerald-600"
						>Inversión (Costo)</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-light-black">
						{formatCurrency(data.resumen.valor_total_costo)}
					</h4>
					<div class="mt-2 text-xs font-bold text-light-black/40">A precio costo</div>
				</div>
			</div>

			<!-- Valorización Venta -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-emerald-600"
						>Valor Venta</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-light-black">
						{formatCurrency(data.resumen.valor_total_venta)}
					</h4>
					<div class="mt-2 text-xs font-bold text-light-black/40">A precio venta</div>
				</div>
			</div>

			<!-- Margen Bruto -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-emerald-600"
						>Margen Bruto</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-light-black">
						{formatCurrency(data.resumen.margen_bruto_potencial)}
					</h4>
					<div class="mt-2 text-xs font-bold text-emerald-600">
						Rentabilidad: {data.resumen.porcentaje_margen}%
					</div>
				</div>
			</div>

			<!-- Stock Crítico -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-orange-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-orange-600"
						>Stock Crítico</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-orange-600">
						{data.resumen.productos_stock_critico}
					</h4>
					<div class="mt-2 text-xs font-bold text-orange-600/60">
						{data.resumen.productos_sin_stock} Agotados
					</div>
				</div>
			</div>

			<!-- Vencimientos -->
			<div
				class="relative overflow-hidden rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-red-600"
						>Vencen (30 días)</span
					>
					<h4 class="text-2xl font-semibold tracking-tighter text-red-600">
						{data.resumen.lotes_por_vencer_30dias}
					</h4>
					<div class="mt-2 text-xs font-bold text-red-600/60">Lotes en Riesgo</div>
				</div>
			</div>
		</div>

		<!-- Main Sections -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2" in:fade>
			<!-- Category Table -->
			<div
				class="flex flex-col gap-6 rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-blue-50 p-2 text-blue-600">
							<ListIcon class="size-5" />
						</div>
						<h3 class="text-sm font-semibold tracking-tight text-light-black">
							Valorización por Categoría
						</h3>
					</div>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-xs font-semibold text-light-black/40"
						>
							<tr>
								<th class="px-4 py-4">Categoría</th>
								<th class="px-4 py-4 text-center">Items</th>
								<th class="px-4 py-4 text-right">Inversión (Costo)</th>
								<th class="px-4 py-4 text-right">Puntaje Venta</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each paginatedCategories as cat (cat.categoria)}
								<tr class="group transition-all hover:bg-light-one_d">
									<td class="px-4 py-4 text-xs font-bold text-light-black"
										>{cat.categoria}</td
									>
									<td class="px-4 py-4 text-center">
										<span
											class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
										>
											{cat.productos}
										</span>
									</td>
									<td class="px-4 py-4 text-right font-semibold text-light-black">
										{formatCurrency(cat.valor_costo)}
									</td>
									<td class="px-4 py-4 text-right font-semibold text-emerald-600">
										{formatCurrency(cat.valor_venta)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if totalPagesCategory > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-xs font-bold text-light-black/40"
							>Pág. {pageCategory} de {totalPagesCategory}</span
						>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageCategory--}
								disabled={pageCategory === 1}
							>
								{#snippet leftIcon()}<ChevronLeftIcon class="size-4" />{/snippet}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageCategory++}
								disabled={pageCategory === totalPagesCategory}
							>
								{#snippet leftIcon()}<ChevronRightIcon class="size-4" />{/snippet}
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Critical Stock Table -->
			<div
				class="flex flex-col gap-6 rounded-xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-orange-50 p-2 text-orange-600">
						<AlertTriangleIcon class="size-5" />
					</div>
					<h3 class="text-sm font-semibold tracking-tight text-light-black">
						Alerta de Stock Crítico
					</h3>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-xs font-semibold text-light-black/40"
						>
							<tr>
								<th class="px-4 py-4">Producto</th>
								<th class="px-4 py-4 text-center">Actual</th>
								<th class="px-4 py-4 text-center">Mín</th>
								<th class="px-4 py-4 text-right">Déficit</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each paginatedCritical as item (item.producto)}
								<tr class="group transition-all hover:bg-light-one_d">
									<td class="px-4 py-4 text-xs font-bold text-light-black"
										>{item.producto}</td
									>
									<td class="px-4 py-4 text-center font-semibold text-orange-600"
										>{item.stock_actual}</td
									>
									<td class="px-4 py-4 text-center text-light-black/40">{item.stock_minimo}</td>
									<td class="px-4 py-4 text-right font-semibold text-red-600">-{item.deficit}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if totalPagesCritical > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-xs font-bold text-light-black/40"
							>Pág. {pageCritical} de {totalPagesCritical}</span
						>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageCritical--}
								disabled={pageCritical === 1}
							>
								{#snippet leftIcon()}<ChevronLeftIcon class="size-4" />{/snippet}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageCritical++}
								disabled={pageCritical === totalPagesCritical}
							>
								{#snippet leftIcon()}<ChevronRightIcon class="size-4" />{/snippet}
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Upcoming Expirations -->
			<div
				class="flex flex-col gap-6 rounded-xl border border-light-four bg-light-one p-6 shadow-sm lg:col-span-2"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-red-50 p-2 text-red-600">
						<StopwatchIcon class="size-5" />
					</div>
					<h3 class="text-sm font-semibold tracking-tight text-light-black">
						Próximos Vencimientos (Lotes)
					</h3>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-xs font-semibold text-light-black/40"
						>
							<tr>
								<th class="px-4 py-4">Producto</th>
								<th class="px-4 py-4">Lote</th>
								<th class="px-4 py-4">Vencimiento</th>
								<th class="px-4 py-4 text-right">Estatus</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each paginatedExpiring as lote (lote.lote)}
								<tr class="group transition-all hover:bg-light-one_d">
									<td class="px-4 py-4 text-xs font-bold text-light-black"
										>{lote.producto}</td
									>
									<td class="px-4 py-4 tabular-nums text-xs text-light-black/40">{lote.lote}</td>
									<td class="px-4 py-4 font-semibold text-light-black">{lote.fecha_vencimiento}</td>
									<td class="px-4 py-4 text-right">
										<span
											class="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
										>
											Riesgo Alto
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if totalPagesExpiring > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-xs font-bold text-light-black/40"
							>Pág. {pageExpiring} de {totalPagesExpiring}</span
						>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageExpiring--}
								disabled={pageExpiring === 1}
							>
								{#snippet leftIcon()}<ChevronLeftIcon class="size-4" />{/snippet}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="h-8 w-8 p-0"
								onclick={() => pageExpiring++}
								disabled={pageExpiring === totalPagesExpiring}
							>
								{#snippet leftIcon()}<ChevronRightIcon class="size-4" />{/snippet}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else if loading}
		<div
			class="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-light-four bg-light-one"
		>
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
			></div>
			<p
				class="animate-pulse text-xs font-semibold text-light-black/40 italic"
			>
				Analizando Status de Inventario...
			</p>
		</div>
	{/if}
</div>
