<script lang="ts">
	import { onMount } from 'svelte';
	import { proveedoresService } from '$lib/services';
	import type { Lote, CreateLoteDto, UpdateLoteDto, Proveedor } from '$lib/interfaces';
	import { Button } from '$lib/components/ui';
	import { CheckIcon, HashIcon, XMarkIcon } from '$lib/icons/outline';
	import { CalendarIcon, CoinIcon, TruckIcon } from '$lib/icons/solid';

	interface Props {
		lote?: Lote | null;
		id_producto: string;
		isEdit?: boolean;
		loading?: boolean;
		onSave: (data: CreateLoteDto | UpdateLoteDto) => Promise<void>;
		onCancel: () => void;
	}

	let { lote, id_producto, isEdit = false, loading = false, onSave, onCancel }: Props = $props();

	let proveedores = $state<Proveedor[]>([]);
	let isLoadingProveedores = $state(false);

	let form = $state({
		codigo_lote: '',
		id_proveedor: '',
		costo_compra_unitario: 0,
		fecha_vencimiento: '',
		fecha_ingreso: new Date().toISOString().split('T')[0]
	});

	onMount(async () => {
		isLoadingProveedores = true;
		try {
			proveedores = await proveedoresService.getProveedoresCatalogo();
			if (isEdit && lote) {
				form = {
					codigo_lote: lote.codigo_lote,
					id_proveedor: lote.id_proveedor,
					costo_compra_unitario: Number(lote.costo_compra_unitario),
					fecha_vencimiento: lote.fecha_vencimiento ? lote.fecha_vencimiento.split('T')[0] : '',
					fecha_ingreso: lote.fecha_ingreso ? lote.fecha_ingreso.split('T')[0] : ''
				};
			}
		} catch (error) {
			console.error('Error loading catalogs:', error);
		} finally {
			isLoadingProveedores = false;
		}
	});

	function handleSubmit() {
		const payload: CreateLoteDto = {
			...form,
			id_producto,
			fecha_vencimiento: form.fecha_vencimiento || null
		};
		onSave(payload);
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSubmit();
	}}
	class="flex flex-col gap-6"
>
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
		<!-- Código de Lote -->
		<div class="col-span-full flex flex-col gap-2">
			<label
				class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase"
				for="codigo_lote"
			>
				Código de Lote *
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#b09475]">
					<HashIcon class="size-4" />
				</div>
				<input
					id="codigo_lote"
					type="text"
					bind:value={form.codigo_lote}
					required
					placeholder="Ej: LOTE-2024-001"
					class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] py-2.5 pr-4 pl-10 text-sm font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
				/>
			</div>
		</div>

		<!-- Proveedor -->
		<div class="col-span-full flex flex-col gap-2">
			<label
				class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase"
				for="id_proveedor"
			>
				Proveedor *
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#b09475]">
					<TruckIcon class="size-4" />
				</div>
				{#if isLoadingProveedores}
					<div class="h-10 w-full animate-pulse rounded-xl bg-[#f5f0e8]"></div>
				{:else}
					<select
						id="id_proveedor"
						bind:value={form.id_proveedor}
						required
						class="w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] py-2.5 pr-10 pl-10 text-sm font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
					>
						<option value="" disabled>Seleccionar proveedor...</option>
						{#each proveedores as prov, index (index)}
							<option value={prov.id}>{prov.nombre}</option>
						{/each}
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#b09475]"
					>
						<svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
							<path
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							/>
						</svg>
					</div>
				{/if}
			</div>
		</div>

		<!-- Costo Compra -->
		<div class="flex flex-col gap-2">
			<label
				class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase"
				for="costo_compra"
			>
				Costo Compra *
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#b09475]">
					<CoinIcon class="size-4" />
				</div>
				<input
					id="costo_compra"
					type="number"
					step="0.01"
					min="0"
					bind:value={form.costo_compra_unitario}
					required
					class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] py-2.5 pr-4 pl-10 text-sm font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
				/>
			</div>
		</div>

		<!-- Fecha Ingreso -->
		<div class="flex flex-col gap-2">
			<label
				class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase"
				for="fecha_ingreso"
			>
				Fecha de Ingreso *
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#b09475]">
					<CalendarIcon class="size-4" />
				</div>
				<input
					id="fecha_ingreso"
					type="date"
					bind:value={form.fecha_ingreso}
					required
					class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] py-2.5 pr-4 pl-10 text-sm font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
				/>
			</div>
		</div>

		<!-- Fecha Vencimiento -->
		<div class="col-span-full flex flex-col gap-2">
			<label
				class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase"
				for="fecha_vencimiento"
			>
				Fecha de Vencimiento (Opcional)
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#b09475]">
					<CalendarIcon class="size-4" />
				</div>
				<input
					id="fecha_vencimiento"
					type="date"
					bind:value={form.fecha_vencimiento}
					class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] py-2.5 pr-4 pl-10 text-sm font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
				/>
			</div>
			<p class="text-[0.65rem] text-gray-400 italic">
				Dejar vacío si el producto no tiene fecha de caducidad.
			</p>
		</div>
	</div>

	<!-- Acciones -->
	<div class="mt-4 flex items-center justify-end gap-3 border-t border-[#e8e0d8] pt-6">
		<Button variant="ghost" onclick={onCancel} disabled={loading}>
			{#snippet leftIcon()}
				<XMarkIcon class="size-4" />
			{/snippet}
			Cancelar
		</Button>
		<Button type="submit" variant="primary" {loading}>
			{#snippet leftIcon()}
				<CheckIcon class="size-4" />
			{/snippet}
			{isEdit ? 'Actualizar Lote' : 'Registrar Lote'}
		</Button>
	</div>
</form>
