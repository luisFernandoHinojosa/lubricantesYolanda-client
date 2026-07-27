<script lang="ts">
	import { onMount } from 'svelte';
	import { posService } from '$lib/services/pos.service';
	import type { VentaListItem, VentaResponse } from '$lib/interfaces/venta.interface';
	import { Heading, Pagination, ModalConfirm } from '$lib/components/ui';
	import { ZoomIcon } from '$lib/icons/outline';
	import VentaDetalleModal from '$lib/components/features/puntoventas/ventas/ventaDetalleModal.svelte';
	import { ReciboModal, VentaTableRow } from '$lib/components/features/puntoventas/ventas';
	import { MainLayout } from '$lib/components/layout';
	import { alert } from '$lib/utils';
	//import { toast } from 'svelte-sonner';

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

	let isReciboOpen = $state(false);
	let selectedVentaToPrint = $state<VentaResponse | null>(null);
	let isLoadingPrint = $state<string | null>(null);
	let isAnulando = $state<string | null>(null);
	let isConfirmAnularOpen = $state(false);
	let idVentaToAnular = $state<string | null>(null);

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

	async function openPrint(id: string) {
		try {
			isLoadingPrint = id;
			selectedVentaToPrint = await posService.getVenta(id);
			isReciboOpen = true;
			setTimeout(() => window.print(), 500);
		} catch (error) {
			console.error('Error fetching sale details for printing:', error);
		} finally {
			isLoadingPrint = null;
		}
	}

	function closeRecibo() {
		isReciboOpen = false;
		selectedVentaToPrint = null;
	}

	function handleAnularClick(id: string) {
		idVentaToAnular = id;
		isConfirmAnularOpen = true;
	}

	async function confirmAnular() {
		if (!idVentaToAnular) return;
		try {
			isAnulando = idVentaToAnular;
			const res = await posService.anularVenta(idVentaToAnular);
			if (res.status === 'success') {
				alert('success', res.message);
				await loadData();
			}
		} catch (error: any) {
			console.error('Error anulando venta:', error);
			const msg = error.response?.data?.message || 'Error al anular la venta';
			alert('error', msg);
		} finally {
			isAnulando = null;
			isConfirmAnularOpen = false;
			idVentaToAnular = null;
		}
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

	function fmt(n: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(n);
	}

	function fmtDate(d: string) {
		return new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(
			new Date(d)
		);
	}

	function fmtPrec(n: number) {
		return new Intl.NumberFormat('es-BO', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}).format(n);
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
							<VentaTableRow
								{venta}
								isLoadingDetalles={isLoadingDetalles && selectedVenta?.id === venta.id}
								isLoadingPrint={isLoadingPrint === venta.id}
								isAnulando={isAnulando === venta.id}
								onView={openDetalles}
								onPrint={openPrint}
								onAnular={handleAnularClick}
							/>
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

{#if isReciboOpen && selectedVentaToPrint}
	<ReciboModal
		ultimaVenta={selectedVentaToPrint}
		onCerrar={closeRecibo}
		onImprimir={() => window.print()}
		{fmt}
		{fmtDate}
		{fmtPrec}
		titulo="Impresión de Recibo"
		textoBotonCerrar="Cerrar"
	/>
{/if}

<ModalConfirm
	isOpen={isConfirmAnularOpen}
	message="¿Está seguro de anular esta venta? Esta acción no se puede deshacer ni recuperar y se va a revertir el stock."
	loading={isAnulando !== null}
	onConfirm={confirmAnular}
	onCancel={() => {
		isConfirmAnularOpen = false;
		idVentaToAnular = null;
	}}
/>
