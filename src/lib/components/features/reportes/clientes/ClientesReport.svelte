<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		ClientesReportData,
		ClientesReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { generateClientesPdf } from '$lib/utils/pdf/clientes.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<ClientesReportData | null>(null);

	let filters = $state<ClientesReportFilters>({
		desde: '',
		hasta: '',
		tipo_cliente: ''
	});

	// Pagination variables for Top Clientes
	const perPage = 15;
	let currentPage = $state(1);

	let paginatedTopClientes = $derived(
		data ? data.top_clientes.slice((currentPage - 1) * perPage, currentPage * perPage) : []
	);

	let totalPages = $derived(data ? Math.ceil(data.top_clientes.length / perPage) : 0);

	async function loadData() {
		try {
			loading = true;
			currentPage = 1;
			data = await reporteService.getClientesReport(filters);
		} catch (error) {
			console.error('Error loading clientes report:', error);
			alert('error', 'No se pudo cargar el reporte de clientes');
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
			await generateClientesPdf(data, filters);
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
		bind:tipo_cliente={filters.tipo_cliente}
		showClientType
		showDateRange
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" in:fade>
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Total Activos</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.total_clientes_activos}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						En cartera total
					</div>
				</div>
			</div>

			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase"
						>Nuevos vs Recurrentes</span
					>
					<div class="mt-1 flex items-end justify-between">
						<div class="flex flex-col">
							<span class="text-[10px] font-black text-light-black/40 uppercase">Nuevos</span>
							<h4 class="text-xl font-black text-emerald-600">
								+{data.resumen.clientes_nuevos_periodo}
							</h4>
						</div>
						<div class="flex flex-col text-right">
							<span class="text-[10px] font-black text-light-black/40 uppercase">Recurrentes</span>
							<h4 class="text-xl font-black text-light-black">
								{data.resumen.clientes_recurrentes}
							</h4>
						</div>
					</div>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Actividad en el periodo
					</div>
				</div>
			</div>

			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-purple-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-purple-600 uppercase"
						>Mayoristas</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.clientes_mayoristas}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Clientes tipo MAY
					</div>
				</div>
			</div>

			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-orange-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-orange-600 uppercase"
						>Minoristas</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.clientes_minoristas}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Clientes tipo MIN
					</div>
				</div>
			</div>
		</div>

		<!-- Main Areas -->
		<div class="flex flex-col gap-8 xl:flex-row">
			<!-- Top Clientes Table -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm xl:w-2/3"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
						<UsersIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">Top Clientes</h3>
				</div>

				<div class="min-h-[400px] overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-4 py-4">Cliente</th>
								<th class="px-4 py-4 text-center">Tipo</th>
								<th class="px-4 py-4 text-right">Compras</th>
								<th class="px-4 py-4 text-right">Valor Puntos</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedTopClientes.length > 0}
								{#each paginatedTopClientes as cliente, index (index)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-4 py-4">
											<div class="flex flex-col gap-0.5">
												<span class="font-bold text-light-black">{cliente.cliente}</span>
												<span class="text-[10px] font-medium text-light-black/40"
													>CI/NIT: {cliente.ci}</span
												>
											</div>
										</td>
										<td class="px-4 py-4 text-center">
											<span
												class="inline-flex rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase {cliente.tipo ===
												'MAY'
													? 'bg-purple-50 text-purple-600'
													: 'bg-orange-50 text-orange-600'}"
											>
												{cliente.tipo}
											</span>
										</td>
										<td class="px-4 py-4 text-right">
											<div class="flex flex-col gap-0.5">
												<span class="font-black text-emerald-600"
													>{formatCurrency(cliente.total_compras)}</span
												>
												<span class="text-[10px] font-bold text-light-black/40 uppercase"
													>{cliente.cantidad_ventas} Trx.</span
												>
											</div>
										</td>
										<td class="px-4 py-4 text-right text-xs font-black text-blue-600">
											{cliente.puntos} pts
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td
										colspan="4"
										class="py-8 text-center text-sm font-medium text-light-black/40 italic"
									>
										No hay clientes que mostrar
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination Controls -->
				{#if totalPages > 1}
					<div class="flex items-center justify-between border-t border-light-four pt-4">
						<span class="text-xs font-bold text-light-black/40">
							Página {currentPage} de {totalPages}
						</span>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentPage > 1 && currentPage--}
								disabled={currentPage === 1}
							>
								<ChevronLeftIcon class="size-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => currentPage < totalPages && currentPage++}
								disabled={currentPage === totalPages}
							>
								<ChevronRightIcon class="size-4" />
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Ventas por Zona -->
			<!-- <div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm xl:w-1/3"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-pink-50 p-2 text-pink-600">
						<MapPinIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Ventas por Zona Geográfica
					</h3>
				</div>

				<div class="flex h-full flex-col gap-3 overflow-y-auto">
					{#if data.por_zona.length > 0}
						{#each data.por_zona as zona, index (index)}
							<div
								class="flex items-center justify-between rounded-2xl border border-light-four p-4 transition-all hover:border-pink-200 hover:bg-pink-50/10"
							>
								<div class="flex flex-col gap-0.5">
									<span class="text-sm font-bold text-light-black">{zona.zona}</span>
									<span class="text-[10px] font-bold text-light-black/40 uppercase"
										>{zona.cantidad} Órdenes</span
									>
								</div>
								<span class="text-sm font-black text-emerald-600"
									>{formatCurrency(zona.total_ventas)}</span
								>
							</div>
						{/each}
					{:else}
						<div
							class="flex h-full items-center justify-center py-8 text-center text-sm font-medium text-light-black/40 italic"
						>
							No hay datos por zona
						</div>
					{/if}
				</div>
			</div> -->
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
				Cargando Reporte de Clientes...
			</p>
		</div>
	{/if}
</div>
