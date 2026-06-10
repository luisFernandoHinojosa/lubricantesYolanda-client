<script lang="ts">
	import { onMount } from 'svelte';
	import { devolucionService } from '$lib/services';
	import { posService } from '$lib/services/pos.service';
	import type { Devolucion, DevolucionFilters } from '$lib/interfaces/devolucion.interface';
	import type { SesionCaja } from '$lib/interfaces/venta.interface';
	import { Pagination, Button, Heading, Input, Select } from '$lib/components/ui';
	import { ZoomIcon, PlusIcon, RefreshIcon } from '$lib/icons/outline';
	import DevolucionForm from '$lib/components/features/devolucion/devolucionForm.svelte';
	import DevolucionDetalleModal from '$lib/components/features/devolucion/devolucionDetalleModal.svelte';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import { alert, formatDate } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { MainLayout } from '$lib/components/layout';

	let devoluciones = $state<Devolucion[]>([]);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);
	let showingForm = $state(false);

	let sesionActiva = $state<SesionCaja | null>(null);

	let filters = $state<DevolucionFilters>({
		page: 1,
		perPage: 15,
		search: '',
		tipo: undefined,
		desde: undefined,
		hasta: undefined
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Modal
	let selectedDevolucion = $state<Devolucion | null>(null);
	let isModalOpen = $state(false);
	let isLoadingDetalle = $state(false);

	// Stats
	let totalDevoluciones = $derived(devoluciones.filter((d) => d.tipo === 'DEVOLUCION').length);
	let totalCambios = $derived(devoluciones.filter((d) => d.tipo === 'CAMBIO').length);
	let totalReembolsado = $derived(
		devoluciones.reduce((sum, d) => sum + parseFloat(d.monto_devuelto || '0'), 0)
	);

	const loadData = async () => {
		try {
			isLoading = true;
			const response = await devolucionService.getDevoluciones(filters);
			devoluciones = response.devoluciones;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			console.error('Error fetching devoluciones:', error);
			alert('error', 'Error al cargar el historial de devoluciones');
		} finally {
			isLoading = false;
		}
	};

	const loadSesion = async () => {
		try {
			sesionActiva = await posService.getSesionActiva();
		} catch {
			sesionActiva = null;
		}
	};

	onMount(() => {
		loadData();
		loadSesion();
	});

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

	function handleFilterTipo(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		filters.tipo = value ? (value as 'DEVOLUCION' | 'CAMBIO') : undefined;
		filters.page = 1;
		loadData();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}

	async function openDetalle(id: string) {
		try {
			isLoadingDetalle = true;
			selectedDevolucion = await devolucionService.getDevolucionById(id);
			isModalOpen = true;
		} catch (error) {
			console.error('Error fetching devolucion detail:', error);
			alert('error', 'No se pudo cargar el detalle');
		} finally {
			isLoadingDetalle = false;
		}
	}

	function closeModal() {
		isModalOpen = false;
		setTimeout(() => {
			selectedDevolucion = null;
		}, 200);
	}

	function toggleForm() {
		if (!sesionActiva) {
			alert('error', 'Debes tener una sesión de caja abierta para procesar devoluciones.');
			return;
		}
		showingForm = !showingForm;
	}

	function handleFormSubmit() {
		showingForm = false;
		loadData();
	}

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
			Number(amount)
		);
	}
</script>

<MainLayout
	title="Devoluciones y Cambios"
	description="Historial de devoluciones y cambios de productos"
	class="container mx-auto space-y-6"
>
	{#if !showingForm}
		<div in:fade class="space-y-6">
			<!-- Header -->
			<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<Heading level="h4">Devoluciones y Cambios</Heading>
					<p class="mt-1 text-sm text-light-two">
						Historial de devoluciones y cambios de productos
					</p>
				</div>

				<div class="flex items-center gap-3">
					{#if !sesionActiva}
						<span
							class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"
						>
							⚠ Sin sesión de caja
						</span>
					{/if}
					<Button
						variant="primary"
						onclick={toggleForm}
						class="border-amber-500 bg-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-600"
					>
						{#snippet leftIcon()}
							<PlusIcon class="size-5" />
						{/snippet}
						Nueva Devolución / Cambio
					</Button>
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<!-- Total Devoluciones -->
				<div
					class="relative translate-y-0 overflow-hidden rounded-2xl border border-light-four bg-light-two p-6 text-light-black shadow-lg transition-transform duration-300 hover:-translate-y-1"
				>
					<div class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5"></div>
					<div class="relative z-10">
						<div
							class="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-light-one uppercase"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-4"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M9 14l-4 -4l4 -4"></path>
								<path d="M5 10h11a4 4 0 1 1 0 8h-1"></path>
							</svg>
							Devoluciones
						</div>
						<div class="text-3xl font-black tracking-tight text-light-one">
							{total}
						</div>
						<p class="mt-1 text-xs text-light-one/60">Registros totales</p>
					</div>
				</div>

				<!-- Total Cambios -->
				<div
					class="relative translate-y-0 overflow-hidden rounded-2xl border border-light-four bg-light-two p-6 text-light-black shadow-lg transition-transform duration-300 hover:-translate-y-1"
				>
					<div class="absolute -top-4 -right-4 size-24 rounded-full bg-blue-500/5"></div>
					<div class="relative z-10">
						<div
							class="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-light-one uppercase"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-4"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M7 10h14l-4 -4"></path>
								<path d="M17 14h-14l4 4"></path>
							</svg>
							Cambios (en página)
						</div>
						<div class="text-3xl font-black tracking-tight text-light-one">
							{totalCambios}
						</div>
						<p class="mt-1 text-xs text-light-one/60">De {devoluciones.length} en vista</p>
					</div>
				</div>

				<!-- Total Reembolsado -->
				<div
					class="relative translate-y-0 overflow-hidden rounded-2xl border border-light-four bg-light-two p-6 text-light-black shadow-lg transition-transform duration-300 hover:-translate-y-1"
				>
					<div class="absolute -top-4 -right-4 size-24 rounded-full bg-amber-500/5"></div>
					<div class="relative z-10">
						<div
							class="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-light-one uppercase"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-4"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path
									d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"
								></path>
								<path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"></path>
							</svg>
							Total Reembolsado (página)
						</div>
						<div class="text-3xl font-black tracking-tight text-light-one">
							{formatCurrency(totalReembolsado)}
						</div>
						<p class="mt-1 text-xs text-light-one/60">En efectivo</p>
					</div>
				</div>
			</div>

			<!-- Filters -->
			<div class="space-y-4">
				<div class="flex flex-wrap items-end gap-4">
					<div class="relative min-w-[300px] flex-1">
						<Input
							id="search-devoluciones"
							type="text"
							label="Búsqueda"
							value={searchInput}
							oninput={handleSearchInput}
							placeholder="Buscar por número de devolución..."
							icon={ZoomIcon}
						/>
					</div>

					<div class="w-full md:w-52">
						<Select
							id="tipo-devolucion"
							label="Tipo"
							value={filters.tipo || ''}
							onchange={handleFilterTipo}
						>
							<option value="">Todos los tipos</option>
							<option value="DEVOLUCION">Devolución</option>
							<option value="CAMBIO">Cambio</option>
						</Select>
					</div>

					<div class="flex items-end">
						<Button variant="outline" onclick={loadData}>
							{#snippet leftIcon()}
								<RefreshIcon class="size-4" />
							{/snippet}
							Actualizar
						</Button>
					</div>
				</div>
			</div>

			<!-- Table -->
			{#if isLoading}
				<MovimientoTableSkeleton />
			{:else if devoluciones.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
				>
					<div class="mb-6 rounded-full bg-light-one_d p-6">
						<FilePencilIcon class="size-16 text-light-three" />
					</div>
					<h3 class="text-xl font-bold text-light-black">No se encontraron devoluciones</h3>
					<p class="mx-auto mt-2 max-w-xs text-light-two">
						{filters.search
							? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
							: 'Aún no se ha registrado ninguna devolución o cambio.'}
					</p>
					{#if !filters.search}
						<Button
							onclick={toggleForm}
							variant="outline"
							class="mt-8 border-amber-200 text-amber-600 hover:bg-amber-50"
						>
							Registrar primera devolución
						</Button>
					{/if}
				</div>
			{:else}
				<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
					<table class="min-w-full divide-y divide-light-four">
						<thead class="bg-light-one_d font-bold">
							<tr>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Nº Devolución
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Fecha
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Tipo
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Venta Original
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Cliente
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Responsable
								</th>
								<th
									class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Monto
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Estado
								</th>
								<th
									class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Acciones
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four bg-light-one">
							{#each devoluciones as dev (dev.id)}
								<tr
									class="border-b border-light-four text-light-black transition-colors hover:bg-light-one_d"
								>
									<!-- Número -->
									<td class="px-6 py-4 text-sm font-medium">
										<div class="line-clamp-1 font-bold text-gray-700">
											{dev.numero_devolucion}
										</div>
										<div class="mt-1 font-mono text-[10px] text-gray-400">
											ID: {dev.id?.substring(0, 8)}
										</div>
									</td>

									<!-- Fecha -->
									<td class="px-6 py-4 text-sm whitespace-nowrap">
										{formatDate(dev.createdAt)}
									</td>

									<!-- Tipo -->
									<td class="px-6 py-4 text-center">
										<span
											class="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase
											{dev.tipo === 'DEVOLUCION'
												? 'border-red-200 bg-red-50 text-red-700'
												: 'border-blue-200 bg-blue-50 text-blue-700'}"
										>
											{dev.tipo}
										</span>
									</td>

									<!-- Venta Original -->
									<td class="px-6 py-4 text-sm">
										{#if dev.venta_original}
											<span class="font-bold text-gray-700">
												{dev.venta_original.numero_comprobante}
											</span>
										{:else}
											<span class="text-xs text-gray-400 italic">—</span>
										{/if}
									</td>

									<!-- Cliente -->
									<td class="px-6 py-4 text-sm">
										{#if dev.cliente}
											<p class="font-bold text-gray-700">
												{dev.cliente.nombre}
												{dev.cliente.apellido_paterno}
											</p>
											<p class="text-xs text-gray-500">
												CI: {dev.cliente.ci}
											</p>
										{:else}
											<span class="text-xs text-gray-400 italic">Público General</span>
										{/if}
									</td>

									<!-- Responsable -->
									<td class="px-6 py-4 text-sm">
										{#if dev.empleado}
											<span class="text-gray-700">
												{dev.empleado.nombre}
												{dev.empleado.apellido_paterno}
											</span>
										{/if}
									</td>

									<!-- Monto -->
									<td class="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
										{#if dev.tipo === 'DEVOLUCION'}
											<span class="text-red-600">{formatCurrency(dev.monto_devuelto)}</span>
										{:else}
											<div class="flex flex-col items-end">
												<span class="text-xs text-light-two" title="Diferencia">
													Dif: {formatCurrency(dev.monto_diferencia)}
												</span>
												{#if parseFloat(dev.monto_devuelto) > 0}
													<span class="text-red-600">
														-{formatCurrency(dev.monto_devuelto)}
													</span>
												{/if}
											</div>
										{/if}
									</td>

									<!-- Estado -->
									<td class="px-6 py-4 text-center">
										<span
											class="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase
											{dev.estado === 'COMPLETADA'
												? 'border-green-200 bg-green-50 text-green-700'
												: 'border-red-200 bg-red-50 text-red-700'}"
										>
											{dev.estado}
										</span>
									</td>

									<!-- Acciones -->
									<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
										<button
											onclick={() => openDetalle(dev.id)}
											disabled={isLoadingDetalle}
											class="inline-flex items-center justify-center rounded-lg bg-light-black/5 p-2 text-light-black/70 transition-colors outline-none hover:bg-light-black/10 hover:text-light-black focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
											title="Ver Detalles"
										>
											{#if isLoadingDetalle && selectedDevolucion?.id === dev.id}
												<svg
													class="h-5 w-5 animate-spin"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														class="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														stroke-width="4"
													></circle>
													<path
														class="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
													></path>
												</svg>
											{:else}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													fill="none"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
													<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
													<path
														d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"
													></path>
												</svg>
											{/if}
										</button>
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
		</div>
	{:else}
		<div in:fade>
			<DevolucionForm
				id_sesion_caja={sesionActiva?.id ?? ''}
				onSubmit={handleFormSubmit}
				onCancel={toggleForm}
			/>
		</div>
	{/if}
</MainLayout>

<DevolucionDetalleModal isOpen={isModalOpen} devolucion={selectedDevolucion} onClose={closeModal} />
