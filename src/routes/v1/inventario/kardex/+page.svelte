<script lang="ts">
	import { onMount } from 'svelte';
	import { kardexService } from '$lib/services';
	import { Pagination, Heading, Input, Select } from '$lib/components/ui';
	import { ZoomIcon } from '$lib/icons/outline';

	import { formatDate } from '$lib/utils';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import { MainLayout } from '$lib/components/layout';

	let movimientos = $state<any[]>([]);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);

	let filters = $state<any>({
		page: 1,
		perPage: 15,
		search: '',
		tipo_movimiento: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	const loadData = async () => {
		try {
			isLoading = true;
			const response = await kardexService.getKardexMovimientos(filters);
			movimientos = response.kardexMovimientos || [];
			total = response.total || 0;
			totalPages = response.totalPages || 1;
		} catch (error) {
			console.error('Error fetching kardex:', error);
		} finally {
			isLoading = false;
		}
	};

	onMount(loadData);

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

	function handleFilterChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		filters.tipo_movimiento = value;
		filters.page = 1;
		loadData();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}
</script>

<MainLayout
	title="Kardex de Movimientos"
	description="Historial de movimientos de productos."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Kardex de Movimientos</Heading>
		</div>
	</div>

	<!-- Stats Section -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div
			class="relative translate-y-0 overflow-hidden rounded-2xl border border-light-four bg-light-two p-6 text-light-black shadow-lg transition-transform duration-300 hover:-translate-y-1"
		>
			<div class="relative z-10">
				<div
					class="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-light-one uppercase"
				>
					Movimientos Totales
				</div>
				<div class="text-3xl font-black tracking-tight text-light-one">{total}</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-kardex"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por lote o producto..."
					icon={ZoomIcon}
				/>
			</div>

			<div class="w-full md:w-64">
				<Select
					id="estado-kardex"
					label="Tipo de Movimiento"
					value={filters.tipo_movimiento || ''}
					onchange={handleFilterChange}
				>
					<option value="">Todos los movimientos</option>
					<option value="INGRESO">Ingresos (+)</option>
					<!-- <option value="SALIDA">Salidas (-)</option> -->
					<option value="TRASLADO">Traslados</option>
					<option value="VENTA">Ventas</option>
				</Select>
			</div>
		</div>
	</div>

	{#if isLoading}
		<MovimientoTableSkeleton />
	{:else if movimientos.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<span class="text-4xl text-gray-300">📦</span>
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron movimientos</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no hay movimientos registrados en el kardex.'}
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-one_d font-bold">
					<tr>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Fecha
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Movimiento
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Producto / Lote
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Ubicación
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Cantidad
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Responsable
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each movimientos as mov (mov.id)}
						<tr
							class="border-b border-light-four text-light-black transition-colors hover:bg-light-one_d"
						>
							<td class="px-6 py-4 text-sm whitespace-nowrap">
								{formatDate(mov.createdAt)}
							</td>
							<td class="px-6 py-4 text-sm">
								<span
									class="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase
									{mov.tipo_movimiento === 'INGRESO'
										? 'border-green-200 bg-green-50 text-green-700'
										: mov.tipo_movimiento === 'TRASLADO'
											? 'border-blue-200 bg-blue-50 text-blue-700'
											: 'border-red-200 bg-red-50 text-red-700'}"
								>
									{mov.tipo_movimiento}
								</span>
							</td>
							<td class="px-6 py-4 text-sm font-medium">
								<div class="line-clamp-1 font-bold text-gray-700">
									{mov.lote?.producto?.nombre_comercial || 'Desconocido'}
								</div>
								<div
									class="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400"
								>
									{mov.lote?.codigo_lote || 'S/N'}
								</div>
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">
								{#if mov.tipo_movimiento === 'INGRESO'}
									<span class="text-xs">
										<span class="text-green-500">→ Destino:</span>
										<strong>{mov.ubicacion_destino?.nombre || 'General'}</strong>
									</span>
								{:else}
									<span class="text-xs">
										<span class="text-red-500">← Origen:</span>
										<strong>{mov.ubicacion_origen?.nombre || 'General'}</strong>
									</span>
								{/if}
							</td>
							<td
								class="px-6 py-4 text-sm font-bold {mov.tipo_movimiento === 'INGRESO'
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{mov.tipo_movimiento === 'INGRESO' ? '+' : '-'}{mov.cantidad}
							</td>
							<td class="px-6 py-4 text-sm font-bold text-gray-600">
								{mov.usuario?.Empleado?.nombre +
									' ' +
									mov.usuario?.Empleado?.apellido_paterno +
									' ' +
									mov.usuario?.Empleado?.apellido_materno || 'Sistema'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && totalPages > 1}
		<Pagination
			currentPage={filters.page ?? 1}
			{totalPages}
			perPage={filters.perPage ?? 15}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>
