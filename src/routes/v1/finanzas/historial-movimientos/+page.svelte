<script lang="ts">
	import { onMount } from 'svelte';
	import { movimientoService } from '$lib/services';
	import type {
		ReporteMovimientoFilters,
		Movimiento,
		EstadisticasMovimiento
	} from '$lib/interfaces';
	import { Heading, Input, Pagination } from '$lib/components/ui';
	import { ZoomIcon, FilterIcon } from '$lib/icons/outline';
	import {
		MovimientoStats,
		HistorialMovimientoTable,
		DateRangeModal
	} from '$lib/components/features/movimiento';
	import {
		MovimientoStatsSkeleton,
		HistorialMovimientoTableSkeleton
	} from '$lib/components/skeletons';
	import { alert } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { MainLayout } from '$lib/components/layout';

	// Helper for date formatting YYYY-MM-DD
	const formatDate = (date: Date) => {
		const d = new Date(date);
		return d.toISOString().split('T')[0];
	};

	// Date range options
	type DateShortcut = 'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizado';
	let activeShortcut = $state<DateShortcut>('hoy');
	let isDateModalOpen = $state(false);

	let filters = $state<ReporteMovimientoFilters>({
		page: 1,
		perPage: 15,
		startDate: formatDate(new Date()),
		endDate: formatDate(new Date()),
		search: ''
	});

	let customDates = $state({
		start: formatDate(new Date()),
		end: formatDate(new Date())
	});

	let movimientos = $state<Movimiento[]>([]);
	let stats = $state<EstadisticasMovimiento | null>(null);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);
	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(loadData);

	async function loadData() {
		isLoading = true;
		try {
			const data = await movimientoService.getReporteMovimientos(filters);
			movimientos = data.movimientos;
			stats = data.estadisticas;
			total = data.total;
			totalPages = data.totalPages;
		} catch (error) {
			console.error('Error loading report:', error);
			alert('error', 'No se pudo cargar el reporte de movimientos');
		} finally {
			isLoading = false;
		}
	}

	function setShortcut(shortcut: DateShortcut) {
		if (shortcut === 'personalizado') {
			isDateModalOpen = true;
			return;
		}

		activeShortcut = shortcut;
		const today = new Date();
		let start = new Date(today);
		let end = new Date(today);

		switch (shortcut) {
			case 'hoy': {
				start = today;
				end = today;
				break;
			}
			case 'ayer': {
				start.setDate(today.getDate() - 1);
				end = new Date(start);
				break;
			}
			case 'semana': {
				const day = today.getDay();
				const diff = today.getDate() - day + (day === 0 ? -6 : 1);
				start = new Date(today.setDate(diff));
				end = new Date();
				break;
			}
			case 'mes': {
				start = new Date(today.getFullYear(), today.getMonth(), 1);
				end = new Date();
				break;
			}
		}

		filters.startDate = formatDate(start);
		filters.endDate = formatDate(end);
		filters.page = 1;
		loadData();
	}

	function handleApplyCustomDates(start: string, end: string) {
		activeShortcut = 'personalizado';
		customDates.start = start;
		customDates.end = end;
		filters.startDate = start;
		filters.endDate = end;
		filters.page = 1;
		loadData();
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadData();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}
</script>

<MainLayout
	title="Historial de Movimientos"
	description="Historial de movimientos"
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Historial de Movimientos</Heading>
		</div>
	</div>

	{#if isLoading && !stats}
		<MovimientoStatsSkeleton />
	{:else if stats}
		<MovimientoStats {stats} />
	{/if}

	<div class="space-y-4">
		<div class="flex flex-col items-start gap-4 xl:flex-row xl:items-end">
			<div class="w-full flex-1">
				<div class="flex flex-wrap gap-2">
					{#each [{ id: 'hoy', label: 'Hoy' }, { id: 'ayer', label: 'Ayer' }, { id: 'semana', label: 'Esta Semana' }, { id: 'mes', label: 'Mes Actual' }, { id: 'personalizado', label: 'Personalizado' }] as shortcut (shortcut.id)}
						<button
							onclick={() => setShortcut(shortcut.id as DateShortcut)}
							class="rounded-xl border px-4 py-2 text-xs font-bold transition-all {activeShortcut ===
							shortcut.id
								? 'shadow-primary/20 border-light-four bg-light-two text-light-one shadow-md'
								: 'border-light-four bg-light-one text-light-two hover:border-light-four_d hover:text-light-two_d'}"
						>
							{shortcut.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="w-full xl:w-96">
				<Input
					id="search-historial"
					type="text"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por nombre, descripción..."
					icon={ZoomIcon}
				/>
			</div>
		</div>
	</div>

	{#if isLoading}
		<HistorialMovimientoTableSkeleton />
	{:else if movimientos.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6 text-light-three">
				<FilterIcon class="size-16" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron movimientos</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				No hay registros para este rango de fechas. Prueba con otros términos o filtros.
			</p>
		</div>
	{:else}
		<HistorialMovimientoTable {movimientos} />
	{/if}

	{#if !isLoading && movimientos.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<DateRangeModal
	bind:isOpen={isDateModalOpen}
	startDate={customDates.start}
	endDate={customDates.end}
	onApply={handleApplyCustomDates}
	onCancel={() => {}}
/>
