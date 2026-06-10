<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Heading, Input, Select } from '$lib/components/ui';
	import { ArrowLeftIcon, ZoomIcon, XIcon, PlusIcon, CheckIcon } from '$lib/icons/outline';
	import { devolucionService } from '$lib/services';
	import { posService } from '$lib/services/pos.service';
	import { alert } from '$lib/utils';
	import type { VentaResponse, DetalleVentaResponse, ProductoPOS } from '$lib/interfaces/venta.interface';
	import type { CreateDevolucionDto, CreateCambioDto, CreateDevolucionItemDto, CreateCambioItemDto } from '$lib/interfaces/devolucion.interface';
	import { fade, slide } from 'svelte/transition';

	let {
		id_sesion_caja,
		loading = false,
		onSubmit,
		onCancel
	}: {
		id_sesion_caja: string;
		loading?: boolean;
		onSubmit: () => void;
		onCancel: () => void;
	} = $props();

	// ─── State ────────────────────────────────────────────────────────────────
	let currentStep = $state(1);
	let tipo: 'DEVOLUCION' | 'CAMBIO' = $state('DEVOLUCION');
	let motivo = $state('');
	let isSubmitting = $state(false);

	// Step 1: Search sale
	let searchQuery = $state('');
	let isSearching = $state(false);
	let ventaEncontrada = $state<VentaResponse | null>(null);
	let searchError = $state('');

	// Step 2: Select items
	interface ItemSelection {
		detalle: DetalleVentaResponse;
		selected: boolean;
		cantidad_devuelta: number;
		max_devolvible: number;
	}
	let itemSelections = $state<ItemSelection[]>([]);

	// Step 3 (CAMBIO): New products
	interface ItemCambio {
		id_detalle_venta: string;
		cantidad_devuelta: number;
		producto_original_nombre: string;
		subtotal_devuelto: number;
		// New product
		id_producto_nuevo: string;
		id_presentacion_nueva: string | null;
		cantidad_nueva: number;
		precio_nuevo: number;
		subtotal_nuevo: number;
		nombre_producto_nuevo: string;
		nombre_presentacion_nueva: string | null;
		// Product search state
		searchQuery: string;
		searchResults: ProductoPOS[];
		isSearching: boolean;
		productoSeleccionado: ProductoPOS | null;
	}
	let itemsCambio = $state<ItemCambio[]>([]);

	// ─── Step 1: Search Sale ──────────────────────────────────────────────────
	async function buscarVenta() {
		if (!searchQuery.trim()) return;
		try {
			isSearching = true;
			searchError = '';
			ventaEncontrada = await devolucionService.buscarVenta(searchQuery.trim());
			// Prepare item selections
			itemSelections = ventaEncontrada.detalles.map((d) => ({
				detalle: d,
				selected: false,
				cantidad_devuelta: parseFloat(d.cantidad),
				max_devolvible: parseFloat(d.cantidad)
			}));
		} catch (error: any) {
			searchError = error?.message || 'No se encontró la venta.';
			ventaEncontrada = null;
		} finally {
			isSearching = false;
		}
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			buscarVenta();
		}
	}

	// ─── Step 2: Item Selection ───────────────────────────────────────────────
	function toggleItem(index: number) {
		itemSelections[index].selected = !itemSelections[index].selected;
	}

	function getSelectedItems() {
		return itemSelections.filter((i) => i.selected);
	}

	let totalDevuelto = $derived(
		getSelectedItems().reduce((sum, item) => {
			const precio = parseFloat(item.detalle.precio_unitario);
			return sum + precio * item.cantidad_devuelta;
		}, 0)
	);

	let canProceedStep2 = $derived(getSelectedItems().length > 0);

	// ─── Step 3: Type Selection & CAMBIO Products ─────────────────────────────
	function prepareStep3() {
		if (tipo === 'CAMBIO') {
			itemsCambio = getSelectedItems().map((item) => ({
				id_detalle_venta: item.detalle.id,
				cantidad_devuelta: item.cantidad_devuelta,
				producto_original_nombre: item.detalle.producto.nombre_comercial,
				subtotal_devuelto: parseFloat(item.detalle.precio_unitario) * item.cantidad_devuelta,
				id_producto_nuevo: '',
				id_presentacion_nueva: null,
				cantidad_nueva: 1,
				precio_nuevo: 0,
				subtotal_nuevo: 0,
				nombre_producto_nuevo: '',
				nombre_presentacion_nueva: null,
				searchQuery: '',
				searchResults: [],
				isSearching: false,
				productoSeleccionado: null
			}));
		}
	}

	async function buscarProductoNuevo(index: number) {
		const q = itemsCambio[index].searchQuery;
		if (!q || q.length < 2) return;
		try {
			itemsCambio[index].isSearching = true;
			const results = await posService.buscarProductos(q, true);
			itemsCambio[index].searchResults = results;
		} catch {
			itemsCambio[index].searchResults = [];
		} finally {
			itemsCambio[index].isSearching = false;
		}
	}

	function seleccionarProductoNuevo(itemIndex: number, producto: ProductoPOS) {
		itemsCambio[itemIndex].id_producto_nuevo = producto.id;
		itemsCambio[itemIndex].nombre_producto_nuevo = producto.nombre_comercial;
		itemsCambio[itemIndex].precio_nuevo = producto.precio_venta || 0;
		itemsCambio[itemIndex].productoSeleccionado = producto;
		itemsCambio[itemIndex].id_presentacion_nueva = null;
		itemsCambio[itemIndex].nombre_presentacion_nueva = null;
		itemsCambio[itemIndex].searchResults = [];
		itemsCambio[itemIndex].searchQuery = '';
		recalcularSubtotalNuevo(itemIndex);
	}

	function seleccionarPresentacion(itemIndex: number, e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const producto = itemsCambio[itemIndex].productoSeleccionado;
		if (!producto) return;

		if (val) {
			const pres = producto.presentaciones.find((p) => p.id === val);
			if (pres) {
				itemsCambio[itemIndex].id_presentacion_nueva = pres.id;
				itemsCambio[itemIndex].nombre_presentacion_nueva = pres.nombre;
				itemsCambio[itemIndex].precio_nuevo = pres.precio_especial;
			}
		} else {
			itemsCambio[itemIndex].id_presentacion_nueva = null;
			itemsCambio[itemIndex].nombre_presentacion_nueva = null;
			itemsCambio[itemIndex].precio_nuevo = producto.precio_venta || 0;
		}
		recalcularSubtotalNuevo(itemIndex);
	}

	function recalcularSubtotalNuevo(index: number) {
		itemsCambio[index].subtotal_nuevo =
			itemsCambio[index].precio_nuevo * itemsCambio[index].cantidad_nueva;
	}

	function updateCantidadNueva(index: number, e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value) || 1;
		itemsCambio[index].cantidad_nueva = Math.max(1, val);
		recalcularSubtotalNuevo(index);
	}

	let totalNuevo = $derived(itemsCambio.reduce((sum, i) => sum + i.subtotal_nuevo, 0));
	let diferencia = $derived(totalNuevo - totalDevuelto);

	let canProceedStep3 = $derived(() => {
		if (tipo === 'DEVOLUCION') return true;
		return itemsCambio.every((i) => i.id_producto_nuevo !== '');
	});

	// ─── Submit ───────────────────────────────────────────────────────────────
	async function handleSubmit() {
		if (!ventaEncontrada || isSubmitting) return;
		isSubmitting = true;

		try {
			if (tipo === 'DEVOLUCION') {
				const payload: CreateDevolucionDto = {
					id_venta: ventaEncontrada.id,
					id_sesion_caja,
					items: getSelectedItems().map((i) => ({
						id_detalle_venta: i.detalle.id,
						cantidad_devuelta: i.cantidad_devuelta
					})),
					motivo: motivo || undefined,
					metodo_reembolso: 'EFECTIVO'
				};
				await devolucionService.crearDevolucion(payload);
				alert('success', 'Devolución registrada exitosamente.');
			} else {
				const payload: CreateCambioDto = {
					id_venta: ventaEncontrada.id,
					id_sesion_caja,
					items: itemsCambio.map((i) => ({
						id_detalle_venta: i.id_detalle_venta,
						cantidad_devuelta: i.cantidad_devuelta,
						id_producto_nuevo: i.id_producto_nuevo,
						id_presentacion_nueva: i.id_presentacion_nueva,
						cantidad_nueva: i.cantidad_nueva
					})),
					motivo: motivo || undefined,
					metodo_reembolso: 'EFECTIVO'
				};
				await devolucionService.crearCambio(payload);
				alert('success', 'Cambio de producto registrado exitosamente.');
			}
			onSubmit();
		} catch (error: any) {
			const msg = error?.message || 'Error al procesar la operación.';
			alert('error', msg);
		} finally {
			isSubmitting = false;
		}
	}

	// ─── Navigation ───────────────────────────────────────────────────────────
	function nextStep() {
		if (currentStep === 2) {
			prepareStep3();
		}
		currentStep = Math.min(currentStep + 1, 4);
	}

	function prevStep() {
		currentStep = Math.max(currentStep - 1, 1);
	}

	function formatCurrency(amount: number | string) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
			Number(amount)
		);
	}
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<button
			onclick={onCancel}
			class="flex items-center justify-center rounded-xl bg-light-one_d p-2.5 text-light-two transition-colors hover:bg-light-four hover:text-light-black"
		>
			<ArrowLeftIcon class="size-5" />
		</button>
		<div>
			<Heading level="h4">Nueva Devolución / Cambio</Heading>
			<p class="mt-1 text-sm text-light-two">
				Procesa devoluciones o cambios de productos vendidos
			</p>
		</div>
	</div>

	<!-- Progress Bar -->
	<div class="relative">
		<div class="flex items-center justify-between">
			{#each [
				{ n: 1, label: 'Buscar Venta' },
				{ n: 2, label: 'Seleccionar Items' },
				{ n: 3, label: 'Tipo y Detalle' },
				{ n: 4, label: 'Confirmar' }
			] as step}
				<div class="flex flex-1 flex-col items-center gap-2">
					<div
						class="flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300
						{currentStep >= step.n
							? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
							: 'border-light-four bg-light-one text-light-two'}"
					>
						{#if currentStep > step.n}
							<CheckIcon class="size-5" />
						{:else}
							{step.n}
						{/if}
					</div>
					<span
						class="text-xs font-semibold transition-colors {currentStep >= step.n
							? 'text-amber-600'
							: 'text-light-two'}"
					>
						{step.label}
					</span>
				</div>
				{#if step.n < 4}
					<div
						class="hidden h-0.5 flex-1 rounded-full transition-all duration-500 sm:block
						{currentStep > step.n ? 'bg-amber-500' : 'bg-light-four'}"
					></div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Step Content -->
	<div
		class="rounded-2xl border border-light-four bg-light-one p-6 shadow-sm transition-all duration-300"
	>
		<!-- ═══ STEP 1: Search Sale ═══ -->
		{#if currentStep === 1}
			<div in:fade class="space-y-6">
				<div>
					<h3 class="text-lg font-bold text-light-black">Buscar Venta Original</h3>
					<p class="mt-1 text-sm text-light-two">
						Ingresa el número de comprobante de la venta para buscarla
					</p>
				</div>

				<div class="flex gap-3">
					<div class="relative flex-1">
						<Input
							id="search-venta"
							type="text"
							label="Número de comprobante"
							bind:value={searchQuery}
							onkeydown={handleSearchKeydown}
							placeholder="Ej: VTA-XXXX-20260403-0001"
							icon={ZoomIcon}
						/>
					</div>
					<div class="flex items-end">
						<Button
							variant="primary"
							onclick={buscarVenta}
							disabled={isSearching || !searchQuery.trim()}
							class="border-amber-500 bg-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-600"
						>
							{isSearching ? 'Buscando...' : 'Buscar'}
						</Button>
					</div>
				</div>

				{#if searchError}
					<div
						class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
						in:slide
					>
						<div class="flex items-center gap-2">
							<XIcon class="size-5 text-red-500" />
							{searchError}
						</div>
					</div>
				{/if}

				{#if ventaEncontrada}
					<div
						class="space-y-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5"
						in:slide
					>
						<div class="flex items-center gap-2">
							<CheckIcon class="size-5 text-green-600" />
							<span class="text-sm font-bold text-green-700">Venta encontrada</span>
						</div>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div>
								<span class="text-[10px] font-bold tracking-wider text-green-600/70 uppercase"
									>Comprobante</span
								>
								<p class="mt-0.5 text-sm font-bold text-green-900">
									{ventaEncontrada.numero_comprobante}
								</p>
							</div>
							<div>
								<span class="text-[10px] font-bold tracking-wider text-green-600/70 uppercase"
									>Total</span
								>
								<p class="mt-0.5 text-sm font-bold text-green-900">
									{formatCurrency(ventaEncontrada.total)}
								</p>
							</div>
							<div>
								<span class="text-[10px] font-bold tracking-wider text-green-600/70 uppercase"
									>Cliente</span
								>
								<p class="mt-0.5 text-sm font-bold text-green-900">
									{ventaEncontrada.cliente
										? `${ventaEncontrada.cliente.nombre} ${ventaEncontrada.cliente.apellido_paterno}`
										: 'Público General'}
								</p>
							</div>
							<div>
								<span class="text-[10px] font-bold tracking-wider text-green-600/70 uppercase"
									>Items</span
								>
								<p class="mt-0.5 text-sm font-bold text-green-900">
									{ventaEncontrada.detalles.length} producto(s)
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

		<!-- ═══ STEP 2: Select Items ═══ -->
		{:else if currentStep === 2}
			<div in:fade class="space-y-6">
				<div>
					<h3 class="text-lg font-bold text-light-black">Seleccionar Productos</h3>
					<p class="mt-1 text-sm text-light-two">
						Marca los productos que se van a devolver y ajusta las cantidades
					</p>
				</div>

				<div class="space-y-3">
					{#each itemSelections as item, index (item.detalle.id)}
						<div
							class="group flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center
							{item.selected
								? 'border-amber-300 bg-amber-50/50 shadow-sm'
								: 'border-light-four bg-light-one hover:border-light-three hover:bg-light-one_d'}"
						>
							<!-- Checkbox -->
							<button
								onclick={() => toggleItem(index)}
								class="flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all
								{item.selected
									? 'border-amber-500 bg-amber-500 text-white'
									: 'border-light-three bg-light-one'}"
							>
								{#if item.selected}
									<CheckIcon class="size-4" />
								{/if}
							</button>

							<!-- Product Info -->
							<div class="min-w-0 flex-1">
								<p class="font-bold text-light-black">
									{item.detalle.producto.nombre_comercial}
								</p>
								<div class="mt-1 flex flex-wrap gap-2">
									{#if item.detalle.presentacion}
										<span
											class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
										>
											{item.detalle.presentacion.nombre}
										</span>
									{/if}
									<span
										class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
									>
										Precio: {formatCurrency(item.detalle.precio_unitario)}
									</span>
									{#if item.detalle.numero_serie}
										<span
											class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700"
										>
											Serie: {item.detalle.numero_serie}
										</span>
									{/if}
								</div>
							</div>

							<!-- Quantity -->
							<div class="flex items-center gap-3">
								<div class="text-right">
									<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
										>Cantidad</span
									>
									<div class="flex items-center gap-2">
										<input
											type="number"
											min="1"
											max={item.max_devolvible}
											step="1"
											class="w-20 rounded-lg border border-light-four bg-light-one_d px-3 py-1.5 text-center text-sm font-bold text-light-black outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
											bind:value={item.cantidad_devuelta}
											disabled={!item.selected}
										/>
										<span class="text-xs text-light-two">/ {item.max_devolvible}</span>
									</div>
								</div>
								{#if item.selected}
									<div class="text-right" in:fade>
										<span class="text-[10px] font-bold tracking-wider text-amber-600 uppercase"
											>Subtotal</span
										>
										<p class="text-sm font-bold text-amber-700">
											{formatCurrency(
												parseFloat(item.detalle.precio_unitario) * item.cantidad_devuelta
											)}
										</p>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				{#if canProceedStep2}
					<div
						class="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4"
						in:slide
					>
						<span class="text-sm font-bold text-amber-800">
							{getSelectedItems().length} producto(s) seleccionado(s)
						</span>
						<span class="text-lg font-black text-amber-700">
							{formatCurrency(totalDevuelto)}
						</span>
					</div>
				{/if}
			</div>

		<!-- ═══ STEP 3: Type and Exchange Products ═══ -->
		{:else if currentStep === 3}
			<div in:fade class="space-y-6">
				<div>
					<h3 class="text-lg font-bold text-light-black">Tipo de Operación</h3>
					<p class="mt-1 text-sm text-light-two">
						Selecciona si es una devolución o un cambio de producto
					</p>
				</div>

				<!-- Type Toggle -->
				<div class="flex gap-3">
					<button
						onclick={() => { tipo = 'DEVOLUCION'; prepareStep3(); }}
						class="flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200
						{tipo === 'DEVOLUCION'
							? 'border-red-400 bg-red-50 shadow-lg shadow-red-500/10'
							: 'border-light-four bg-light-one hover:border-light-three'}"
					>
						<div
							class="flex size-14 items-center justify-center rounded-2xl
							{tipo === 'DEVOLUCION' ? 'bg-red-100 text-red-600' : 'bg-light-one_d text-light-two'}"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="size-7" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M9 14l-4 -4l4 -4"></path>
								<path d="M5 10h11a4 4 0 1 1 0 8h-1"></path>
							</svg>
						</div>
						<div class="text-center">
							<p class="font-bold {tipo === 'DEVOLUCION' ? 'text-red-700' : 'text-light-black'}">
								Devolución
							</p>
							<p class="mt-1 text-xs text-light-two">
								Reembolso en efectivo
							</p>
						</div>
					</button>

					<button
						onclick={() => { tipo = 'CAMBIO'; prepareStep3(); }}
						class="flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200
						{tipo === 'CAMBIO'
							? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-500/10'
							: 'border-light-four bg-light-one hover:border-light-three'}"
					>
						<div
							class="flex size-14 items-center justify-center rounded-2xl
							{tipo === 'CAMBIO' ? 'bg-blue-100 text-blue-600' : 'bg-light-one_d text-light-two'}"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="size-7" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M7 10h14l-4 -4"></path>
								<path d="M17 14h-14l4 4"></path>
							</svg>
						</div>
						<div class="text-center">
							<p class="font-bold {tipo === 'CAMBIO' ? 'text-blue-700' : 'text-light-black'}">
								Cambio
							</p>
							<p class="mt-1 text-xs text-light-two">
								Cambiar por otro producto
							</p>
						</div>
					</button>
				</div>

				<!-- CAMBIO: New Product Selection -->
				{#if tipo === 'CAMBIO'}
					<div class="space-y-4" in:slide>
						<h4 class="text-sm font-bold text-light-black uppercase">
							Seleccionar nuevos productos
						</h4>

						{#each itemsCambio as item, idx (item.id_detalle_venta)}
							<div
								class="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4"
							>
								<!-- Original product summary -->
								<div class="mb-3 flex items-center justify-between">
									<div>
										<span class="text-[10px] font-bold tracking-wider text-red-500 uppercase"
											>Devuelve:</span
										>
										<span class="ml-2 text-sm font-bold text-light-black">
											{item.producto_original_nombre}
										</span>
										<span class="ml-1 text-xs text-light-two">
											× {item.cantidad_devuelta}
										</span>
									</div>
									<span class="text-sm font-bold text-red-600">
										-{formatCurrency(item.subtotal_devuelto)}
									</span>
								</div>

								<div class="border-t border-blue-200 pt-3">
									<span class="text-[10px] font-bold tracking-wider text-blue-600 uppercase"
										>Recibe:</span
									>

									{#if !item.productoSeleccionado}
										<!-- Product search -->
										<div class="mt-2 flex gap-2">
											<div class="relative flex-1">
												<input
													type="text"
													placeholder="Buscar producto nuevo..."
													class="w-full rounded-lg border border-light-four bg-light-one px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
													bind:value={item.searchQuery}
													oninput={() => buscarProductoNuevo(idx)}
												/>
												{#if item.searchResults.length > 0}
													<div
														class="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-light-four bg-light-one shadow-xl"
														in:slide
													>
														{#each item.searchResults as prod (prod.id)}
															<button
																class="flex w-full items-center gap-3 border-b border-light-four px-4 py-3 text-left transition-colors last:border-0 hover:bg-blue-50"
																onclick={() =>
																	seleccionarProductoNuevo(idx, prod)}
															>
																<div>
																	<p class="text-sm font-bold text-light-black">
																		{prod.nombre_comercial}
																	</p>
																	<p class="text-xs text-light-two">
																		{formatCurrency(prod.precio_venta || 0)} — Stock: {prod.stock_disponible}
																	</p>
																</div>
															</button>
														{/each}
													</div>
												{/if}
											</div>
										</div>
									{:else}
										<!-- Selected product -->
										<div class="mt-2 flex flex-wrap items-center gap-3">
											<div class="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-blue-100 px-3 py-2">
												<span class="truncate text-sm font-bold text-blue-800">
													{item.nombre_producto_nuevo}
												</span>
												<button
													class="shrink-0 rounded-full p-0.5 text-blue-400 transition-colors hover:bg-blue-200 hover:text-blue-600"
													onclick={() => {
														itemsCambio[idx].productoSeleccionado = null;
														itemsCambio[idx].id_producto_nuevo = '';
														itemsCambio[idx].nombre_producto_nuevo = '';
														itemsCambio[idx].subtotal_nuevo = 0;
													}}
												>
													<XIcon class="size-4" />
												</button>
											</div>

											<!-- Presentation selector -->
											{#if item.productoSeleccionado.presentaciones.length > 0}
												<select
													class="rounded-lg border border-light-four bg-light-one px-3 py-2 text-sm outline-none focus:border-blue-400"
													onchange={(e) => seleccionarPresentacion(idx, e)}
												>
													<option value="">Unidad base</option>
													{#each item.productoSeleccionado.presentaciones as pres}
														<option value={pres.id}>{pres.nombre} - {formatCurrency(pres.precio_especial)}</option>
													{/each}
												</select>
											{/if}

											<!-- Quantity -->
											<input
												type="number"
												min="1"
												step="1"
												class="w-20 rounded-lg border border-light-four bg-light-one_d px-3 py-2 text-center text-sm font-bold outline-none focus:border-blue-400"
												value={item.cantidad_nueva}
												oninput={(e) => updateCantidadNueva(idx, e)}
											/>

											<span class="text-sm font-bold text-blue-700">
												{formatCurrency(item.subtotal_nuevo)}
											</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}

						<!-- Totals -->
						<div class="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
							<div class="flex justify-between text-sm">
								<span class="text-light-two">Total productos devueltos</span>
								<span class="font-bold text-red-600">-{formatCurrency(totalDevuelto)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-light-two">Total productos nuevos</span>
								<span class="font-bold text-blue-600">+{formatCurrency(totalNuevo)}</span>
							</div>
							<div class="border-t border-blue-200 pt-2">
								<div class="flex justify-between">
									<span class="font-bold text-light-black">Diferencia</span>
									<span
										class="text-lg font-black {diferencia > 0
											? 'text-amber-600'
											: diferencia < 0
												? 'text-green-600'
												: 'text-light-two'}"
									>
										{diferencia > 0
											? `Cliente paga ${formatCurrency(diferencia)}`
											: diferencia < 0
												? `Devolver ${formatCurrency(Math.abs(diferencia))}`
												: 'Sin diferencia'}
									</span>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- DEVOLUCION summary -->
					<div class="rounded-xl border border-red-200 bg-red-50 p-5" in:fade>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-bold text-red-800">Monto a reembolsar en efectivo</p>
								<p class="mt-1 text-xs text-red-600/70">
									Se devolverá el dinero al cliente en efectivo
								</p>
							</div>
							<span class="text-2xl font-black text-red-700">
								{formatCurrency(totalDevuelto)}
							</span>
						</div>
					</div>
				{/if}
			</div>

		<!-- ═══ STEP 4: Confirm ═══ -->
		{:else if currentStep === 4}
			<div in:fade class="space-y-6">
				<div>
					<h3 class="text-lg font-bold text-light-black">Confirmar Operación</h3>
					<p class="mt-1 text-sm text-light-two">Revisa los datos y confirma la operación</p>
				</div>

				<!-- Summary card -->
				<div
					class="rounded-xl border p-5 {tipo === 'DEVOLUCION'
						? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
						: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'}"
				>
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Tipo</span
							>
							<p class="mt-0.5 text-sm font-bold">
								<span
									class="rounded-full px-3 py-1 text-xs font-bold {tipo === 'DEVOLUCION'
										? 'bg-red-100 text-red-700'
										: 'bg-blue-100 text-blue-700'}"
								>
									{tipo}
								</span>
							</p>
						</div>
						<div>
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Venta Original</span
							>
							<p class="mt-0.5 text-sm font-bold text-light-black">
								{ventaEncontrada?.numero_comprobante}
							</p>
						</div>
						<div>
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Productos a devolver</span
							>
							<p class="mt-0.5 text-sm font-bold text-light-black">
								{getSelectedItems().length}
							</p>
						</div>
						<div>
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase">
								{tipo === 'DEVOLUCION' ? 'Monto a reembolsar' : 'Diferencia'}
							</span>
							<p class="mt-0.5 text-lg font-black {tipo === 'DEVOLUCION' ? 'text-red-700' : 'text-blue-700'}">
								{tipo === 'DEVOLUCION'
									? formatCurrency(totalDevuelto)
									: diferencia > 0
										? `+${formatCurrency(diferencia)}`
										: diferencia < 0
											? `-${formatCurrency(Math.abs(diferencia))}`
											: formatCurrency(0)}
							</p>
						</div>
					</div>
				</div>

				<!-- Items detail -->
				<div class="rounded-xl border border-light-four bg-light-one_d p-4">
					<h4 class="mb-3 text-xs font-bold tracking-wider text-light-two uppercase">
						Detalle de productos
					</h4>
					{#each getSelectedItems() as item (item.detalle.id)}
						<div class="flex items-center justify-between border-b border-light-four py-2 last:border-0">
							<div class="flex items-center gap-2">
								<span class="text-sm font-bold text-light-black">
									{item.detalle.producto.nombre_comercial}
								</span>
								{#if item.detalle.presentacion}
									<span
										class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
									>
										{item.detalle.presentacion.nombre}
									</span>
								{/if}
							</div>
							<div class="text-right">
								<span class="text-xs text-light-two">× {item.cantidad_devuelta}</span>
								<span class="ml-2 text-sm font-bold text-light-black">
									{formatCurrency(
										parseFloat(item.detalle.precio_unitario) * item.cantidad_devuelta
									)}
								</span>
							</div>
						</div>
					{/each}

					{#if tipo === 'CAMBIO'}
						<div class="mt-3 border-t-2 border-blue-200 pt-3">
							<h5 class="mb-2 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
								Productos nuevos
							</h5>
							{#each itemsCambio as item (item.id_detalle_venta)}
								<div class="flex items-center justify-between py-2">
									<span class="text-sm font-bold text-blue-700">
										{item.nombre_producto_nuevo}
										{#if item.nombre_presentacion_nueva}
											<span class="text-xs font-normal">({item.nombre_presentacion_nueva})</span>
										{/if}
									</span>
									<div class="text-right">
										<span class="text-xs text-light-two">× {item.cantidad_nueva}</span>
										<span class="ml-2 text-sm font-bold text-blue-700">
											{formatCurrency(item.subtotal_nuevo)}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Motivo -->
				<div>
					<label class="mb-2 block text-sm font-bold text-light-black" for="motivo-devolucion">
						Motivo (opcional)
					</label>
					<textarea
						id="motivo-devolucion"
						class="w-full rounded-xl border border-light-four bg-light-one_d px-4 py-3 text-sm text-light-black outline-none transition-colors placeholder:text-light-two focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
						rows="3"
						placeholder="Ej: Producto defectuoso, error en la compra..."
						bind:value={motivo}
					></textarea>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation Buttons -->
	<div class="flex items-center justify-between">
		<div>
			{#if currentStep > 1}
				<Button variant="outline" onclick={prevStep}>
					{#snippet leftIcon()}
						<ArrowLeftIcon class="size-4" />
					{/snippet}
					Anterior
				</Button>
			{/if}
		</div>

		<div class="flex gap-3">
			<Button variant="outline" onclick={onCancel}>Cancelar</Button>

			{#if currentStep < 4}
				<Button
					variant="primary"
					class="border-amber-500 bg-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-600"
					onclick={nextStep}
					disabled={(currentStep === 1 && !ventaEncontrada) ||
						(currentStep === 2 && !canProceedStep2)}
				>
					Siguiente
				</Button>
			{:else}
				<Button
					variant="primary"
					class="border-green-600 bg-green-600 shadow-lg shadow-green-600/20 hover:bg-green-700"
					onclick={handleSubmit}
					disabled={isSubmitting}
				>
					{#snippet leftIcon()}
						<CheckIcon class="size-5" />
					{/snippet}
					{isSubmitting
						? 'Procesando...'
						: tipo === 'DEVOLUCION'
							? 'Confirmar Devolución'
							: 'Confirmar Cambio'}
				</Button>
			{/if}
		</div>
	</div>
</div>
