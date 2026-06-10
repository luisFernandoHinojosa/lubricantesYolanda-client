<script lang="ts">
	import { onMount } from 'svelte';
	import { posService } from '$lib/services/pos.service';
	import type { VentaListItem, VentaResponse } from '$lib/interfaces/venta.interface';
	import { Heading, Pagination } from '$lib/components/ui';
	import { ZoomIcon } from '$lib/icons/outline';
	import VentaDetalleModal from '$lib/components/features/puntoventas/ventas/ventaDetalleModal.svelte';
	import { MainLayout } from '$lib/components/layout';

	let ventas = $state<VentaListItem[]>([]);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);

	let filters = $state({
		page: 1,
		perPage: 15,
		search: '',
		metodo_pago: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let selectedVenta = $state<VentaResponse | null>(null);
	let isModalOpen = $state(false);
	let isLoadingDetalles = $state(false);

	const loadData = async () => {
		try {
			isLoading = true;
			const response = await posService.listarVentas(filters);
			ventas = response.ventas;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			console.error('Error fetching sales history:', error);
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
		filters.metodo_pago = value;
		filters.page = 1;
		loadData();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}

	async function openDetalles(id: string) {
		try {
			isLoadingDetalles = true;
			// El endpoint de "getVenta" retorna toda la información detallada (item.producto.nombre_comercial, presentacion, etc.)
			selectedVenta = await posService.getVenta(id);
			isModalOpen = true;
		} catch (error) {
			console.error('Error fetching sale details:', error);
		} finally {
			isLoadingDetalles = false;
		}
	}

	function closeModal() {
		isModalOpen = false;
		// Animación timeout antes de mutar
		setTimeout(() => {
			selectedVenta = null;
		}, 200);
	}

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: 'BOB'
		}).format(Number(amount));
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('es-BO', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<MainLayout
	title="Historial de Ventas"
	description="Historial de ventas"
	class="container mx-auto space-y-6"
>
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Heading level="h4">Historial de Ventas</Heading>
		</div>

		<div class="flex gap-4">
			<div
				class="group relative max-w-[280px] flex-1 overflow-hidden rounded-xl bg-[#B91C1C] p-4 text-white shadow-md"
			>
				<div class="relative z-10">
					<div class="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-80">
						<span>Ventas Registradas</span>
					</div>
					<div class="text-4xl font-extrabold tracking-tighter">{total}</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-wrap items-center gap-2">
		<div class="relative min-w-[300px] flex-1">
			<input
				type="text"
				value={searchInput}
				oninput={handleSearchInput}
				placeholder="Buscar por comprobante, cliente o CI..."
				class="w-full rounded-lg border-none bg-[#B91C1C] py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-white/60 focus:ring-2 focus:ring-red-400"
			/>
			<span class="absolute top-1/2 left-3 -translate-y-1/2 text-white/80">
				<ZoomIcon class="h-5 w-5" />
			</span>
		</div>

		<div class="w-48">
			<select
				onchange={handleFilterChange}
				class="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#B91C1C] px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-red-400"
			>
				<option value="">Método: Todos</option>
				<option value="EFECTIVO">Efectivo</option>
				<option value="QR">QR</option>
				<option value="TARJETA">Tarjeta</option>
				<option value="TRANSFERENCIA">Transferencia</option>
			</select>
		</div>
	</div>

	<!-- Data Table -->
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left text-xs whitespace-nowrap">
				<thead>
					<tr class="bg-[#B91C1C] font-bold tracking-wider text-white uppercase">
						<th class="border-r border-red-800/30 px-6 py-4">Comprobante</th>
						<th class="border-r border-red-800/30 px-6 py-4">Fecha</th>
						<th class="border-r border-red-800/30 px-6 py-4">Cliente</th>
						<th class="border-r border-red-800/30 px-6 py-4">Vendedor</th>
						<th class="border-r border-red-800/30 px-6 py-4 text-center">Pago</th>
						<th class="border-r border-red-800/30 px-6 py-4 text-right">Total</th>
						<th class="px-6 py-4 text-center">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if isLoading}
						<tr>
							<td colspan="7" class="p-12 text-center font-medium text-light-black/50"
								>Cargando historial...</td
							>
						</tr>
					{:else if ventas.length === 0}
						<tr>
							<td colspan="7" class="p-12 text-center font-medium text-light-black/50"
								>No se encontraron ventas para esta búsqueda.</td
							>
						</tr>
					{:else}
						{#each ventas as venta, i (venta.id)}
							<tr
								class="{i % 2 === 0
									? 'bg-[#D19999]/20'
									: 'bg-[#D19999]/40'} transition-colors hover:bg-red-100/50"
							>
								<td class="border-r border-gray-200/50 px-6 py-4">
									<p class="font-bold text-gray-700">{venta.numero_comprobante}</p>
									<p class="mt-1 font-mono text-[10px] text-gray-500">
										Caja: {venta.id_sesion_caja?.substring(0, 8)}
									</p>
								</td>
								<td class="border-r border-gray-200/50 px-6 py-4 font-medium text-gray-600">
									{formatDate(venta.createdAt)}
								</td>
								<td class="border-r border-gray-200/50 px-6 py-4">
									{#if venta.cliente && venta.cliente.ci !== '000000'}
										<p class="font-bold text-gray-700">
											{venta.cliente.nombre}
											{venta.cliente.apellido_paterno}
										</p>
										<p class="mt-0.5 text-xs text-gray-600">CI/NIT: {venta.cliente.ci}</p>
									{:else}
										<span class="text-xs font-bold text-gray-600 italic">Público General</span>
									{/if}
								</td>
								<td class="border-r border-gray-200/50 px-6 py-4">
									{#if venta.cajero}
										<p class="font-medium text-gray-600">
											{venta.cajero.nombre}
											{venta.cajero.apellido_paterno}
										</p>
									{:else}
										<span class="text-xs text-gray-600 italic">Desconocido</span>
									{/if}
								</td>
								<td class="border-r border-gray-200/50 px-6 py-4 text-center">
									<span
										class="inline-flex items-center justify-center rounded-full border border-[#B91C1C]/20 bg-[#D19999]/20 px-3 py-1 text-[10px] font-bold text-[#8B1515] uppercase"
									>
										{venta.metodo_pago}
									</span>
								</td>
								<td class="border-r border-gray-200/50 px-6 py-4 text-right">
									<p class="text-base font-extrabold text-[#B91C1C]">
										{formatCurrency(venta.total)}
									</p>
									{#if parseFloat(venta.monto_descuento_global) > 0}
										<p class="mt-0.5 text-[10px] font-bold text-gray-600">
											- {formatCurrency(venta.monto_descuento_global)} Desc.
										</p>
									{/if}
								</td>
								<td class="px-6 py-4 text-center">
									<button
										onclick={() => openDetalles(venta.id)}
										disabled={isLoadingDetalles && selectedVenta?.id === venta.id}
										class="inline-flex items-center justify-center rounded-lg bg-light-black/5 p-2 text-light-black/70 transition-colors outline-none hover:bg-light-black/10 hover:text-light-black focus:ring-2 focus:ring-[#B91C1C]/20 disabled:opacity-50"
										title="Ver Detalles"
									>
										{#if isLoadingDetalles && selectedVenta?.id === venta.id}
											<svg
												class="h-5 w-5 animate-spin"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												><circle
													class="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													stroke-width="4"
												></circle><path
													class="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path></svg
											>
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
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	{#if !isLoading && totalPages > 1}
		<div class="mt-8 flex justify-center">
			<Pagination
				currentPage={filters.page}
				{totalPages}
				perPage={filters.perPage}
				{total}
				onPageChange={handlePageChange}
			/>
		</div>
	{/if}
</MainLayout>

<VentaDetalleModal isOpen={isModalOpen} venta={selectedVenta} onClose={closeModal} />
