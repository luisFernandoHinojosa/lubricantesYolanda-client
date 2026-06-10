<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { Input, Select, Heading, TextArea, Button } from '$lib/components/ui';
	import {
		ZoomIcon,
		TrashIcon,
		PlusIcon,
		CheckIcon,
		XIcon,
		ClipboardIcon,
		TagIcon,
		ShoppingCartIcon,
		LoaderIcon
	} from '$lib/icons/outline';
	import { CompraFormSkeleton } from '$lib/components/skeletons';

	import { alert } from '$lib/utils';
	import type {
		CreateCompraDto,
		DetalleCompra,
		Producto,
		Proveedor,
		ProveedorCatalogo,
		Sucursal,
		Ubicacion,
		UbicacionCatalogo,
		HistorialCostoLote
	} from '$lib/interfaces';
	import {
		productoService,
		proveedoresService,
		sucursalService,
		ubicacionService
	} from '$lib/services';

	interface Props {
		loading?: boolean;
		onSubmit: (data: CreateCompraDto) => Promise<void>;
		onCancel: () => void;
	}

	let { loading = false, onSubmit, onCancel }: Props = $props();

	let proveedores = $state<ProveedorCatalogo[]>([]);
	let sucursales = $state<Sucursal[]>([]);
	let ubicaciones = $state<UbicacionCatalogo[]>([]);
	let isLoadingCatalogs = $state(false);

	let compraData = $state<CreateCompraDto>({
		id_proveedor: '',
		id_sucursal: '',
		id_ubicacion_destino: '',
		numero_comprobante: '',
		estado_pago: 'PAGADO',
		notas: '',
		detalles: []
	});

	let searchProd = $state('');
	let showDropdown = $state(false);

	let ubicacionesFiltradas = $derived(
		compraData.id_sucursal
			? ubicaciones.filter((u) => u.id_sucursal === compraData.id_sucursal)
			: []
	);

	let filteredProducts = $state<Producto[]>([]);
	let isSearching = $state(false);

	let searchTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (searchProd.length > 1) {
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

	let granTotal = $derived(
		compraData.detalles.reduce((acc, curr) => acc + (Number(curr.subtotal) || 0), 0)
	);

	$effect(() => {
		// Reset location if branch changes
		if (compraData.id_sucursal) {
			// This effect handles the change implicitly via $derived
		}
	});

	onMount(async () => {
		isLoadingCatalogs = true;
		try {
			const [provRes, sucRes, ubRes] = await Promise.all([
				proveedoresService.getProveedoresCatalogo(),
				sucursalService.getSucursalesActivas(),
				ubicacionService.getUbicacionesCatalogo()
			]);

			proveedores = provRes || [];
			sucursales = sucRes.sucursales || [];
			ubicaciones = (ubRes || []) as unknown as UbicacionCatalogo[];
		} catch (error) {
			console.error('Error loading catalogs:', error);
			alert('error', 'No se pudieron cargar los catálogos necesarios');
		} finally {
			isLoadingCatalogs = false;
		}
	});

	function addProduct(prod: Producto) {
		const exists = compraData.detalles.find((d) => d.id_producto === prod.id);
		if (exists) {
			alert('warning', 'El producto ya está en la lista.');
			return;
		}
		const nuevoDetalle: DetalleCompra = {
			id_producto: prod.id!,
			producto: prod,
			cantidad: 1,
			costo_unitario: 0,
			subtotal: 0,
			fecha_vencimiento_lote: '',
			codigo_lote_provisto: '',
			precio_venta_actual: Number(prod.precio_venta) || 0,
			nuevo_precio_venta: Number(prod.precio_venta) || 0,
			show_config: false,
			historial_costos: [],
			cargando_historial: false
		};

		compraData.detalles.push(nuevoDetalle);

		searchProd = '';
		showDropdown = false;
	}

	function removeProduct(index: number) {
		compraData.detalles.splice(index, 1);
	}

	function updateSubtotal(index: number) {
		const item = compraData.detalles[index];
		item.subtotal = Number(item.cantidad) * Number(item.costo_unitario) || 0;
	}

	async function toggleConfigPrecio(index: number) {
		const item = compraData.detalles[index];
		item.show_config = !item.show_config;

		if (item.show_config && (!item.historial_costos || item.historial_costos.length === 0)) {
			item.cargando_historial = true;
			try {
				const res = await productoService.getHistorialCostos(item.id_producto);

				item.historial_costos = res || [];
			} catch (e) {
				console.error('Error cargando historial', e);
			} finally {
				item.cargando_historial = false;
			}
		}
	}

	function aplicarMargen(index: number, porcentaje: number) {
		const item = compraData.detalles[index];
		const costo = Number(item.costo_unitario);
		if (costo > 0) {
			item.nuevo_precio_venta = Number((costo * (1 + porcentaje / 100)).toFixed(2));
		}
	}

	async function handleSave() {
		if (loading) return;

		if (!compraData.id_proveedor || !compraData.id_sucursal || !compraData.id_ubicacion_destino) {
			return alert('error', 'Por favor completa los datos de la sucursal y proveedor');
		}

		if (compraData.detalles.length === 0) {
			return alert('error', 'Agrega al menos un producto a la compra');
		}

		// // Validar precio de venta sugerido
		// const sinPrecio = compraData.detalles.find(
		// 	(d) => !d.precio_venta_sugerido || Number(d.precio_venta_sugerido) <= 0
		// );
		// if (sinPrecio) {
		// 	return alert(
		// 		'error',
		// 		`El producto "${sinPrecio.producto?.nombre_comercial}" no tiene un precio de venta sugerido válido.`
		// 	);
		// }

		await onSubmit($state.snapshot(compraData));
	}
</script>

<div class="flex flex-col gap-6" in:fade>
	<div class="flex items-center justify-between">
		<Heading level="h4">Registrar Nueva Compra</Heading>
	</div>

	{#if isLoadingCatalogs}
		<CompraFormSkeleton />
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<div class="space-y-6 lg:col-span-3">
				<section
					class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm"
				>
					<div
						class="flex items-center justify-between border-b border-light-four bg-light-one_d p-3"
					>
						<div class="flex items-center gap-3">
							<div class="rounded-lg bg-red-100 p-2 text-red-600">
								<ClipboardIcon class="size-5" />
							</div>
							<h3 class="text-sm font-bold tracking-wider text-light-black uppercase">
								Datos del Comprobante
							</h3>
						</div>
					</div>

					<div class="p-4">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
							<div class="col-span-2 space-y-6">
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Input
										label="NRO. COMPROBANTE"
										placeholder="Ej: FAC-00123"
										bind:value={compraData.numero_comprobante}
									/>
									<Select label="PROVEEDOR" bind:value={compraData.id_proveedor} required>
										<option value="" disabled selected>-- SELECCIONAR --</option>
										{#each proveedores as p (p.id)}
											<option value={p.id}>{p.nombre}</option>
										{/each}
									</Select>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
									<Select label="SUCURSAL" bind:value={compraData.id_sucursal} required>
										<option value="" disabled selected>-- SELECCIONAR --</option>
										{#each sucursales as s (s.id)}
											<option value={s.id}>{s.nombre}</option>
										{/each}
									</Select>
									<Select
										label="UBICACIÓN DESTINO"
										bind:value={compraData.id_ubicacion_destino}
										required
										disabled={!compraData.id_sucursal}
									>
										<option value="" disabled selected>
											{compraData.id_sucursal ? '-- SELECCIONAR --' : '-- PRIMERO SUCURSAL --'}
										</option>
										{#each ubicacionesFiltradas as u (u.id)}
											<option value={u.id}>{u.nombre}</option>
										{/each}
									</Select>
									<Select label="ESTADO DE PAGO" bind:value={compraData.estado_pago}>
										<option value="PAGADO">Pagado</option>
										<option value="PENDIENTE">Pendiente</option>
										<option value="PAGADO_PARCIAL">Parcial</option>
									</Select>
								</div>
							</div>

							<div>
								<TextArea
									label="NOTAS / OBSERVACIONES"
									placeholder="Opcional..."
									bind:value={compraData.notas}
									rows={5}
								/>
							</div>
						</div>
					</div>
				</section>

				<section
					class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm"
				>
					<div
						class="flex items-center justify-between gap-4 border-b border-light-four bg-light-one_d px-4 py-4"
					>
						<div class="flex items-center gap-3">
							<div class="rounded-lg bg-red-100 p-2 text-red-600">
								<ShoppingCartIcon class="size-5" />
							</div>
							<h3 class="text-sm font-bold tracking-wider text-light-black uppercase">
								Productos de la Compra
							</h3>
						</div>

						<div class="relative flex-1">
							<Input
								placeholder="Buscar producto por nombre o código..."
								bind:value={searchProd}
								onfocus={() => (showDropdown = true)}
								onblur={() => setTimeout(() => (showDropdown = false), 200)}
								icon={ZoomIcon}
								class="h-9 text-xs"
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
												onclick={() => addProduct(prod)}
												class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-red-50"
											>
												<div class="rounded bg-gray-100 p-1">
													<TagIcon class="size-4 text-gray-500" />
												</div>
												<div class="flex-1 overflow-hidden">
													<p class="truncate text-xs font-bold text-gray-800">
														{prod.nombre_comercial}
													</p>
												</div>
												<PlusIcon class="size-4 text-red-400" />
											</button>
										{/each}
									{:else}
										<div class="p-4 text-center text-xs text-gray-500">
											No se encontraron productos
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					<div class="max-h-[calc(100vh-20rem)] overflow-x-auto p-2">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-light-four font-bold text-light-two uppercase">
									<th class="px-4 py-3">Producto</th>
									<th class="w-24 px-3 py-3 text-center">Cantidad</th>
									<th class="w-32 px-3 py-3 text-right">Costo Unit.</th>
									<th class="w-40 px-3 py-3 text-center">Vencimiento</th>
									<th class="w-32 px-3 py-3 text-center">Lote</th>
									<th class="w-32 px-3 py-3 text-right">Subtotal</th>
									<th class="w-16 px-4 py-3 text-center"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-light-four">
								{#each compraData.detalles as item, i (item.id_producto)}
									<tr class="group transition-colors hover:bg-light-one_d">
										<td class="px-4 py-3">
											<div class="flex flex-col">
												<span class="line-clamp-1 font-bold text-gray-800">
													{item.producto?.nombre_comercial}
												</span>
												<span class="text-[10px] tracking-tighter text-gray-500 uppercase">
													{item.producto?.marca?.nombre}
												</span>
											</div>
										</td>
										<td class="px-2 py-3 text-center">
											<input
												type="number"
												min="1"
												bind:value={item.cantidad}
												oninput={() => updateSubtotal(i)}
												class="w-full rounded-lg border border-light-four bg-white p-1.5 text-center text-xs outline-none focus:border-red-500"
											/>
										</td>
										<td class="px-2 py-3 text-right">
											<div class="relative flex items-center">
												<span class="absolute left-2 text-[10px] text-gray-400 italic">Bs</span>
												<input
													type="number"
													min="0"
													step="0.01"
													bind:value={item.costo_unitario}
													oninput={() => updateSubtotal(i)}
													class="w-full rounded-lg border p-1.5 pl-7 text-right text-xs transition-colors outline-none
                                                    {item.costo_unitario > 0 &&
													item.costo_unitario >= (item.precio_venta_actual || 0)
														? 'border-orange-400 bg-orange-50 text-orange-700 focus:border-orange-600'
														: 'border-light-four bg-white focus:border-red-500'}"
												/>
											</div>
										</td>
										<td class="px-2 py-3 text-center">
											<input
												type="date"
												bind:value={item.fecha_vencimiento_lote}
												class="w-full rounded-lg border border-light-four bg-white p-1.5 text-center text-xs outline-none focus:border-red-500"
											/>
										</td>
										<td class="px-2 py-3 text-center">
											<input
												type="text"
												bind:value={item.codigo_lote_provisto}
												placeholder="OPCIONAL"
												class="w-full rounded-lg border border-light-four bg-white p-1.5 text-center text-[10px] uppercase outline-none focus:border-red-500"
											/>
										</td>
										<td class="px-4 py-3 text-right font-black text-gray-800">
											{item.subtotal}
										</td>
										<td class="px-4 py-3 text-center">
											<div class="flex items-center justify-center gap-1">
												<button
													type="button"
													onclick={() => toggleConfigPrecio(i)}
													class="rounded-lg p-1.5 transition-colors
                                                    {item.costo_unitario > 0 &&
													item.costo_unitario >= (item.precio_venta_actual || 0)
														? 'animate-pulse bg-orange-100 text-orange-600 hover:bg-orange-200'
														: 'text-gray-400 hover:bg-blue-50 hover:text-blue-500'}"
													title="Ajustar Precio de Venta"
												>
													<TagIcon class="size-4" />
												</button>
												<button
													type="button"
													onclick={() => removeProduct(i)}
													class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
												>
													<TrashIcon class="size-4" />
												</button>
											</div>
										</td>
									</tr>

									{#if item.show_config}
										<tr class="bg-gray-50/50 shadow-inner" transition:slide>
											<td colspan="7" class="border-b border-light-four p-4">
												<div
													class="grid grid-cols-1 gap-6 rounded-xl border border-light-four bg-white p-4 shadow-sm md:grid-cols-2"
												>
													<div>
														<h4
															class="mb-3 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase"
														>
															<ClipboardIcon class="size-4" />
															Historial de Compras
														</h4>
														{#if item.cargando_historial}
															<div class="flex items-center justify-center p-4">
																<LoaderIcon class="size-5 animate-spin text-gray-400" />
															</div>
														{:else if item.historial_costos && item.historial_costos.length > 0}
															<ul class="space-y-2">
																{#each item.historial_costos as hist}
																	<li
																		class="flex items-center justify-between border-b border-light-four pb-2 text-xs"
																	>
																		<div class="flex flex-col">
																			<span class="text-gray-600"
																				>{new Date(hist.fecha_ingreso).toLocaleDateString()}</span
																			>
																			<span class="text-[9px] text-gray-400"
																				>{hist.codigo_lote}</span
																			>
																		</div>
																		<span class="font-mono font-bold text-gray-800"
																			>Bs. {hist.costo_compra_unitario}</span
																		>
																	</li>
																{/each}
															</ul>
														{:else}
															<p
																class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-400 italic"
															>
																No hay compras previas registradas.
															</p>
														{/if}
													</div>

													<div class="flex flex-col justify-between">
														<div>
															<h4
																class="mb-3 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase"
															>
																<TagIcon class="size-4" />
																Ajuste de Precio de Venta
															</h4>

															<div
																class="mb-4 flex items-center justify-between rounded-lg border border-light-four bg-gray-50 px-3 py-2"
															>
																<span class="text-xs text-gray-600">Precio de Venta Actual:</span>
																<span
																	class="font-bold {item.costo_unitario > 0 &&
																	item.costo_unitario >= (item.precio_venta_actual || 0)
																		? 'text-orange-600'
																		: 'text-green-600'}"
																>
																	Bs. {item.precio_venta_actual || 0}
																</span>
															</div>

															<div class="mb-4">
																<p
																	class="mb-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase"
																>
																	Cálculo Rápido
																</p>
																<div class="flex gap-2">
																	<button
																		type="button"
																		onclick={() => aplicarMargen(i, 20)}
																		class="flex-1 rounded border border-blue-200 bg-blue-50 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
																	>
																		+20%
																	</button>
																	<button
																		type="button"
																		onclick={() => aplicarMargen(i, 30)}
																		class="flex-1 rounded border border-blue-200 bg-blue-50 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
																	>
																		+30%
																	</button>
																	<button
																		type="button"
																		onclick={() =>
																			(item.nuevo_precio_venta = item.precio_venta_actual)}
																		class="flex-1 rounded border border-gray-200 bg-gray-50 py-1.5 text-[10px] font-bold text-gray-600 transition-colors hover:bg-gray-100"
																	>
																		MANTENER
																	</button>
																</div>
															</div>
														</div>

														<div
															class="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3"
														>
															<label class="w-1/2 text-xs font-bold text-blue-900"
																>Nuevo Precio (Bs):</label
															>
															<input
																type="number"
																step="0.01"
																min="0"
																bind:value={item.nuevo_precio_venta}
																class="w-1/2 rounded-lg border-2 border-blue-300 bg-white p-2 text-right font-black text-blue-900 outline-none focus:border-blue-500"
															/>
														</div>
													</div>
												</div>
											</td>
										</tr>
									{/if}
								{/each}

								{#if compraData.detalles.length === 0}
									<tr>
										<td colspan="7" class="py-12 text-center">
											<div class="flex flex-col items-center justify-center text-light-black/40">
												<ShoppingCartIcon class="mb-2 size-12 opacity-50" />
												<p class="font-medium">Tu lista de productos está vacía</p>
												<p class="mt-1 text-[10px] tracking-widest uppercase">
													Busca productos arriba para agregarlos
												</p>
											</div>
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</section>
			</div>

			<div class="space-y-6">
				<section
					class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm"
				>
					<div class="border-b border-light-four bg-light-one_d px-4 py-5">
						<h3 class="text-center text-sm font-bold tracking-wider text-light-black uppercase">
							Resumen de Inversión
						</h3>
					</div>
					<div class="p-4 text-center">
						<div class="rounded-2xl border border-red-100 bg-red-50 p-2">
							<p class="mb-1 text-xs font-bold tracking-widest text-red-400 uppercase">
								Total Compra
							</p>
							<p class="text-4xl font-black tracking-tighter text-red-600">
								{granTotal}
							</p>
						</div>

						<div class="mt-4 space-y-2">
							<div class="flex justify-between text-xs">
								<span class="font-medium text-light-black/60">Items totales</span>
								<span class="font-bold text-light-black">{compraData.detalles.length}</span>
							</div>
							<div class="flex justify-between text-xs">
								<span class="font-medium text-light-black/60">Unidades físicas</span>
								<span class="font-bold text-light-black">
									{compraData.detalles.reduce((acc, d) => acc + Number(d.cantidad), 0)}
								</span>
							</div>
							<div class="my-2 h-px bg-light-four"></div>
							<div class="flex justify-between text-xs">
								<span class="font-medium text-light-black/60">Estado pago</span>
								<span
									class="rounded-full bg-light-four_d px-2 py-0.5 text-[9px] font-bold text-light-black uppercase"
								>
									{compraData.estado_pago?.replace('_', ' ') || ''}
								</span>
							</div>
						</div>
					</div>
				</section>

				<div class="grid grid-cols-1 gap-4">
					<Button onclick={handleSave} disabled={loading} size="md">
						{#snippet leftIcon()}
							<CheckIcon class="size-6" />
						{/snippet}
						<span class="text-lg font-black tracking-widest uppercase">Registrar Compra</span>
					</Button>
					<Button onclick={onCancel} disabled={loading} size="md" variant="secondary">
						{#snippet leftIcon()}
							<XIcon class="size-6" />
						{/snippet}
						<span class="text-sm font-bold tracking-widest uppercase">Cancelar</span>
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
