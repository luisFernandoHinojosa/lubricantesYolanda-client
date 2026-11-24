<script lang="ts">
	import type { Lote } from '$lib/interfaces';
	import { Text } from '$lib/components/ui';
	import { HashIcon, PencilIcon, TrashIcon, MinusIcon, PlusIcon } from '$lib/icons/outline';
	import { formatDate, alert } from '$lib/utils';
	import { CalendarIcon, CoinIcon, TruckIcon } from '$lib/icons/solid';
	import StockAjusteModal from './StockAjusteModal.svelte';
	import { stockDistribucionService } from '$lib/services/stockDistribucion.service';

	interface Props {
		lote: Lote;
		onEdit?: (lote: Lote) => void;
		onDelete?: (id: string) => void;
		onStockUpdate?: () => void;
	}

	let { lote, onEdit, onDelete, onStockUpdate }: Props = $props();

	const isInactivo = $derived(lote.esta_activo === false);

	let isAjusteModalOpen = $state(false);
	let selectedStockDistId = $state<string | null>(null);
	let ajusteTipo = $state<'sumar' | 'restar'>('sumar');
	let isAjusting = $state(false);

	function openAjusteModal(id: string, tipo: 'sumar' | 'restar') {
		selectedStockDistId = id;
		ajusteTipo = tipo;
		isAjusteModalOpen = true;
	}

	async function handleAjusteStock(data: { id_stock_distribucion: string; cantidad: number; observacion: string }) {
		isAjusting = true;
		try {
			await stockDistribucionService.ajustarStock(data.id_stock_distribucion, {
				cantidad: data.cantidad,
				observacion: data.observacion
			});
			const dist = lote.stock_distribuciones?.find(d => d.id === data.id_stock_distribucion);
			if (dist) {
				dist.cantidad_actual = Number(dist.cantidad_actual) + data.cantidad;
			}
			lote.stock_lote_total = Number(lote.stock_lote_total) + data.cantidad;
			
			alert('success', 'Stock ajustado correctamente.');
			isAjusteModalOpen = false;
			onStockUpdate?.();
		} catch (error) {
			console.error(error);
			alert('error', 'Error al ajustar el stock.');
		} finally {
			isAjusting = false;
		}
	}
</script>

<div
	class="group relative flex flex-col gap-4 rounded-xl border p-5 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] {isInactivo ? 'border-dashed border-[#d6cdc2] bg-[#faf8f5] hover:border-acero-400' : 'border-acero-200 bg-white hover:border-acero-400'}"
>
	<!-- Botones de Acción -->
	<div
		class="absolute -top-2 -right-2 z-10 flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100"
	>
		{#if onEdit}
			<button
				class="flex items-center justify-center rounded-full border border-acero-200 bg-white p-1.5 text-acero-700 shadow-sm transition-all hover:border-acero-700 hover:bg-acero-700 hover:text-white"
				onclick={() => onEdit(lote)}
				title="Editar lote"
			>
				<PencilIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
		{#if onDelete}
			<button
				class="flex items-center justify-center rounded-full border border-acero-200 bg-white p-1.5 text-red-500 shadow-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
				onclick={() => onDelete(lote.id)}
				title="Eliminar lote"
			>
				<TrashIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	<!-- Header: Código de Lote -->
	<div class="mb-1 flex items-center justify-between border-b border-acero-200 pb-2">
		<div class="flex items-center gap-2">
			<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-acero-100 text-acero-700">
				<HashIcon class="size-4" />
			</div>
			<Text
				variant="body-sm"
				color="primary"
				weight="bold"
				class="tracking-tight {isInactivo ? 'line-through opacity-60' : ''}"
			>
				Lote: {lote.codigo_lote}
			</Text>
		</div>
		{#if isInactivo}
			<span
				class="inline-flex shrink-0 items-center gap-[0.3rem] rounded-[100px] border border-red-500/25 bg-red-500/10 px-[0.55rem] py-[0.2rem] text-xs font-semibold tracking-[0.05em] text-red-600"
				title="Este lote está inactivo y no suma al inventario consolidado"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
				Inactivo
			</span>
		{/if}
	</div>

	<!-- Info Grid -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 {isInactivo ? 'opacity-60 grayscale' : ''}">
		<!-- Proveedor -->
		<div class="col-span-full flex items-center gap-2 rounded-lg bg-acero-50 p-2">
			<TruckIcon class="size-4 text-acero-500" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-semibold text-acero-500">Proveedor</span>
				<span class="line-clamp-1 text-[0.75rem] font-bold text-acero-950"
					>{lote.proveedor?.nombre || 'Sin proveedor'}</span
				>
			</div>
		</div>

		<!-- Costo Compra -->
		<div class="flex items-center gap-2 rounded-lg border border-acero-200 p-2">
			<CoinIcon class="size-4 text-acero-500" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-semibold text-acero-500">Costo Compra</span>
				<span class="text-[0.8rem] font-semibold text-acero-950">Bs. {lote.costo_compra_unitario}</span
				>
			</div>
		</div>

		<!-- Stock -->
		<div class="flex items-center gap-2 rounded-lg border border-acero-200 p-2">
			<div
				class="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600"
			>
				<span class="text-[0.5rem] font-bold">Σ</span>
			</div>
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-semibold text-acero-500">Stock Total</span>
				<span class="text-[0.8rem] font-semibold text-acero-950">{lote.stock_lote_total || 0}</span>
			</div>
		</div>

		<!-- Fecha Ingreso -->
		<div class="flex items-center gap-2 rounded-lg border border-acero-200 p-2">
			<CalendarIcon class="size-4 text-acero-500" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-semibold text-acero-500">Ingreso</span>
				<span class="text-[0.7rem] font-bold text-acero-950">{formatDate(lote.fecha_ingreso)}</span>
			</div>
		</div>

		<!-- Fecha Vencimiento -->
		<div
			class="flex items-center gap-2 rounded-lg border p-2 {lote.fecha_vencimiento ? 'border-acero-200' : 'border-dashed border-acero-200'}"
		>
			<CalendarIcon
				class="size-4 {lote.fecha_vencimiento ? 'text-red-500' : 'text-acero-500 opacity-50'}"
			/>
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-semibold text-acero-500">Vencimiento</span>
				<span
					class="text-[0.7rem] font-bold {lote.fecha_vencimiento ? 'text-red-600' : 'text-gray-400'}"
				>
					{lote.fecha_vencimiento ? formatDate(lote.fecha_vencimiento) : 'No maneja'}
				</span>
			</div>
		</div>
	</div>

	<!-- Distribuciones -->
	{#if lote.stock_distribuciones && lote.stock_distribuciones.length > 0}
		<div
			class="mt-1 flex flex-col gap-2 rounded-xl bg-acero-50 p-3 {isInactivo ? 'opacity-60 grayscale' : ''}"
		>
			<span class="text-[0.55rem] font-semibold text-acero-500"
				>Distribución por Ubicación</span
			>
			<div class="flex flex-col gap-2">
				{#each lote.stock_distribuciones as dist (dist.id)}
					<div
						class="flex items-center justify-between border-b border-acero-200/50 pb-1 last:border-0 last:pb-0"
					>
						<div class="flex items-center gap-2">
							<div class="h-1 w-1 rounded-full bg-acero-400"></div>
							<div class="flex flex-col">
								<span class="text-[0.7rem] font-bold text-acero-950">{dist.ubicacion?.nombre}</span>
								<span class="text-[0.55rem] font-medium text-acero-500"
									>{dist.ubicacion?.tipo_area}</span
								>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="flex h-5 w-5 items-center justify-center rounded-md border border-acero-200 text-acero-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
								onclick={() => openAjusteModal(dist.id, 'restar')}
								title="Restar stock"
							>
								<MinusIcon class="size-3" />
							</button>
							<span class="min-w-[20px] text-center text-[0.75rem] font-semibold text-acero-700">{dist.cantidad_actual}</span>
							<button
								type="button"
								class="flex h-5 w-5 items-center justify-center rounded-md border border-acero-200 text-acero-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-600"
								onclick={() => openAjusteModal(dist.id, 'sumar')}
								title="Aumentar stock"
							>
								<PlusIcon class="size-3" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<StockAjusteModal
		isOpen={isAjusteModalOpen}
		stockDistribucionId={selectedStockDistId}
		tipoAjuste={ajusteTipo}
		loading={isAjusting}
		onClose={() => isAjusteModalOpen = false}
		onSave={handleAjusteStock}
	/>
</div>
