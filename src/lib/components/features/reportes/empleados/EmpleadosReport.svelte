<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		EmpleadosReportData,
		EmpleadosReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { BoltIcon, CoinIcon } from '$lib/icons/solid';
	import { generateEmpleadosPdf } from '$lib/utils/pdf/empleados.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<EmpleadosReportData | null>(null);

	let filters = $state<EmpleadosReportFilters>({
		desde: '',
		hasta: '',
		id_sucursal: ''
	});

	// Pagination parameters
	const perPage = 10;
	let currentVentasPage = $state(1);
	let currentProdPage = $state(1);

	let paginatedVentas = $derived(
		data
			? data.rendimiento_ventas.slice(
					(currentVentasPage - 1) * perPage,
					currentVentasPage * perPage
				)
			: []
	);
	let totalVentasPages = $derived(data ? Math.ceil(data.rendimiento_ventas.length / perPage) : 0);

	let paginatedProductividad = $derived(
		data ? data.productividad.slice((currentProdPage - 1) * perPage, currentProdPage * perPage) : []
	);
	let totalProdPages = $derived(data ? Math.ceil(data.productividad.length / perPage) : 0);

	async function loadData() {
		try {
			loading = true;
			currentVentasPage = 1;
			currentProdPage = 1;
			data = await reporteService.getEmpleadosReport(filters);
		} catch (error) {
			console.error('Error loading empleados report:', error);
			alert('error', 'No se pudo cargar el reporte de empleados');
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
			await generateEmpleadosPdf(data, filters);
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
		showDateRange
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3" in:fade>
			<!-- Empleados Activos -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Empleados Activos</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.total_empleados_activos}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Plantilla actual
					</div>
				</div>
			</div>

			<!-- Costo Nómina Mensual -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-orange-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-orange-600 uppercase"
						>Costo de Nómina</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.costo_nomina_mensual)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Gasto total en salarios
					</div>
				</div>
			</div>

			<!-- Promedio Salario -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase"
						>Salario Promedio</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{formatCurrency(data.resumen.promedio_salario)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Promedio por empleado
					</div>
				</div>
			</div>
		</div>

		<!-- Reporting Tables -->
		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- Rendimiento de Ventas -->
			<div
				class="flex w-full flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:w-1/2"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
						<CoinIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Rendimiento en Ventas
					</h3>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-2 py-4">Empleado</th>
								<th class="px-2 py-4 text-center">Cant.</th>
								<th class="px-2 py-4 text-right">Ticket Prom.</th>
								<th class="px-2 py-4 text-right">Ventas Totales</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedVentas.length > 0}
								{#each paginatedVentas as item, i (i)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-2 py-4">
											<div class="flex flex-col gap-0.5">
												<span class="text-xs font-bold text-light-black">{item.empleado}</span>
												<span class="text-[9px] font-black text-light-black/40 uppercase"
													>{item.cargo}</span
												>
											</div>
										</td>
										<td class="px-2 py-4 text-center text-xs font-black text-emerald-600">
											{item.cantidad_ventas}
										</td>
										<td class="px-2 py-4 text-right">
											<span class="text-xs font-black text-light-black/50"
												>{formatCurrency(item.ticket_promedio)}</span
											>
										</td>
										<td class="px-2 py-4 text-right">
											<span class="text-xs font-black text-emerald-600"
												>{formatCurrency(item.ventas_total)}</span
											>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td
										colspan="4"
										class="py-8 text-center text-xs font-medium text-light-black/40 italic"
									>
										Sin resultados
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Ventas -->
				{#if totalVentasPages > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-[10px] font-bold text-light-black/40 uppercase">
							Pág {currentVentasPage} / {totalVentasPages}
						</span>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentVentasPage > 1 && currentVentasPage--}
								disabled={currentVentasPage === 1}
							>
								<ChevronLeftIcon class="size-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentVentasPage < totalVentasPages && currentVentasPage++}
								disabled={currentVentasPage === totalVentasPages}
							>
								<ChevronRightIcon class="size-4" />
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Productividad -->
			<div
				class="flex w-full flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:w-1/2"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2 text-purple-600">
						<BoltIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Productividad Operativa
					</h3>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-2 py-4">Empleado</th>
								<th class="px-2 py-4 text-center">Sesiones</th>
								<th class="px-2 py-4 text-center">Horas</th>
								<th class="px-2 py-4 text-right">Venta/Hora</th>
								<th class="px-2 py-4 text-right">Venta/Sesión</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedProductividad.length > 0}
								{#each paginatedProductividad as item, i (i)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-2 py-4 text-xs font-bold text-light-black">
											{item.empleado}
										</td>
										<td class="px-2 py-4 text-center text-xs font-black text-purple-600">
											{item.sesiones_trabajadas}
										</td>
										<td class="px-2 py-4 text-center text-xs font-black text-light-black/50">
											{item.horas_trabajadas.toFixed(2)} hrs
										</td>
										<td class="px-2 py-4 text-right text-xs font-black text-light-black">
											{formatCurrency(item.ventas_por_hora)}
										</td>
										<td class="px-2 py-4 text-right text-xs font-black text-emerald-600">
											{formatCurrency(item.ventas_por_sesion)}
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td
										colspan="5"
										class="py-8 text-center text-xs font-medium text-light-black/40 italic"
									>
										Sin resultados
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Productividad -->
				{#if totalProdPages > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-[10px] font-bold text-light-black/40 uppercase">
							Pág {currentProdPage} / {totalProdPages}
						</span>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentProdPage > 1 && currentProdPage--}
								disabled={currentProdPage === 1}
							>
								<ChevronLeftIcon class="size-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentProdPage < totalProdPages && currentProdPage++}
								disabled={currentProdPage === totalProdPages}
							>
								<ChevronRightIcon class="size-4" />
							</Button>
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
				Cargando Reporte de Empleados...
			</p>
		</div>
	{/if}
</div>
