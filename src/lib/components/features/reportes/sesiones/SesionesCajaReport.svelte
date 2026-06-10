<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type {
		SesionesCajaReportData,
		SesionesCajaReportFilters
	} from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { UsersIcon, ListIcon, AlertTriangleIcon } from '$lib/icons/outline';
	import { alert, formatDate } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { generateSesionesPdf } from '$lib/utils/pdf/sesiones.pdf';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<SesionesCajaReportData | null>(null);

	let filters = $state<SesionesCajaReportFilters>({
		desde: '',
		hasta: '',
		id_sucursal: '',
		id_empleado: ''
	});

	// Pagination variables
	let perPage = 10;
	let currentPage = $state(1);

	let paginatedSessions = $derived(
		data ? data.detalle_sesiones.slice((currentPage - 1) * perPage, currentPage * perPage) : []
	);

	let totalPages = $derived(data ? Math.ceil(data.detalle_sesiones.length / perPage) : 0);

	function nextPage() {
		if (currentPage < totalPages) currentPage++;
	}

	function prevPage() {
		if (currentPage > 1) currentPage--;
	}

	async function loadData() {
		try {
			loading = true;
			currentPage = 1;
			data = await reporteService.getSesionesCajaReport(filters);
		} catch (error) {
			console.error('Error loading sesiones-caja report:', error);
			alert('error', 'No se pudo cargar el reporte de sesiones de caja');
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

	function formatHours(hours: number | null) {
		if (hours === null || hours === undefined) return 'N/A';
		return `${hours.toFixed(2)} hrs`;
	}

	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateSesionesPdf(data, filters);
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
		bind:id_empleado={filters.id_empleado}
		showEmployee
		showDateRange
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
	/>

	{#if data}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" in:fade>
			<!-- Total Sesiones -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-blue-600 uppercase"
						>Aperturas de Caja</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.total_sesiones}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Sesiones en el periodo
					</div>
				</div>
			</div>

			<!-- Sesiones con Diferencia -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full {data.resumen
						.sesiones_con_diferencia > 0
						? 'bg-orange-500/5'
						: 'bg-emerald-500/5'}"
				></div>
				<div class="flex flex-col gap-1">
					<span
						class="text-[10px] font-black tracking-widest {data.resumen.sesiones_con_diferencia > 0
							? 'text-orange-600'
							: 'text-emerald-600'} uppercase">Cierres con Diferencia</span
					>
					<h4
						class="text-3xl font-black tracking-tighter {data.resumen.sesiones_con_diferencia > 0
							? 'text-orange-600'
							: 'text-emerald-600'}"
					>
						{data.resumen.sesiones_con_diferencia}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Requieren comprobación
					</div>
				</div>
			</div>

			<!-- Diferencia Acumulada -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full {data.resumen
						.diferencia_total_acumulada < 0
						? 'bg-red-500/5'
						: data.resumen.diferencia_total_acumulada > 0
							? 'bg-yellow-500/5'
							: 'bg-emerald-500/5'}"
				></div>
				<div class="flex flex-col gap-1">
					<span
						class="text-[10px] font-black tracking-widest {data.resumen.diferencia_total_acumulada <
						0
							? 'text-red-500'
							: data.resumen.diferencia_total_acumulada > 0
								? 'text-yellow-600'
								: 'text-emerald-600'} uppercase">Diferencia Acumulada</span
					>
					<h4
						class="text-3xl font-black tracking-tighter {data.resumen.diferencia_total_acumulada < 0
							? 'text-red-600'
							: data.resumen.diferencia_total_acumulada > 0
								? 'text-yellow-600'
								: 'text-emerald-600'}"
					>
						{formatCurrency(data.resumen.diferencia_total_acumulada)}
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Balance de desvíos
					</div>
				</div>
			</div>

			<!-- Promedio Duración -->
			<div
				class="relative overflow-hidden rounded-3xl border border-light-four bg-light-one p-6 shadow-sm"
			>
				<div class="absolute -top-4 -right-4 size-24 rounded-full bg-purple-500/5"></div>
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-black tracking-widest text-purple-600 uppercase"
						>Tiempo Promedio</span
					>
					<h4 class="text-3xl font-black tracking-tighter text-light-black">
						{data.resumen.promedio_duracion_horas.toFixed(1)}
						<span class="text-lg text-light-black/40">hrs</span>
					</h4>
					<div class="mt-2 text-[10px] font-bold text-light-black/40 uppercase">
						Duración por sesión
					</div>
				</div>
			</div>
		</div>

		<!-- Main Views -->
		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- Rendimiento de Cajeros -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:w-1/3"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-pink-50 p-2 text-pink-600">
						<UsersIcon class="size-5" />
					</div>
					<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
						Resumen por Empleado
					</h3>
				</div>
				<div class="flex max-h-[600px] flex-col gap-4 overflow-y-auto pr-2">
					{#each data.por_empleado as empleado, idx (idx)}
						<div
							class="flex flex-col gap-2 rounded-2xl border border-light-four p-4 transition-all hover:border-pink-200 hover:bg-pink-50/10"
						>
							<div class="flex items-center justify-between">
								<span class="font-bold text-light-black">{empleado.empleado}</span>
								<span
									class="rounded-full bg-light-two px-2 py-0.5 text-[10px] font-black text-light-black/50 uppercase"
								>
									{empleado.sesiones} Sesiones
								</span>
							</div>
							<div class="mt-2 flex items-center justify-between text-xs">
								<span class="font-bold text-light-black/40">Ventas Registradas</span>
								<span class="font-black text-emerald-600"
									>{formatCurrency(empleado.total_ventas)}</span
								>
							</div>
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-light-black/40">Diferencia Histórica</span>
								<span
									class="font-black {empleado.diferencia_acumulada < 0
										? 'text-red-500'
										: empleado.diferencia_acumulada > 0
											? 'text-yellow-600'
											: 'text-emerald-500'}"
								>
									{formatCurrency(empleado.diferencia_acumulada)}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Detalle de Sesiones -->
			<div
				class="flex flex-col gap-6 rounded-3xl border border-light-four bg-light-one p-6 shadow-sm lg:w-2/3"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-blue-50 p-2 text-blue-600">
							<ListIcon class="size-5" />
						</div>
						<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
							Historial de Sesiones
						</h3>
					</div>
					<span
						class="rounded-full bg-light-two px-3 py-1 text-[10px] font-black tracking-widest text-light-black/40 uppercase"
					>
						{data.detalle_sesiones.length} Registros
					</span>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead
							class="border-b border-light-four text-[10px] font-black tracking-widest text-light-black/40 uppercase"
						>
							<tr>
								<th class="px-4 py-4">Fecha AP/CI</th>
								<th class="px-4 py-4">Empleado / Sucursal</th>
								<th class="px-4 py-4 text-center">Estado</th>
								<th class="px-4 py-4 text-right">Montos Caja</th>
								<th class="px-4 py-4 text-right">Ventas</th>
								<th class="px-4 py-4 text-right">Diferencia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#if paginatedSessions.length > 0}
								{#each paginatedSessions as sesion (sesion.id)}
									<tr class="group transition-all hover:bg-light-one_d">
										<td class="px-4 py-4">
											<div class="flex flex-col gap-0.5">
												<span class="font-bold text-light-black">{formatDate(sesion.fecha)}</span>
												<span class="text-[10px] font-medium text-light-black/40"
													>{formatDate(sesion.fecha)}</span
												>
												<span
													class="mt-1 text-[9px] font-black tracking-wider text-light-black/30 uppercase"
													>DURACIÓN: {formatHours(sesion.duracion_horas)}</span
												>
											</div>
										</td>
										<td class="px-4 py-4">
											<div class="flex flex-col gap-0.5">
												<span class="font-bold text-light-black">{sesion.empleado}</span>
												<span class="text-xs text-light-black/40">{sesion.sucursal}</span>
											</div>
										</td>
										<td class="px-4 py-4 text-center">
											{#if sesion.estado === 'ABIERTA'}
												<span
													class="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black tracking-widest text-emerald-600 uppercase"
												>
													Abierta
												</span>
											{:else}
												<span
													class="inline-flex rounded-full bg-light-four/50 px-2 py-1 text-[10px] font-black tracking-widest text-light-black/40 uppercase"
												>
													Cerrada
												</span>
											{/if}
										</td>
										<td class="px-4 py-4 text-xs">
											<div class="ml-auto flex w-32 flex-col gap-1">
												<div class="flex items-center justify-between gap-2">
													<span
														class="text-[9px] font-bold tracking-widest text-light-black/40 uppercase"
														>Apertura</span
													>
													<span class="font-black text-light-black"
														>{formatCurrency(sesion.monto_apertura)}</span
													>
												</div>
												<div
													class="flex items-center justify-between gap-2 border-y border-dashed border-light-four/50 py-1"
												>
													<span
														class="text-[9px] font-bold tracking-widest text-light-black/40 uppercase"
														>Teórico</span
													>
													<span class="font-black text-light-black"
														>{formatCurrency(sesion.monto_teorico)}</span
													>
												</div>
												<div class="flex items-center justify-between gap-2">
													<span
														class="text-[9px] font-bold tracking-widest text-light-black/40 uppercase"
														>Cierre</span
													>
													{#if sesion.estado === 'ABIERTA'}
														<span class="text-[9px] font-medium text-light-black/40 italic">-</span>
													{:else}
														<span class="font-black text-light-black"
															>{formatCurrency(sesion.monto_cierre)}</span
														>
													{/if}
												</div>
											</div>
										</td>
										<td class="px-4 py-4 text-right">
											<div class="flex flex-col gap-0.5">
												<span class="font-black text-emerald-600"
													>{formatCurrency(sesion.total_ventas)}</span
												>
												<span class="text-[10px] font-bold text-light-black/40 uppercase"
													>{sesion.cantidad_ventas} Trx.</span
												>
											</div>
										</td>
										<td class="px-4 py-4 text-right">
											{#if sesion.estado === 'ABIERTA'}
												<span class="text-xs font-medium text-light-black/30 italic"
													>En progreso...</span
												>
											{:else}
												<div class="flex flex-col gap-0.5">
													<span
														class="font-black {sesion.diferencia === null
															? 'text-light-black/30'
															: sesion.diferencia! < 0
																? 'text-red-500'
																: sesion.diferencia! > 0
																	? 'text-yellow-600'
																	: 'text-light-black'}"
													>
														{sesion.diferencia !== null ? formatCurrency(sesion.diferencia) : '-'}
													</span>
													{#if sesion.diferencia !== null && sesion.diferencia !== 0}
														<span
															class="flex items-center justify-end gap-1 text-[9px] font-black uppercase {sesion.diferencia <
															0
																? 'text-red-500/50'
																: 'text-yellow-600/60'}"
														>
															<AlertTriangleIcon class="size-3" />
															{sesion.diferencia < 0 ? 'Faltante en Caja' : 'Sobrante en Caja'}
														</span>
													{:else if sesion.diferencia === 0}
														<span
															class="text-[9px] font-black tracking-widest text-emerald-600/60 uppercase"
															>Cuadre Perfecto</span
														>
													{/if}
												</div>
											{/if}
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td
										colspan="6"
										class="px-4 py-8 text-center text-sm font-medium text-light-black/40 italic"
									>
										No hay sesiones registradas en este periodo
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
							<Button variant="outline" size="sm" onclick={prevPage} disabled={currentPage === 1}>
								Anterior
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={nextPage}
								disabled={currentPage === totalPages}
							>
								Siguiente
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
				Cargando Reporte de Sesiones...
			</p>
		</div>
	{/if}
</div>
