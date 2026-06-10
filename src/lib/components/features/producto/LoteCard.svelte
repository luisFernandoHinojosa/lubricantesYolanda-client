<script lang="ts">
	import type { Lote } from '$lib/interfaces';
	import { Text } from '$lib/components/ui';
	import { HashIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import { formatDate } from '$lib/utils';
	import { CalendarIcon, CoinIcon, TruckIcon } from '$lib/icons/solid';

	interface Props {
		lote: Lote;
		onEdit?: (lote: Lote) => void;
		onDelete?: (id: string) => void;
	}

	let { lote, onEdit, onDelete }: Props = $props();
</script>

<div
	class="group relative flex flex-col gap-4 rounded-2xl border border-[#e8e0d8] bg-white p-5 transition-all hover:border-[#b09475] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
>
	<!-- Botones de Acción -->
	<div
		class="absolute -top-2 -right-2 z-10 flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100"
	>
		{#if onEdit}
			<button
				class="flex items-center justify-center rounded-full border border-[#e8e0d8] bg-white p-1.5 text-[#8b7355] shadow-sm transition-all hover:border-[#8b7355] hover:bg-[#8b7355] hover:text-white"
				onclick={() => onEdit(lote)}
				title="Editar lote"
			>
				<PencilIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
		{#if onDelete}
			<button
				class="flex items-center justify-center rounded-full border border-[#e8e0d8] bg-white p-1.5 text-red-500 shadow-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
				onclick={() => onDelete(lote.id)}
				title="Eliminar lote"
			>
				<TrashIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	<!-- Header: Código de Lote -->
	<div class="mb-1 flex items-center justify-between border-b border-[#e8e0d8] pb-2">
		<div class="flex items-center gap-2">
			<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f0e8] text-[#8b7355]">
				<HashIcon class="size-4" />
			</div>
			<Text variant="body-sm" color="primary" weight="bold" class="tracking-tight uppercase">
				Lote: {lote.codigo_lote}
			</Text>
		</div>
	</div>

	<!-- Info Grid -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<!-- Proveedor -->
		<div class="col-span-full flex items-center gap-2 rounded-lg bg-[#f8f5f0] p-2">
			<TruckIcon class="size-4 text-[#9a8060]" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-extrabold text-[#9a8060] uppercase">Proveedor</span>
				<span class="line-clamp-1 text-[0.75rem] font-bold text-[#1a1a2e]"
					>{lote.proveedor?.nombre || 'Sin proveedor'}</span
				>
			</div>
		</div>

		<!-- Costo Compra -->
		<div class="flex items-center gap-2 rounded-lg border border-[#e8e0d8] p-2">
			<CoinIcon class="size-4 text-[#9a8060]" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-extrabold text-[#9a8060] uppercase">Costo Compra</span>
				<span class="text-[0.8rem] font-black text-[#1a1a2e]">Bs. {lote.costo_compra_unitario}</span
				>
			</div>
		</div>

		<!-- Stock -->
		<div class="flex items-center gap-2 rounded-lg border border-[#e8e0d8] p-2">
			<div
				class="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600"
			>
				<span class="text-[0.5rem] font-bold">Σ</span>
			</div>
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-extrabold text-[#9a8060] uppercase">Stock Total</span>
				<span class="text-[0.8rem] font-black text-[#1a1a2e]">{lote.stock_lote_total || 0}</span>
			</div>
		</div>

		<!-- Fecha Ingreso -->
		<div class="flex items-center gap-2 rounded-lg border border-[#e8e0d8] p-2">
			<CalendarIcon class="size-4 text-[#9a8060]" />
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-extrabold text-[#9a8060] uppercase">Ingreso</span>
				<span class="text-[0.7rem] font-bold text-[#1a1a2e]">{formatDate(lote.fecha_ingreso)}</span>
			</div>
		</div>

		<!-- Fecha Vencimiento -->
		<div
			class="flex items-center gap-2 rounded-lg border p-2 {lote.fecha_vencimiento
				? 'border-[#e8e0d8]'
				: 'border-dashed border-[#e8e0d8]'}"
		>
			<CalendarIcon
				class="size-4 {lote.fecha_vencimiento ? 'text-red-500' : 'text-[#9a8060] opacity-50'}"
			/>
			<div class="flex flex-col">
				<span class="text-[0.55rem] font-extrabold text-[#9a8060] uppercase">Vencimiento</span>
				<span
					class="text-[0.7rem] font-bold {lote.fecha_vencimiento
						? 'text-red-600'
						: 'text-gray-400'}"
				>
					{lote.fecha_vencimiento ? formatDate(lote.fecha_vencimiento) : 'No maneja'}
				</span>
			</div>
		</div>
	</div>

	<!-- Distribuciones -->
	{#if lote.stock_distribuciones && lote.stock_distribuciones.length > 0}
		<div class="mt-1 flex flex-col gap-2 rounded-xl bg-[#f8f5f0] p-3">
			<span class="text-[0.55rem] font-black tracking-widest text-[#9a8060] uppercase"
				>Distribución por Ubicación</span
			>
			<div class="flex flex-col gap-2">
				{#each lote.stock_distribuciones as dist (dist.id)}
					<div
						class="flex items-center justify-between border-b border-[#e8e0d8]/50 pb-1 last:border-0 last:pb-0"
					>
						<div class="flex items-center gap-2">
							<div class="h-1 w-1 rounded-full bg-[#b09475]"></div>
							<div class="flex flex-col">
								<span class="text-[0.7rem] font-bold text-[#1a1a2e]">{dist.ubicacion?.nombre}</span>
								<span class="text-[0.55rem] font-medium text-[#9a8060]"
									>{dist.ubicacion?.tipo_area}</span
								>
							</div>
						</div>
						<span class="text-[0.75rem] font-black text-[#8b7355]">{dist.cantidad_actual}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
