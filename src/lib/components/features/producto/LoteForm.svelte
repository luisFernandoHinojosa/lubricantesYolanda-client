<script lang="ts">
	import { onMount } from 'svelte';
	import { proveedoresService, ubicacionService } from '$lib/services';
	import type {
		Lote,
		CreateLoteDto,
		UpdateLoteDto,
		Proveedor,
		Ubicacion,
		UbicacionFisica
	} from '$lib/interfaces';
	import { Button } from '$lib/components/ui';
	import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from '$lib/icons/outline';
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

	let ubicaciones = $state<Ubicacion[]>([]);
	let isLoadingUbicaciones = $state(false);
	let ubicacionesFisicas = $state<Record<string, UbicacionFisica[]>>({});

	let distribuciones = $state<
		{
			id_ubicacion: string;
			id_ubicacion_fisica: string;
			cantidad: number;
		}[]
	>([]);

	let form = $state({
		id_proveedor: '',
		costo_compra_unitario: 0,
		fecha_vencimiento: '',
		fecha_ingreso: new Date().toISOString().split('T')[0]
	});

	onMount(async () => {
		isLoadingProveedores = true;
		isLoadingUbicaciones = true;
		try {
			const [provs, ubics] = await Promise.all([
				proveedoresService.getProveedoresCatalogo(),
				ubicacionService.getUbicacionesCatalogo()
			]);
			proveedores = provs;
			ubicaciones = ubics;

			if (isEdit && lote) {
				form = {
					id_proveedor: lote.id_proveedor,
					costo_compra_unitario: Number(lote.costo_compra_unitario),
					fecha_vencimiento: lote.fecha_vencimiento ? lote.fecha_vencimiento.split('T')[0] : '',
					fecha_ingreso: lote.fecha_ingreso ? lote.fecha_ingreso.split('T')[0] : ''
				};
			} else if (!isEdit) {
				distribuciones = [{ id_ubicacion: '', id_ubicacion_fisica: '', cantidad: 0 }];
			}
		} catch (error) {
			console.error('Error loading catalogs:', error);
		} finally {
			isLoadingProveedores = false;
			isLoadingUbicaciones = false;
		}
	});

	async function handleUbicacionChange(index: number) {
		const id_ubicacion = distribuciones[index].id_ubicacion;
		distribuciones[index].id_ubicacion_fisica = '';
		if (!id_ubicacion || ubicacionesFisicas[id_ubicacion]) return;
		try {
			const fisicas = await ubicacionService.getUbicacionesFisicasByUbicacion(id_ubicacion);
			ubicacionesFisicas[id_ubicacion] = fisicas;
		} catch (e) {
			console.error('Error loading physical locations:', e);
		}
	}

	function addDistribucion() {
		distribuciones = [
			...distribuciones,
			{ id_ubicacion: '', id_ubicacion_fisica: '', cantidad: 0 }
		];
	}

	function removeDistribucion(index: number) {
		distribuciones = distribuciones.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		const payload: CreateLoteDto = {
			...form,
			id_producto,
			fecha_vencimiento: form.fecha_vencimiento || null
		};

		if (!isEdit && distribuciones.length > 0) {
			payload.distribuciones = distribuciones.map((d) => ({
				id_ubicacion: d.id_ubicacion,
				id_ubicacion_fisica: d.id_ubicacion_fisica || null,
				cantidad: Number(d.cantidad)
			}));
		}

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

	<!-- Distribuciones (Solo Creación) -->
	{#if !isEdit}
		<div class="mt-2 flex flex-col gap-4 border-t border-[#e8e0d8] pt-4">
			<div class="flex items-center justify-between">
				<h3 class="text-[0.75rem] font-black tracking-widest text-[#9a8060] uppercase">
					Distribución Inicial de Stock
				</h3>
				<Button variant="ghost" size="sm" onclick={addDistribucion} type="button">
					{#snippet leftIcon()}
						<PlusIcon class="size-4" />
					{/snippet}
					Agregar Ubicación
				</Button>
			</div>

			<div class="flex flex-col gap-3">
				{#each distribuciones as dist, i}
					<div
						class="grid grid-cols-[1fr_1fr_100px_auto] items-end gap-3 rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] p-3"
					>
						<div class="flex flex-col gap-1.5">
							<label
								class="text-[0.6rem] font-bold text-[#b09475] uppercase"
								for={`ubicacion-${i}`}
							>
								Ubicación *
							</label>
							<select
								id={`ubicacion-${i}`}
								bind:value={dist.id_ubicacion}
								onchange={() => handleUbicacionChange(i)}
								required
								class="w-full cursor-pointer rounded-lg border-[1.5px] border-[#e8e0d8] bg-white px-3 py-2 text-sm font-medium text-[#1a1a2e] outline-none focus:border-[#b09475]"
							>
								<option value="" disabled>Seleccionar...</option>
								{#each ubicaciones as ubic}
									<option value={ubic.id}>{ubic.nombre} ({ubic.tipo_area})</option>
								{/each}
							</select>
						</div>

						<div class="flex flex-col gap-1.5">
							<label class="text-[0.6rem] font-bold text-[#b09475] uppercase" for={`fisica-${i}`}>
								Ubicación Física (Opc)
							</label>
							<select
								id={`fisica-${i}`}
								bind:value={dist.id_ubicacion_fisica}
								disabled={!dist.id_ubicacion || !ubicacionesFisicas[dist.id_ubicacion]}
								class="w-full cursor-pointer rounded-lg border-[1.5px] border-[#e8e0d8] bg-white px-3 py-2 text-sm font-medium text-[#1a1a2e] outline-none focus:border-[#b09475] disabled:cursor-not-allowed disabled:bg-gray-50"
							>
								<option value="">Ninguna</option>
								{#if dist.id_ubicacion && ubicacionesFisicas[dist.id_ubicacion]}
									{#each ubicacionesFisicas[dist.id_ubicacion] as fis}
										<option value={fis.id}>{fis.nombre}</option>
									{/each}
								{/if}
							</select>
						</div>

						<div class="flex flex-col gap-1.5">
							<label class="text-[0.6rem] font-bold text-[#b09475] uppercase" for={`cantidad-${i}`}>
								Cantidad *
							</label>
							<input
								id={`cantidad-${i}`}
								type="number"
								min="1"
								step="1"
								bind:value={dist.cantidad}
								required
								class="w-full rounded-lg border-[1.5px] border-[#e8e0d8] bg-white px-3 py-2 text-sm font-medium text-[#1a1a2e] outline-none focus:border-[#b09475]"
							/>
						</div>

						<button
							type="button"
							onclick={() => removeDistribucion(i)}
							disabled={distribuciones.length === 1}
							class="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<TrashIcon class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

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
