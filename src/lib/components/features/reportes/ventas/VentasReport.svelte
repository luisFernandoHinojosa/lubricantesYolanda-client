<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { reporteService } from '$lib/services/reporte.service';
	import type { VentaReportData, VentaReportFilters } from '$lib/interfaces/reporte.interface';
	import ReportFilterBar from '$lib/components/features/reportes/ReportFilterBar.svelte';
	import { alert } from '$lib/utils';
	import { generateVentasPdf } from '$lib/utils/pdf/ventas.pdf';
	import { PencilIcon, ShoppingCartIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Pagination } from '$lib/components/ui';

	let loading = $state(false);
	let downloadingPdf = $state(false);
	let data = $state<VentaReportData | null>(null);

	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	console.log('data', data);
	let filters = $state<VentaReportFilters & { page: number; perPage: number }>({
		desde: firstDayOfMonth.toISOString().split('T')[0],
		hasta: now.toISOString().split('T')[0],
		agrupar_por: 'dia',
		id_sucursal: '',
		metodo_pago: undefined,
		page: 1,
		perPage: 15
	});

	async function loadData() {
		try {
			loading = true;
			const apiFilters = {
				...filters,
				desde: filters.desde.split('-').join('-'),
				hasta: filters.hasta.split('-').join('-')
			};
			data = await reporteService.getVentasReport(apiFilters);
		} catch (error) {
			console.error('Error loading sales report:', error);
			alert('error', 'No se pudo cargar el reporte de ventas');
		} finally {
			loading = false;
		}
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}

	onMount(loadData);

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val);
	}

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('es-BO', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		}).format(date);
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'COMPLETED':
				return { label: 'Venta', color: 'bg-green-100 text-green-700' };
			case 'CANCELLED':
				return { label: 'Anulada', color: 'bg-light-four text-light-black/60' };
			default:
				return { label: status, color: 'bg-blue-100 text-blue-700' };
		}
	}

	function getMovementLabel(movement: string) {
		switch (movement) {
			case 'SALE':
				return { label: 'Venta', color: 'bg-green-100 text-green-700' };
			case 'RETURN':
				return { label: 'Devolución', color: 'bg-red-100 text-red-700' };
			case 'EXCHANGE_IN':
				return { label: 'Cambio', color: 'bg-orange-100 text-orange-700' };
			default:
				return { label: movement, color: 'bg-gray-100 text-gray-700' };
		}
	}

	async function handleDownloadPdf() {
		if (!data) return;
		try {
			downloadingPdf = true;
			await generateVentasPdf(data, filters);
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
		bind:metodo_pago={filters.metodo_pago}
		bind:agrupar_por={filters.agrupar_por}
		onFilter={loadData}
		onDownloadPdf={handleDownloadPdf}
		{loading}
		{downloadingPdf}
		showPaymentMethod
		showGrouping
	/>

	{#if data}
		<!-- Stats Grid (from Mockup) -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" in:fade>
			<!-- Total Recibos -->
			<div
				class="flex items-center gap-4 rounded-xl border border-light-four bg-white p-6 shadow-sm"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600"
				>
					<PencilIcon class="h-7 w-7" />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-gray-500">Total Recibos</span>
					<div class="flex items-baseline gap-1">
						<span class="text-2xl font-bold text-gray-900">{data.summary.receipts}</span>
						<span class="text-sm text-gray-500">recibos</span>
					</div>
				</div>
			</div>

			<!-- Total Productos -->
			<div
				class="flex items-center gap-4 rounded-xl border border-light-four bg-white p-6 shadow-sm"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600"
				>
					<ShoppingCartIcon class="h-7 w-7" />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-gray-500">Total Productos</span>
					<div class="flex items-baseline gap-1">
						<span class="text-2xl font-bold text-gray-900">{data.summary.products}</span>
						<span class="text-sm text-gray-500">unidades</span>
					</div>
				</div>
			</div>

			<!-- Subtotal General -->
			<div
				class="flex items-center gap-4 rounded-xl border border-light-four bg-white p-6 shadow-sm"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
				>
					<CoinIcon class="h-7 w-7" />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-gray-500">Subtotal General</span>
					<span class="text-2xl font-bold text-gray-900"
						>{formatCurrency(data.summary.subtotal)}</span
					>
				</div>
			</div>

			<!-- Total Neto General -->
			<div
				class="flex items-center gap-4 rounded-xl border border-light-four bg-white p-6 shadow-sm"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-500"
				>
					<CoinIcon class="h-7 w-7" />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-gray-500">Total Neto General</span>
					<span class="text-2xl font-bold text-green-600"
						>{formatCurrency(data.summary.netTotal)}</span
					>
				</div>
			</div>
		</div>

		<!-- Receipts List (Flat) -->
		<div
			class="flex flex-col gap-4 rounded-xl border border-light-four bg-white p-6 shadow-sm"
			in:fade
		>
			<div class="mb-4 flex items-center justify-between border-b border-light-four pb-4">
				<h3 class="text-lg font-bold text-gray-900">Lista de Recibos</h3>
			</div>

			{#each data.receipts as receipt (receipt.id)}
				<div class="mb-6 flex flex-col overflow-hidden rounded-xl border border-gray-200">
					<!-- Receipt Header Info -->
					<div class="grid grid-cols-8 gap-4 bg-gray-50 px-6 py-4 text-sm">
						<div class="col-span-1 flex flex-col">
							<span class="text-xs font-semibold text-gray-500">N° Recibo</span>
							<span class="font-medium text-blue-600">{receipt.number}</span>
						</div>
						<div class="col-span-1 flex flex-col">
							<span class="text-xs font-semibold text-gray-500">Fecha / Hora</span>
							<span class="text-gray-900">{formatDate(receipt.date)}</span>
						</div>
						<div class="col-span-1 flex flex-col">
							<span class="text-xs font-semibold text-gray-500">Cliente</span>
							<span class="text-gray-900">{receipt.customer.name}</span>
						</div>
						<div class="col-span-1 flex flex-col items-center">
							<span class="text-xs font-semibold text-gray-500">Tipo</span>
							<span
								class="mt-1 rounded-md px-2 py-0.5 text-xs font-medium {getStatusLabel(
									receipt.status
								).color}"
							>
								{getStatusLabel(receipt.status).label}
							</span>
						</div>
						<div class="col-span-1 flex flex-col items-center">
							<span class="text-xs font-semibold text-gray-500">Productos</span>
							<span class="text-gray-900">{receipt.items.length}</span>
						</div>
						<div class="col-span-1 flex flex-col items-end">
							<span class="text-xs font-semibold text-gray-500">Subtotal</span>
							<span class="text-gray-900">{formatCurrency(receipt.subtotal)}</span>
						</div>
						<div class="col-span-1 flex flex-col items-end">
							<span class="text-xs font-semibold text-gray-500">Dsctos / Dev</span>
							<span class="text-red-500"
								>- {formatCurrency(receipt.discount + receipt.returnedAmount)}</span
							>
						</div>
						<div class="col-span-1 flex flex-col items-end">
							<span class="text-xs font-semibold text-gray-500">Total Neto</span>
							<span class="font-bold text-green-600">{formatCurrency(receipt.netTotal)}</span>
						</div>
					</div>

					<!-- Receipt Items -->
					<div class="px-6 py-4">
						<table class="w-full text-left text-sm">
							<thead>
								<tr class="border-b border-gray-100 text-xs font-semibold text-gray-500">
									<th class="py-3">Producto</th>
									<th class="py-3">Código</th>
									<th class="py-3 text-center">Cantidad</th>
									<th class="py-3 text-right">Precio Unit.</th>
									<th class="py-3 text-right">Total</th>
									<th class="py-3 text-center">Tipo</th>
									<th class="py-3">Nota / Referencia</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-50">
								{#each receipt.items as item (item.id)}
									<tr class="hover:bg-gray-50/50">
										<td class="py-3 text-gray-900">{item.name}</td>
										<td class="py-3 text-gray-500">{item.code}</td>
										<td class="py-3 text-center text-gray-900">{item.quantity}</td>
										<td class="py-3 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
										<td
											class="py-3 text-right font-medium {item.total < 0
												? 'text-red-500'
												: 'text-gray-900'}"
										>
											{formatCurrency(item.total)}
										</td>
										<td class="py-3 text-center">
											<span
												class="inline-block rounded-md px-2 py-0.5 text-[10px] font-medium {getMovementLabel(
													item.movement
												).color}"
											>
												{getMovementLabel(item.movement).label}
											</span>
										</td>
										<td class="py-3 text-gray-500">{item.referenceReceipt || '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>

						<!-- Receipt Footer summary -->
						<div class="mt-4 flex justify-end gap-6 border-t border-gray-100 pt-4 text-sm">
							<div class="flex items-center gap-2">
								<span class="font-semibold text-gray-500">Subtotal:</span>
								<span class="text-gray-900">{formatCurrency(receipt.subtotal)}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="font-semibold text-gray-500">Descuentos / Devoluciones:</span>
								<span class="text-red-500"
									>- {formatCurrency(receipt.discount + receipt.returnedAmount)}</span
								>
							</div>
							<div class="flex items-center gap-2">
								<span class="font-bold text-gray-900">Total Neto:</span>
								<span class="font-bold text-green-600">{formatCurrency(receipt.netTotal)}</span>
							</div>
						</div>
					</div>
				</div>
			{/each}

			<!-- General Footer -->
			<div
				class="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-6 py-4 text-sm font-semibold"
			>
				<span class="text-gray-600">Total General ({data.summary.receipts} recibos)</span>
				<div class="flex gap-8">
					<div class="flex gap-2 text-gray-600">
						<span>Subtotal:</span>
						<span>{formatCurrency(data.summary.subtotal)}</span>
					</div>
					<div class="flex gap-2 text-red-500">
						<span>Descuentos / Devoluciones:</span>
						<span>- {formatCurrency(data.summary.discount + data.summary.returnedAmount)}</span>
					</div>
					<div class="flex gap-2 text-gray-900">
						<span>Total Neto General:</span>
						<span class="text-green-600">{formatCurrency(data.summary.netTotal)}</span>
					</div>
				</div>
			</div>

			<!-- Pagination -->
			{#if data.receipts.length > 0}
				<div class="mt-8 flex justify-center">
					<Pagination
						currentPage={data.page}
						totalPages={data.totalPages}
						perPage={data.perPage}
						total={data.total}
						onPageChange={handlePageChange}
					/>
				</div>
			{/if}
		</div>
	{:else}
		<div
			class="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-light-four bg-white"
		>
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600"
			></div>
			<p class="animate-pulse text-xs font-bold tracking-widest text-gray-400 uppercase italic">
				Analizando Datos de Ventas...
			</p>
		</div>
	{/if}
</div>
