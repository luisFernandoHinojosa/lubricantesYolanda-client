<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { Modal, Heading, Button, Input, Select, Card } from '$lib/components/ui';
	import { BoxIcon, PackageIcon, CheckIcon, LoaderIcon, MapPinIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';

	import {
		productoService,
		sucursalService,
		ubicacionService,
		stockDistribucionService
	} from '$lib/services';

	import type { Producto, Sucursal, Ubicacion, UbicacionFisica } from '$lib/interfaces';
	import { onMount, tick } from 'svelte';

	interface Props {
		isOpen: boolean;
		producto: Producto | null;
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { isOpen, producto, onClose, onSuccess }: Props = $props();

	// Catalogs state
	let isLoadingCatalogs = $state(true);
	let sucursales = $state<Sucursal[]>([]);
	let ubicacionesFull = $state<Ubicacion[]>([]);
	let estantesFull = $state<UbicacionFisica[]>([]);

	// Selected product state
	let currentProducto = $state<Producto | null>(null);
	let isLoadingLotes = $state(false);

	// Traslado Form
	let loteSeleccionadoId = $state<string>('');
	let origenSucursalId = $state<string>('');
	let origenAreaId = $state<string>('');
	let origenEstanteId = $state<string>('');

	let destinoSucursalId = $state<string>('');
	let destinoAreaId = $state<string>('');
	let destinoEstanteId = $state<string>('');

	let cantidad = $state<number | ''>('');
	let observacion = $state<string>('');
	let isSubmitting = $state(false);

	// Load global catalogs once
	onMount(async () => {
		try {
			const [sucData, ubicData, estData] = await Promise.all([
				sucursalService.getSucursalesActivas(),
				ubicacionService.getUbicacionesFull(),
				ubicacionService.getUbicacionFisicaCatalogo()
			]);

			sucursales = sucData?.sucursales || [];
			ubicacionesFull = Array.isArray(ubicData) ? ubicData : [];
			estantesFull = Array.isArray(estData) ? estData : (estData as any)?.data || [];
		} catch (error) {
			alert('error', 'Error al cargar los catálogos.');
			console.error(error);
		} finally {
			isLoadingCatalogs = false;
		}
	});

	// Reset form state when modal closes or opens with new product
	$effect(() => {
		if (isOpen && producto && (!currentProducto || currentProducto.id !== producto.id)) {
			loadProductWithLotes(producto);
		}
		if (!isOpen) {
			resetForm();
			currentProducto = null;
		}
	});

	async function loadProductWithLotes(prod: Producto) {
		isLoadingLotes = true;
		resetForm();
		try {
			const productWithLotes = await productoService.getProductoConLotes(prod.id!);
			currentProducto = productWithLotes;
		} catch (e: any) {
			alert('error', 'No se pudieron recuperar los lotes de este producto.');
			currentProducto = null;
			onClose();
		} finally {
			isLoadingLotes = false;
		}
	}

	function resetForm() {
		loteSeleccionadoId = '';
		origenSucursalId = '';
		origenAreaId = '';
		origenEstanteId = '';
		destinoSucursalId = '';
		destinoAreaId = '';
		destinoEstanteId = '';
		cantidad = '';
		observacion = '';
	}

	// Derived states based on selected product and form
	let lotesConStock = $derived(
		(currentProducto?.lotes || []).filter((l) => (l.stock_lote_total || 0) > 0)
	);
	let selectedLoteObj = $derived(lotesConStock.find((l) => l.id === loteSeleccionadoId) || null);

	let validDistribuciones = $derived(
		(selectedLoteObj?.stock_distribuciones || []).filter((d) => Number(d.cantidad_actual) > 0)
	);

	let availableOrigenSucursales = $derived.by(() => {
		if (!validDistribuciones.length) return [];
		const sucursalIds = new Set<string>();

		validDistribuciones.forEach((dist) => {
			const area = ubicacionesFull.find((u) => u.id === dist.id_ubicacion);
			if (area?.id_sucursal) sucursalIds.add(area.id_sucursal);
		});

		return sucursales.filter((s) => sucursalIds.has(s.id!));
	});

	let availableOrigenAreas = $derived.by(() => {
		if (!origenSucursalId || !validDistribuciones.length) return [];

		const validAreaIds = new Set(validDistribuciones.map((d) => d.id_ubicacion));
		return ubicacionesFull.filter(
			(u) => u.id_sucursal === origenSucursalId && validAreaIds.has(u.id!)
		);
	});

	let availableOrigenEstantes = $derived.by(() => {
		if (!origenAreaId || !validDistribuciones.length) return [];
		const validEstanteIds = new Set(
			validDistribuciones
				.filter((d) => d.id_ubicacion === origenAreaId && d.id_ubicacion_fisica)
				.map((d) => d.id_ubicacion_fisica)
		);
		return estantesFull.filter(
			(e) => e.id_ubicacion === origenAreaId && validEstanteIds.has(e.id!)
		);
	});

	let stockMaximo = $derived.by(() => {
		if (!origenAreaId) return 0;
		const dist = validDistribuciones.find(
			(d) =>
				d.id_ubicacion === origenAreaId &&
				(origenEstanteId ? d.id_ubicacion_fisica === origenEstanteId : !d.id_ubicacion_fisica)
		);
		return dist ? Number(dist.cantidad_actual) : 0;
	});

	let availableDestinoAreas = $derived.by(() => {
		if (!destinoSucursalId) return [];
		return ubicacionesFull.filter((u) => u.id_sucursal === destinoSucursalId);
	});

	let availableDestinoEstantes = $derived.by(() => {
		if (!destinoAreaId) return [];
		return estantesFull.filter((e) => e.id_ubicacion === destinoAreaId);
	});

	// Reset logic upon cascading modifications
	$effect(() => {
		if (loteSeleccionadoId) {
			origenSucursalId = '';
			origenAreaId = '';
			origenEstanteId = '';
		}
	});
	$effect(() => {
		if (origenSucursalId) {
			origenAreaId = '';
			origenEstanteId = '';
		}
	});
	$effect(() => {
		if (origenAreaId) {
			origenEstanteId = '';
		}
	});
	$effect(() => {
		if (destinoSucursalId) {
			destinoAreaId = '';
			destinoEstanteId = '';
		}
	});
	$effect(() => {
		if (destinoAreaId) {
			destinoEstanteId = '';
		}
	});

	// Auto selectors
	$effect(() => {
		if (loteSeleccionadoId && availableOrigenSucursales.length === 1 && !origenSucursalId) {
			origenSucursalId = availableOrigenSucursales[0].id!;
		}
	});

	$effect(() => {
		if (destinoSucursalId === '' && sucursales.length === 1) {
			destinoSucursalId = sucursales[0].id!;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!loteSeleccionadoId || !origenAreaId || !destinoAreaId || !cantidad) {
			return alert('error', 'Completa los campos obligatorios principales.');
		}
		if (Number(cantidad) <= 0) {
			return alert('error', 'La cantidad debe ser mayor a 0.');
		}
		if (Number(cantidad) > stockMaximo) {
			return alert(
				'error',
				`La cantidad no puede superar el disponible en el origen (${stockMaximo}).`
			);
		}
		if (origenAreaId === destinoAreaId && origenEstanteId === destinoEstanteId) {
			return alert('error', 'La ubicación de origen y destino no pueden ser exactamente iguales.');
		}

		try {
			isSubmitting = true;
			await stockDistribucionService.trasladarStock({
				id_lote: loteSeleccionadoId,
				id_ubicacion_origen: origenAreaId,
				id_ubicacion_fisica_origen: origenEstanteId || null,
				id_ubicacion_destino: destinoAreaId,
				id_ubicacion_fisica_destino: destinoEstanteId || null,
				cantidad: Number(cantidad),
				observacion
			});

			alert('success', 'El traslado se realizó de manera exitosa.');
			onSuccess?.();
		} catch (error: any) {
			alert('error', error || 'Hubo un error al procesar el traslado.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal {isOpen} {onClose} maxWidth="lg" title="Traspaso de Inventario">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
		<div>
			<Heading level="h4">Traspaso de Inventario</Heading>
			<p class="mt-1 text-sm text-gray-500">Transfiere stock disponible de este producto.</p>
		</div>
	</div>

	{#if isLoadingCatalogs || isLoadingLotes}
		<div class="flex h-40 flex-col items-center justify-center space-y-3">
			<LoaderIcon class="h-8 w-8 animate-spin text-blue-500" />
			<span class="text-sm text-gray-500">Cargando datos...</span>
		</div>
	{:else if currentProducto}
		<form onsubmit={handleSubmit} class="space-y-6" in:fade>
			<!-- Resumen Producto Elegido -->
			<div class="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
				<div class="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
					>
						<BoxIcon class="h-6 w-6" />
					</div>
					<div>
						<h2 class="text-lg font-bold text-gray-800">
							{currentProducto.nombre_comercial}
						</h2>
						<p class="text-sm text-gray-500">
							{currentProducto.codigo_barras || 'Sin código'}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Select label="SELECCIONAR LOTE A TRASLADAR" bind:value={loteSeleccionadoId} required>
						<option value="" disabled>-- SELECCIONAR LOTE --</option>
						{#each lotesConStock as lote, i (i)}
							<option value={lote.id}>
								{i + 1}. {lote.codigo_lote} (Disponible: {lote.stock_lote_total})
							</option>
						{/each}
					</Select>

					<div>
						<Input
							type="number"
							label="CANTIDAD A TRASLADAR"
							bind:value={cantidad}
							min="1"
							max={stockMaximo > 0 ? stockMaximo.toString() : ''}
							required
						/>
						{#if origenAreaId}
							<p class="mt-1.5 text-xs font-semibold text-gray-500">
								Stock exacto disponible en origen:
								<span class="ml-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-600"
									>{stockMaximo}</span
								>
							</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- ORIGEN -->
				<div class="rounded-xl border border-amber-100 bg-amber-50/20 p-4 shadow-sm">
					<div class="mb-4 flex items-center gap-2 border-b border-amber-100/50 pb-2">
						<MapPinIcon class="h-5 w-5 text-amber-500" />
						<h3 class="font-bold text-amber-900">Ubicación de Origen</h3>
					</div>

					<div class="space-y-4">
						<Select
							label="SUCURSAL ORIGEN"
							bind:value={origenSucursalId}
							required
							disabled={!loteSeleccionadoId}
						>
							<option value="" disabled>-- SELECCIONAR --</option>
							{#each availableOrigenSucursales as suc, index (index)}
								<option value={suc.id}>{suc.nombre}</option>
							{/each}
						</Select>

						<Select
							label="ÁREA ORIGEN"
							bind:value={origenAreaId}
							required
							disabled={!origenSucursalId}
						>
							<option value="" disabled>-- SELECCIONAR --</option>
							{#each availableOrigenAreas as area, index (index)}
								<option value={area.id}>{area.nombre} ({area.tipo_area})</option>
							{/each}
						</Select>

						<Select
							label="ESTANTE ORIGEN (OPCIONAL)"
							bind:value={origenEstanteId}
							disabled={!origenAreaId}
						>
							<option value="">-- NO ESPECIFICAR / ÁREA GENERAL --</option>
							{#each availableOrigenEstantes as est, index (index)}
								<option value={est.id}>{est.nombre}</option>
							{/each}
						</Select>
					</div>
				</div>

				<!-- DESTINO -->
				<div class="rounded-xl border border-green-200 bg-green-50/20 p-4 shadow-sm">
					<div class="mb-4 flex items-center gap-2 border-b border-green-100/50 pb-2">
						<PackageIcon class="h-5 w-5 text-green-600" />
						<h3 class="font-bold text-green-900">Ubicación de Destino</h3>
					</div>

					<div class="space-y-4">
						<Select label="SUCURSAL DESTINO" bind:value={destinoSucursalId} required>
							<option value="" disabled>-- SELECCIONAR --</option>
							{#each sucursales as suc, index (index)}
								<option value={suc.id}>{suc.nombre}</option>
							{/each}
						</Select>

						<Select
							label="ÁREA DESTINO"
							bind:value={destinoAreaId}
							required
							disabled={!destinoSucursalId}
						>
							<option value="" disabled>-- SELECCIONAR --</option>
							{#each availableDestinoAreas as area, index (index)}
								<option value={area.id}>{area.nombre} ({area.tipo_area})</option>
							{/each}
						</Select>

						<Select
							label="ESTANTE DESTINO (OPCIONAL)"
							bind:value={destinoEstanteId}
							disabled={!destinoAreaId}
						>
							<option value="">-- NO ESPECIFICAR / ÁREA GENERAL --</option>
							{#each availableDestinoEstantes as est, index (index)}
								<option value={est.id}>{est.nombre}</option>
							{/each}
						</Select>
					</div>
				</div>
			</div>

			<!-- Observación y Acciones -->
			<div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
				<Input
					label="MOTIVO U OBSERVACIÓN (OPCIONAL)"
					bind:value={observacion}
					placeholder="Ej: Traslado por falta de stock en tienda central..."
				/>

				<div class="mt-6 flex flex-col justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
					<Button variant="outline" type="button" onclick={onClose}>Cancelar</Button>
					<Button
						variant="primary"
						type="submit"
						disabled={isSubmitting ||
							stockMaximo === 0 ||
							!cantidad ||
							Number(cantidad) > stockMaximo ||
							!origenAreaId ||
							!destinoAreaId}
					>
						{#snippet lefticon()}
							<CheckIcon class="mr-2 h-4 w-4" />
						{/snippet}

						Confirmar Traslado jaja
					</Button>
				</div>
			</div>
		</form>
	{/if}
</Modal>
