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
	let totalMontoVentas = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);

	let filters = $state({
		page: 1,
		perPage: 15,
		search: '',
		metodo_pago: '',
		desde: '',
		hasta: ''
	});

	let datePreset = $state(''); // '', 'hoy', 'ayer', 'semana', 'mes', 'custom'

	function applyDatePreset(preset: string) {
		datePreset = preset;
		const today = new Date();
		let d = '';
		let h = '';

		if (preset === 'hoy') {
			d = today.toISOString().split('T')[0];
			h = d;
		} else if (preset === 'ayer') {
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			d = yesterday.toISOString().split('T')[0];
			h = d;
		} else if (preset === 'semana') {
			const start = new Date(today);
			start.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Lunes
			d = start.toISOString().split('T')[0];
			h = today.toISOString().split('T')[0];
		} else if (preset === 'mes') {
			const start = new Date(today.getFullYear(), today.getMonth(), 1);
			d = start.toISOString().split('T')[0];
			h = today.toISOString().split('T')[0];
		}

		if (preset !== 'custom') {
			filters.desde = d;
			filters.hasta = h;
			if (preset !== '') {
				filters.page = 1;
				loadData();
			} else {
				filters.desde = '';
				filters.hasta = '';
				filters.page = 1;
				loadData();
			}
		}
	}

	function handleCustomDateChange() {
		if (filters.desde && filters.hasta) {
			filters.page = 1;
			loadData();
		}
	}

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
			totalMontoVentas = response.totalMontoVentas;
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

		<div class="grid grid-cols-2 gap-4">
			<div
				class="group relative flex-1 overflow-hidden rounded-xl bg-[#B91C1C] p-4 text-white shadow-md"
			>
				<div class="relative">
					<div class="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-80">
						<span>Ventas Registradas</span>
					</div>
					<div class="text-4xl font-extrabold tracking-tighter">{total}</div>
				</div>
			</div>

			<div
				class="flex flex-1 overflow-hidden rounded-xl border border-[#B91C1C]/20 bg-white p-4 text-[#B91C1C] shadow-md"
			>
				<div>
					<div class="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-80">
						<span>Monto Total</span>
					</div>
					<div class="text-3xl font-extrabold tracking-tighter">
						{formatCurrency(totalMontoVentas)}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div
		class="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
	>
		<div class="relative min-w-[250px] flex-1">
			<input
				type="text"
				value={searchInput}
				oninput={handleSearchInput}
				placeholder="Buscar por comprobante, cliente o CI..."
				class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-all focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
			/>
			<span class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
				<ZoomIcon class="h-5 w-5" />
			</span>
		</div>

		<div class="w-40">
			<select
				onchange={handleFilterChange}
				class="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
			>
				<option value="">Método: Todos</option>
				<option value="EFECTIVO">Efectivo</option>
				<option value="QR">QR</option>
				<option value="TARJETA">Tarjeta</option>
				<option value="TRANSFERENCIA">Transferencia</option>
			</select>
		</div>

		<div class="w-48">
			<select
				bind:value={datePreset}
				onchange={() => applyDatePreset(datePreset)}
				class="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
			>
				<option value="">Fecha: Todas</option>
				<option value="hoy">Hoy</option>
				<option value="ayer">Ayer</option>
				<option value="semana">Esta Semana</option>
				<option value="mes">Este Mes</option>
				<option value="custom">Personalizado...</option>
			</select>
		</div>

		{#if datePreset === 'custom'}
			<div class="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-1 shadow-sm">
				<div class="flex items-center gap-2 pr-2 pl-3">
					<span class="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Desde</span>
					<input
						type="date"
						bind:value={filters.desde}
						onchange={handleCustomDateChange}
						class="w-36 cursor-pointer rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
					/>
				</div>

				<div class="h-6 w-[1px] bg-gray-300"></div>

				<div class="flex items-center gap-2 pr-3 pl-2">
					<span class="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Hasta</span>
					<input
						type="date"
						bind:value={filters.hasta}
						onchange={handleCustomDateChange}
						class="w-36 cursor-pointer rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
					/>
				</div>
			</div>
		{/if}
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

	{#if !isLoading && ventas.length > 0}
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
