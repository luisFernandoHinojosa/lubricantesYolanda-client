<script lang="ts">
	import { onMount } from 'svelte';
	import { comprasService } from '$lib/services';
	import type { Compra, CompraFilters } from '$lib/interfaces/compra.interface';
	import { Pagination, Button, Heading, Input, Select } from '$lib/components/ui';
	import { ZoomIcon, PlusIcon, ShoppingCartIcon } from '$lib/icons/outline';
	import CompraDetalleModal from '$lib/components/features/compra/compraDetalleModal.svelte';
	import CompraForm from '$lib/components/features/compra/compraForm.svelte';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import type { CreateCompraDto } from '$lib/interfaces';
	import { alert, formatDate } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { MainLayout } from '$lib/components/layout';

	let compras = $state<Compra[]>([]);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let showingForm = $state(false);

	let filters = $state<CompraFilters>({
		page: 1,
		perPage: 15,
		search: '',
		estado_pago: undefined
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// ─── Modal ───────────────────────────────────────────────────────────────
	let selectedCompra = $state<Compra | null>(null);
	let isModalOpen = $state(false);
	let isLoadingDetalle = $state(false);

	const loadData = async () => {
		try {
			isLoading = true;
			const response = await comprasService.getCompras(filters);
			compras = response.compras;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			console.error('Error fetching purchases:', error);
			alert('error', 'Error al cargar el historial de compras');
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
		filters.estado_pago = value ? (value as Compra['estado_pago']) : undefined;
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
			selectedCompra = await comprasService.getCompraById(id);
			isModalOpen = true;
		} catch (error) {
			console.error('Error fetching compra detail:', error);
			alert('error', 'No se pudo cargar el detalle de la compra');
		} finally {
			isLoadingDetalle = false;
		}
	}

	function closeModal() {
		isModalOpen = false;
		setTimeout(() => {
			selectedCompra = null;
		}, 200);
	}

	function handleUpdated(updated: Compra) {
		compras = compras.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
		selectedCompra = updated;
	}

	function handleDeleted(id: string) {
		compras = compras.filter((c) => c.id !== id);
		total = Math.max(0, total - 1);
	}

	function toggleForm() {
		showingForm = !showingForm;
	}

	async function handleRegisterCompra(data: CreateCompraDto) {
		try {
			isSubmitting = true;
			await comprasService.createCompra(data);
			alert('success', 'Compra registrada exitosamente');
			showingForm = false;
			await loadData();
		} catch (error: any) {
			const mensaje = error?.message || error?.mensaje || 'Error al registrar la compra';
			alert('error', mensaje);
			console.error('Error registering purchase:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
			Number(amount)
		);
	}
</script>

<MainLayout
	title="Historial de Compras"
	description="Historial de compras de productos."
	class="container mx-auto space-y-6"
>
	{#if !showingForm}
		<div in:fade class="space-y-6">
			<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<Heading level="h4">Historial de Compras</Heading>
				</div>

				<div class="flex items-center gap-3">
					<Button
						variant="primary"
						onclick={toggleForm}
						class="border-red-600 bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-700"
					>
						{#snippet leftIcon()}
							<PlusIcon class="size-5" />
						{/snippet}
						Registrar Compra
					</Button>
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
							<ShoppingCartIcon class="size-4 text-light-one" />
							Compras Registradas
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
							id="search-compras"
							type="text"
							label="Búsqueda"
							value={searchInput}
							oninput={handleSearchInput}
							placeholder="Buscar por comprobante o proveedor..."
							icon={ZoomIcon}
						/>
					</div>

					<div class="w-full md:w-64">
						<Select
							id="estado-compras"
							label="Estado de Pago"
							value={filters.estado_pago || ''}
							onchange={handleFilterChange}
						>
							<option value="">Todos los estados</option>
							<option value="PENDIENTE">Pendiente</option>
							<option value="PAGADO_PARCIAL">Pagado Parcial</option>
							<option value="PAGADO">Pagado</option>
						</Select>
					</div>
				</div>
			</div>

			{#if isLoading}
				<MovimientoTableSkeleton />
			{:else if compras.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
				>
					<div class="mb-6 rounded-full bg-light-one_d p-6">
						<FilePencilIcon class="size-16 text-light-three" />
					</div>
					<h3 class="text-xl font-bold text-light-black">No se encontraron compras</h3>
					<p class="mx-auto mt-2 max-w-xs text-light-two">
						{filters.search
							? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
							: 'Aún no has registrado ninguna compra. ¡Empieza creando una nueva!'}
					</p>
					{#if !filters.search}
						<Button
							onclick={toggleForm}
							variant="outline"
							class="mt-8 border-red-200 text-red-600 hover:bg-red-50"
						>
							Registrar mi primera compra
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
									Comprobante
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Fecha
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Proveedor
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Responsable
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Estado Pago
								</th>
								<th
									class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Total
								</th>
								<th
									class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
								>
									Acciones
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four bg-light-one">
							{#each compras as compra (compra.id)}
								<tr
									class="border-b border-light-four text-light-black transition-colors hover:bg-light-one_d"
								>
									<td class="px-6 py-4 text-sm font-medium">
										<div class="line-clamp-1 font-bold text-gray-700">
											{compra.numero_comprobante || 'S/N'}
										</div>
										<div class="mt-1 font-mono text-[10px] text-gray-400">
											ID: {compra.id?.substring(0, 8)}
										</div>
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap">
										{formatDate(compra.createdAt!)}
									</td>
									<td class="px-6 py-4 text-sm">
										{#if compra.proveedor}
											<p class="font-bold text-gray-700">{compra.proveedor.nombre}</p>
											<p class="mt-0.5 text-xs text-gray-500">NIT: {compra.proveedor.nit_ci}</p>
										{:else}
											<span class="text-xs text-gray-400 italic">Desconocido</span>
										{/if}
									</td>
									<td class="px-6 py-4 text-sm">
										{#if compra.empleado}
											<div class="flex flex-col">
												<span class="text-xs font-semibold text-light-two uppercase">Empleado</span>
												<span>
													{compra.empleado.nombre}
													{compra.empleado.apellido_paterno}
												</span>
											</div>
										{/if}
									</td>
									<td class="px-6 py-4 text-center">
										<span
											class="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase
											{compra.estado_pago === 'PAGADO'
												? 'border-green-200 bg-green-50 text-green-700'
												: compra.estado_pago === 'PENDIENTE'
													? 'border-red-200 bg-red-50 text-red-700'
													: 'border-orange-200 bg-orange-50 text-orange-700'}"
										>
											{compra.estado_pago}
										</span>
									</td>
									<td class="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
										<span class="text-light-error">
											{formatCurrency(compra.total)}
										</span>
									</td>

									<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
										<button
											onclick={() => openDetalle(compra.id!)}
											disabled={isLoadingDetalle}
											class="inline-flex items-center justify-center rounded-lg bg-light-black/5 p-2 text-light-black/70 transition-colors outline-none hover:bg-light-black/10 hover:text-light-black focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
											title="Ver Detalles"
										>
											{#if isLoadingDetalle && selectedCompra?.id === compra.id}
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
			<CompraForm loading={isSubmitting} onSubmit={handleRegisterCompra} onCancel={toggleForm} />
		</div>
	{/if}
</MainLayout>

<CompraDetalleModal
	isOpen={isModalOpen}
	compra={selectedCompra}
	onClose={closeModal}
	onUpdated={handleUpdated}
	onDeleted={handleDeleted}
/>
