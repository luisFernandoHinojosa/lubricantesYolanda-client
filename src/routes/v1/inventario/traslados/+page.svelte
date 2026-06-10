<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import { Heading, Button, Input, Select, Card } from '$lib/components/ui';
	import {
		BoxIcon,
		PackageIcon,
		CheckIcon,
		LoaderIcon,
		MapPinIcon,
		ZoomIcon,
		TagIcon,
		PlusIcon,
		SearchIcon,
		RefreshIcon
	} from '$lib/icons/outline';
	import { alert } from '$lib/utils';

	import {
		productoService,
		sucursalService,
		ubicacionService,
		stockDistribucionService
	} from '$lib/services';

	import type { Producto, Sucursal, Ubicacion, UbicacionFisica } from '$lib/interfaces';

	// Catalogs state
	let isLoadingCatalogs = $state(true);
	let sucursales = $state<Sucursal[]>([]);
	let ubicacionesFull = $state<Ubicacion[]>([]);
	let estantesFull = $state<UbicacionFisica[]>([]);

	// Search state
	let searchProd = $state('');
	let showDropdown = $state(false);
	let isSearching = $state(false);
	let filteredProducts = $state<Producto[]>([]);
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Selected product state
	let selectedProducto = $state<Producto | null>(null);
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

	// Load global catalogs
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

	// Dynamic Search Effect
	$effect(() => {
		if (searchProd.length > 1 && !selectedProducto) {
			clearTimeout(searchTimeout);
			isSearching = true;
			searchTimeout = setTimeout(async () => {
				try {
					const prodRes = await productoService.getProductos({ search: searchProd, perPage: 20 });
					filteredProducts = prodRes.data?.productos || [];
				} catch (error) {
					console.error('Error searching products:', error);
					filteredProducts = [];
				} finally {
					isSearching = false;
				}
			}, 300);
		} else {
			filteredProducts = [];
			isSearching = false;
		}
	});

	async function selectProduct(prod: Producto) {
		selectedProducto = prod;
		searchProd = '';
		showDropdown = false;

		// Load lots for this explicit product
		isLoadingLotes = true;
		try {
			const productWithLotes = await productoService.getProductoConLotes(prod.id!);
			selectedProducto = productWithLotes;
		} catch (e: any) {
			alert('error', 'No se pudieron recuperar los lotes de este producto.');
			selectedProducto = null;
		} finally {
			isLoadingLotes = false;
		}
	}

	function resetProductSelection() {
		selectedProducto = null;
		searchProd = '';
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
		(selectedProducto?.lotes || []).filter((l) => (l.stock_lote_total || 0) > 0)
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
			resetProductSelection();
		} catch (error: any) {
			console.error('Error al trasladar stock:', error);
			alert('error', error?.message || 'Hubo un error al procesar el traslado.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<Heading level="h4">Traspaso de Inventario</Heading>
			<p class="mt-1 text-sm text-gray-500">
				Busca un producto y transfiere stock disponible entre sucursales, áreas o estantes.
			</p>
		</div>
	</div>

	{#if isLoadingCatalogs}
		<div class="flex h-40 items-center justify-center">
			<LoaderIcon class="h-8 w-8 animate-spin text-blue-500" />
		</div>
	{:else}
		<!-- PASO 1: Selector de Producto (Si no hay producto escogido) -->
		{#if !selectedProducto}
			<Card class="mx-auto mt-8 max-w-2xl border-blue-100 bg-white p-6 shadow-sm">
				<div class="flex flex-col items-center justify-center space-y-4 py-8 text-center">
					<div class="rounded-full bg-blue-50 p-4 text-blue-500">
						<SearchIcon class="size-10" />
					</div>
					<Heading level="h5" class="text-gray-800">Seleccionar Producto</Heading>
					<p class="max-w-sm text-sm text-gray-500">
						Para iniciar un traslado, por favor selecciona el producto digitando su código de
						barras, nombre comercial o categoría.
					</p>

					<div class="relative mt-4 w-full max-w-md text-left">
						<Input
							placeholder="Escribe para buscar..."
							bind:value={searchProd}
							onfocus={() => (showDropdown = true)}
							onblur={() => setTimeout(() => (showDropdown = false), 200)}
							icon={ZoomIcon}
							class="w-full text-sm"
						/>
						{#if isSearching}
							<div class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
								<LoaderIcon class="size-4 animate-spin" />
							</div>
						{/if}
						{#if showDropdown && searchProd.length > 1}
							<div
								class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-light-four bg-white p-1 shadow-xl"
								in:slide
							>
								{#if isSearching}
									<div class="p-4 text-center text-xs text-gray-500">Buscando productos...</div>
								{:else if filteredProducts.length > 0}
									{#each filteredProducts as prod (prod.id)}
										<button
											type="button"
											onclick={() => selectProduct(prod)}
											class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
										>
											<div class="rounded bg-blue-100 p-1">
												<BoxIcon class="size-4 text-blue-600" />
											</div>
											<div class="flex-1 overflow-hidden">
												<p class="truncate text-xs font-bold text-gray-800">
													{prod.nombre_comercial}
												</p>
											</div>
											<PlusIcon class="size-4 text-blue-400" />
										</button>
									{/each}
								{:else}
									<div class="p-4 text-center text-xs text-gray-500">
										No se encontraron resultados
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</Card>
		{/if}

		<!-- PASO 2: Formulario de Traslado -->
		{#if selectedProducto}
			{#if isLoadingLotes}
				<div class="flex h-40 flex-col items-center justify-center space-y-3">
					<LoaderIcon class="h-8 w-8 animate-spin text-blue-500" />
					<span class="text-sm text-gray-500">Cargando disponibilidad de stock...</span>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-6" in:fade>
					<!-- Resumen Producto Elegido -->
					<div class="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
						<div class="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
								>
									<BoxIcon class="h-6 w-6" />
								</div>
								<div>
									<h2 class="text-lg font-bold text-gray-800">
										{selectedProducto.nombre_comercial}
									</h2>
									<p class="text-sm text-gray-500">
										{selectedProducto.codigo_barras || 'Sin código'}
									</p>
								</div>
							</div>
							<Button variant="outline" type="button" size="sm" onclick={resetProductSelection}>
								{#snippet leftIcon()}
									<RefreshIcon class="size-4" />
								{/snippet}
								Cambiar Producto
							</Button>
						</div>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Select label="SELECCIONAR LOTE A TRASLADAR" bind:value={loteSeleccionadoId} required>
								<option value="" disabled>-- SELECCIONAR LOTE --</option>
								{#each lotesConStock as lote}
									<option value={lote.id}>
										{lote.codigo_lote} (Disponible: {lote.stock_lote_total})
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
						<div class="rounded-xl border border-amber-100 bg-amber-50/20 p-6 shadow-sm">
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
									{#each availableOrigenSucursales as suc}
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
									{#each availableOrigenAreas as area}
										<option value={area.id}>{area.nombre} ({area.tipo_area})</option>
									{/each}
								</Select>

								<Select
									label="ESTANTE ORIGEN (OPCIONAL)"
									bind:value={origenEstanteId}
									disabled={!origenAreaId}
								>
									<option value="">-- NO ESPECIFICAR / ÁREA GENERAL --</option>
									{#each availableOrigenEstantes as est}
										<option value={est.id}>{est.nombre}</option>
									{/each}
								</Select>
							</div>
						</div>

						<!-- DESTINO -->
						<div class="rounded-xl border border-green-200 bg-green-50/20 p-6 shadow-sm">
							<div class="mb-4 flex items-center gap-2 border-b border-green-100/50 pb-2">
								<PackageIcon class="h-5 w-5 text-green-600" />
								<h3 class="font-bold text-green-900">Ubicación de Destino</h3>
							</div>

							<div class="space-y-4">
								<Select label="SUCURSAL DESTINO" bind:value={destinoSucursalId} required>
									<option value="" disabled>-- SELECCIONAR --</option>
									{#each sucursales as suc}
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
									{#each availableDestinoAreas as area}
										<option value={area.id}>{area.nombre} ({area.tipo_area})</option>
									{/each}
								</Select>

								<Select
									label="ESTANTE DESTINO (OPCIONAL)"
									bind:value={destinoEstanteId}
									disabled={!destinoAreaId}
								>
									<option value="">-- NO ESPECIFICAR / ÁREA GENERAL --</option>
									{#each availableDestinoEstantes as est}
										<option value={est.id}>{est.nombre}</option>
									{/each}
								</Select>
							</div>
						</div>
					</div>

					<!-- Observación y Acciones -->
					<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
						<Input
							label="MOTIVO U OBSERVACIÓN (OPCIONAL)"
							bind:value={observacion}
							placeholder="Ej: Traslado por falta de stock en tienda central..."
						/>

						<div
							class="mt-6 flex flex-col justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row"
						>
							<Button variant="outline" type="button" onclick={resetProductSelection}>
								Cancelar Traslado
							</Button>
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
								{#snippet leftIcon()}
									<CheckIcon class="mr-2 h-4 w-4" />
								{/snippet}
								Confirmar Traslado
							</Button>
						</div>
					</div>
				</form>
			{/if}
		{/if}
	{/if}
</div>
