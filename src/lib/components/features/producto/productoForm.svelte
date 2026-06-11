<script lang="ts">
	import { Input, Select, TextArea } from '$lib/components/ui';
	import {
		PhotoIcon,
		PlusIcon,
		CheckIcon,
		XIcon,
		ClipboardIcon,
		TagIcon,
		ScaleIcon,
		LoaderIcon,
		SparklesIcon,
		CopyIcon
	} from '$lib/icons/outline';
	import { productoService } from '$lib/services/producto.service';
	import type {
		CreateProductoDto,
		PresentacionDto,
		Categoria,
		Marca,
		UnidadMedida
	} from '$lib/interfaces';
	import { fade, slide } from 'svelte/transition';

	// ─── Interfaces ───────────────────────────────────────────────────────────

	interface Sucursal {
		id: string;
		nombre: string;
	}

	interface Ubicacion {
		id: string;
		id_sucursal: string;
		nombre: string;
		tipo_area: 'Venta' | 'Deposito' | 'Merma';
	}

	interface UbicacionFisica {
		id: string;
		id_ubicacion: string;
		nombre: string;
	}

	interface Distribucion {
		id_sucursal: string;
		id_ubicacion: string;
		id_ubicacion_fisica?: string;
		cantidad: number;
		id_presentacion: string; // nombre de presentacion para calcular factor
	}

	interface Proveedor {
		id: string;
		nombre: string;
	}

	interface CargaInicial {
		costo_unitario?: number;
		precio_venta?: number;
		id_proveedor?: string;
		fecha_vencimiento: string;
		distribuciones: Distribucion[];
	}

	interface Props {
		categorias: Categoria[];
		marcas: Marca[];
		unidades: UnidadMedida[];
		sucursales?: Sucursal[];
		ubicaciones?: Ubicacion[];
		ubicacionesFisicas?: UbicacionFisica[];
		proveedores?: Proveedor[];
		loading?: boolean;
		onSubmit: (data: CreateProductoDto) => Promise<void>;
		onCancel: () => void;
	}

	// ─── Props ────────────────────────────────────────────────────────────────

	let {
		categorias = [],
		marcas = [],
		unidades = [],
		sucursales = [],
		ubicaciones = [],
		ubicacionesFisicas = [],
		proveedores = [],
		loading = false,
		onSubmit,
		onCancel
	}: Props = $props();

	// ─── Producto principal ───────────────────────────────────────────────────

	let formData = $state<CreateProductoDto>({
		codigo_barras: '',
		nombre_comercial: '',
		descripcion: '',
		id_categoria: '',
		id_marca: '',
		id_unidad_medida: '',
		stock_minimo: 0,
		precio_venta: 0,
		maneja_vencimiento: false,
		foto: null
	});

	// ─── Presentaciones ───────────────────────────────────────────────────────

	let presentaciones = $state<PresentacionDto[]>([]);
	let selectedBaseUnit = $derived(unidades.find((u) => u.id === formData.id_unidad_medida));
	let baseUnitAbbreviation = $derived(selectedBaseUnit?.abreviatura || '');

	$effect(() => {
		const baseUnit = formData.id_unidad_medida;
		if (baseUnit) {
			presentaciones.forEach((p) => {
				p.id_unidad_medida = baseUnit;
			});
		}
	});

	function addPresentacion() {
		presentaciones = [
			...presentaciones,
			{
				id_unidad_medida: formData.id_unidad_medida || '',
				nombre: '',
				factor_conversion: 1,
				precio_especial: 0,
				sku: '',
				codigo_barras: ''
			}
		];
	}

	function removePresentacion(index: number) {
		presentaciones = presentaciones.filter((_, i) => i !== index);
	}

	let showVencimiento = $derived(formData.maneja_vencimiento === true);

	function toggleVencimiento() {
		formData.maneja_vencimiento = !formData.maneja_vencimiento;
	}

	// ─── Carga Inicial ────────────────────────────────────────────────────────

	let aplicar_carga_inicial = $state(false);

	let cargaInicial = $state<CargaInicial>({
		costo_unitario: 0,
		precio_venta: 0,
		id_proveedor: '',
		fecha_vencimiento: '',
		distribuciones: [crearDistribucionVacia()]
	});

	function crearDistribucionVacia(): Distribucion {
		return {
			id_sucursal: '',
			id_ubicacion: '',
			id_ubicacion_fisica: '',
			cantidad: 0,
			id_presentacion: ''
		};
	}

	function addDistribucion() {
		cargaInicial.distribuciones = [...cargaInicial.distribuciones, crearDistribucionVacia()];
	}

	function removeDistribucion(index: number) {
		cargaInicial.distribuciones = cargaInicial.distribuciones.filter((_, i) => i !== index);
	}

	// Cuando cambia la sucursal de una distribución, limpiar ubicación y ubicación física
	function onSucursalChange(index: number) {
		cargaInicial.distribuciones[index].id_ubicacion = '';
		cargaInicial.distribuciones[index].id_ubicacion_fisica = '';
	}

	// Cuando cambia el área, limpiar ubicación física
	function onUbicacionChange(index: number) {
		cargaInicial.distribuciones[index].id_ubicacion_fisica = '';
	}

	// Filtrar ubicaciones (áreas) por sucursal seleccionada en cada fila
	function getUbicacionesPorSucursal(id_sucursal: string): Ubicacion[] {
		if (!id_sucursal) return [];
		return ubicaciones.filter((u) => u.id_sucursal === id_sucursal);
	}

	// Filtrar ubicaciones físicas (estantes) por área seleccionada en cada fila
	function getUbicacionesFisicasPorUbicacion(id_ubicacion: string): UbicacionFisica[] {
		if (!id_ubicacion) return [];
		return ubicacionesFisicas.filter((uf) => uf.id_ubicacion === id_ubicacion);
	}

	function getProveedoresCatalogo(): Proveedor[] {
		return proveedores;
	}
	// Obtener el factor de conversión de la presentación seleccionada
	function getFactorPresentacion(id_presentacion: string): number {
		if (!id_presentacion) return 1;
		const pres = presentaciones.find((p) => p.nombre === id_presentacion);
		return Number(pres?.factor_conversion) || 1;
	}

	// Total de unidades base sumando todas las distribuciones
	let totalUnidadesBase = $derived(
		cargaInicial.distribuciones.reduce((sum, d) => {
			const factor = getFactorPresentacion(d.id_presentacion);
			return sum + Number(d.cantidad) * factor;
		}, 0)
	);

	// ─── Foto ─────────────────────────────────────────────────────────────────

	let fileInput: HTMLInputElement;
	let photoPreview = $state<string | null>(null);

	function handlePhotoClick() {
		fileInput.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			formData.foto = file;
			const reader = new FileReader();
			reader.onload = (event) => {
				photoPreview = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	// ─── Submit ───────────────────────────────────────────────────────────────

	async function handleSave() {
		if (loading) return;

		const cleanPresentaciones: PresentacionDto[] | undefined =
			presentaciones.length > 0 ? structuredClone($state.snapshot(presentaciones)) : undefined;

		let carga_inicial_payload = undefined;

		if (aplicar_carga_inicial) {
			// Validar distribuciones
			const distribucionesValidas = cargaInicial.distribuciones.filter(
				(d) => (d.id_ubicacion || d.id_ubicacion_fisica) && Number(d.cantidad) > 0
			);

			if (distribucionesValidas.length === 0) {
				alert('Debe agregar al menos una distribución con ubicación y cantidad mayor a 0');
				return;
			}

			// Validar vencimiento
			if (formData.maneja_vencimiento && !cargaInicial.fecha_vencimiento) {
				alert('El producto maneja vencimiento. Debe ingresar la fecha de vencimiento del lote.');
				return;
			}

			// 👇 NUEVA VALIDACIÓN: Obligar a seleccionar un proveedor
			// if (!cargaInicial.id_proveedor) {
			// 	alert('Debe seleccionar un proveedor para la carga inicial.');
			// 	return;
			// }

			carga_inicial_payload = {
				// Campos obligatorios
				id_sucursal: distribucionesValidas[0]?.id_sucursal || '',
				id_ubicacion_destino: distribucionesValidas[0]?.id_ubicacion || '',
				cantidad_base: totalUnidadesBase,

				// Demás campos
				costo_unitario: Number(cargaInicial.costo_unitario) || 0,
				precio_venta: Number(cargaInicial.precio_venta) || 0,

				id_proveedor: cargaInicial.id_proveedor,

				fecha_vencimiento: cargaInicial.fecha_vencimiento || null,
				distribuciones: distribucionesValidas.map((d) => {
					const factor = getFactorPresentacion(d.id_presentacion);
					return {
						id_ubicacion: d.id_ubicacion || null,
						id_ubicacion_fisica: d.id_ubicacion_fisica || null,
						cantidad: Number(d.cantidad) * factor
					};
				})
			};
		}

		const rawFormData = $state.snapshot(formData);
		const payload: CreateProductoDto = {
			...rawFormData,
			presentaciones: cleanPresentaciones,
			carga_inicial: carga_inicial_payload
		};

		await onSubmit(payload);
	}

	// ─── Barcode Helpers ───────────────────────────────────────────────────────
	let isGeneratingMain = $state(false);
	let copiedMain = $state(false);
	let generatingPresentations = $state<Record<number, boolean>>({});
	let copiedPresentations = $state<Record<number, boolean>>({});

	async function generateMainBarcode() {
		if (isGeneratingMain) return;
		isGeneratingMain = true;
		try {
			const barcode = await productoService.generateBarcode();
			formData.codigo_barras = barcode;
		} catch (error) {
			console.error('Error generating barcode:', error);
		} finally {
			isGeneratingMain = false;
		}
	}

	async function generatePresentationBarcode(index: number) {
		if (generatingPresentations[index]) return;
		generatingPresentations[index] = true;
		try {
			const barcode = await productoService.generateBarcode();
			presentaciones[index].codigo_barras = barcode;
		} catch (error) {
			console.error('Error generating barcode for presentation:', error);
		} finally {
			generatingPresentations[index] = false;
		}
	}

	function copyBarcode(text: string | undefined | null, index?: number) {
		if (!text) return;
		navigator.clipboard.writeText(text);

		if (index !== undefined) {
			copiedPresentations[index] = true;
			setTimeout(() => (copiedPresentations[index] = false), 2000);
		} else {
			copiedMain = true;
			setTimeout(() => (copiedMain = false), 2000);
		}
	}
</script>

<div class="flex min-h-screen flex-col gap-6 bg-gray-50/50 font-sans" in:fade>
	<!-- Header -->
	<div class="mb-2 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-light-black">Registrar Nuevo Producto</h1>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- ── Columna principal ───────────────────────────────────────────── -->
		<div class="flex flex-col gap-6 lg:col-span-2">
			<!-- Identificación del Producto -->
			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
					<div class="rounded-lg bg-blue-100 p-2 text-blue-600">
						<PhotoIcon class="h-5 w-5" />
					</div>
					<h2 class="font-semibold text-gray-800">Identificación del Producto</h2>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
						<!-- Foto -->
						<div class="md:col-span-1">
							<input
								type="file"
								accept="image/*"
								class="hidden"
								bind:this={fileInput}
								onchange={handleFileChange}
							/>
							<button
								type="button"
								onclick={handlePhotoClick}
								class="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-500"
							>
								{#if photoPreview}
									<img
										src={photoPreview}
										alt="Preview"
										class="absolute inset-0 h-full w-full object-cover"
									/>
									<div
										class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<PhotoIcon class="h-8 w-8 text-white" />
									</div>
								{:else}
									<PhotoIcon class="h-10 w-10 transition-transform group-hover:scale-110" />
									<span class="text-[10px] font-bold tracking-widest uppercase">Subir Foto</span>
								{/if}
							</button>
						</div>

						<div class="space-y-4 md:col-span-3">
							<Input
								label="NOMBRE COMERCIAL COMPLETO"
								placeholder="Ej: Silicona Roja Alta Temp"
								bind:value={formData.nombre_comercial}
								required
							/>
							<TextArea
								label="DESCRIPCIÓN"
								placeholder="Breve descripción del producto (opcional)"
								bind:value={formData.descripcion}
								rows={2}
								maxlength={1000}
							/>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Select label="MARCA/FABRICANTE" bind:value={formData.id_marca} required>
									<option value="" disabled selected>-- SELECCIONAR --</option>
									{#each marcas as marca (marca.id)}
										<option value={marca.id}>{marca.nombre}</option>
									{/each}
								</Select>
								<Select label="CATEGORÍA" bind:value={formData.id_categoria} required>
									<option value="" disabled selected>-- SELECCIONAR --</option>
									{#each categorias as cat (cat.id)}
										<option value={cat.id}>{cat.nombre}</option>
									{/each}
								</Select>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="flex flex-col gap-1">
									<Input
										label="CÓDIGO DE BARRAS (UNITARIO)"
										placeholder="7751234567890"
										bind:value={formData.codigo_barras}
									/>
									<div class="flex justify-end gap-2">
										<button
											type="button"
											onclick={generateMainBarcode}
											disabled={isGeneratingMain}
											class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-light-four bg-linear-to-r from-light-one to-light-four px-2 py-1.5 text-xs font-bold text-light-three transition-all hover:ring-1 hover:ring-light-three disabled:opacity-50"
											title="Generar código"
										>
											{#if isGeneratingMain}
												<LoaderIcon class="h-4 w-4 animate-spin" />
												GENERANDO...
											{:else}
												<SparklesIcon class="h-4 w-4" />
												GENERAR
											{/if}
										</button>

										{#if formData.codigo_barras}
											<button
												type="button"
												onclick={() => copyBarcode(formData.codigo_barras)}
												class="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all {copiedMain
													? 'border-green-200 bg-green-50 text-green-600'
													: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}"
												title="Copiar código"
											>
												{#if copiedMain}
													<CheckIcon class="h-3 w-3" />
													COPIADO!
												{:else}
													<CopyIcon class="h-3 w-3" />
													COPIAR
												{/if}
											</button>
										{/if}
									</div>
								</div>
								<Select label="UNIDAD MEDIDA" bind:value={formData.id_unidad_medida} required>
									<option value="" disabled selected>-- SELECCIONAR --</option>
									{#each unidades as uni (uni.id)}
										<option value={uni.id}>{uni.nombre}</option>
									{/each}
								</Select>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Configuración + Controles Especiales -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
						<div class="rounded-lg bg-orange-100 p-2 text-orange-600">
							<TagIcon class="h-5 w-5" />
						</div>
						<h2 class="font-semibold text-gray-800">Configuración</h2>
					</div>
					<div class="space-y-4 p-6">
						<Input
							type="number"
							label="STOCK MÍNIMO"
							placeholder="20"
							bind:value={formData.stock_minimo}
							required
						/>
						<!-- <Input
							type="number"
							step="0.01"
							label="PRECIO DE VENTA"
							placeholder="Ej: 20.00"
							bind:value={formData.precio_venta}
							required
						/>
						<p class="text-xs text-gray-400">Se notificará cuando el stock baje de este nivel.</p> -->
					</div>
				</section>

				<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
						<div class="rounded-lg bg-indigo-100 p-2 text-indigo-600">
							<ClipboardIcon class="h-5 w-5" />
						</div>
						<h2 class="font-semibold text-gray-800">Controles Especiales</h2>
					</div>
					<div class="space-y-4 p-6">
						<button
							type="button"
							onclick={toggleVencimiento}
							class="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all {showVencimiento
								? 'border-red-200 bg-red-50'
								: 'border-gray-100 bg-gray-50 hover:bg-gray-100'}"
						>
							<div
								class="flex h-6 w-6 items-center justify-center rounded border {showVencimiento
									? 'border-red-500 bg-red-500 text-white'
									: 'border-gray-300 bg-white'}"
							>
								{#if showVencimiento}<CheckIcon class="h-4 w-4" />{/if}
							</div>
							<div class="flex-1">
								<p class="font-bold text-gray-800">Vencimiento</p>
								<p class="text-xs text-gray-500">
									Exige fecha de vencimiento al ingresar mercadería
								</p>
							</div>
						</button>
					</div>
				</section>
			</div>

			<!-- Presentaciones -->
			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
					<div class="rounded-lg bg-blue-50 p-2 text-blue-500">
						<ScaleIcon class="h-5 w-5" />
					</div>
					<div class="flex-1">
						<h2 class="font-semibold text-gray-800">Presentaciones (Por Mayor)</h2>
						<p class="text-[10px] text-gray-500">
							Agrega paquetes/cajas con precio especial. Ej: "Caja x 12" = 12 unidades.
						</p>
					</div>
					<button
						type="button"
						onclick={addPresentacion}
						class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600"
					>
						<PlusIcon class="h-4 w-4" />
						Agregar
					</button>
				</div>
				<div class="p-6">
					{#if presentaciones.length === 0}
						<div class="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
							<ScaleIcon class="mx-auto mb-2 h-8 w-8 text-gray-300" />
							<p class="text-sm text-gray-400">Sin presentaciones</p>
							<p class="text-xs text-gray-400">El producto solo se venderá por unidad</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each presentaciones as pres, i (i)}
								<div
									class="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4"
									transition:slide
								>
									<button
										type="button"
										onclick={() => removePresentacion(i)}
										class="absolute top-3 right-3 rounded-lg bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200"
									>
										<XIcon class="h-4 w-4" />
									</button>
									<p class="mb-3 text-[10px] font-bold tracking-widest text-blue-600 uppercase">
										Presentación #{i + 1}
									</p>
									<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
										<Select
											label="UNIDAD DE MEDIDA"
											bind:value={pres.id_unidad_medida}
											required
											disabled
										>
											<option value="" disabled selected>-- SELECCIONAR --</option>
											{#each unidades as uni (uni.id)}
												<option value={uni.id}>{uni.nombre}</option>
											{/each}
										</Select>
										<Input
											label="NOMBRE ENVASE"
											placeholder="Ej: Caja x 12"
											bind:value={pres.nombre}
											required
										/>
										<Input
											type="number"
											label={baseUnitAbbreviation
												? `FACTOR (${baseUnitAbbreviation})`
												: 'FACTOR (CANT.)'}
											placeholder="12"
											bind:value={pres.factor_conversion}
											required
										/>
										<Input
											type="number"
											label="PRECIO PACK"
											placeholder="8.00"
											bind:value={pres.precio_especial}
										/>
										<div class="flex flex-col gap-1 md:col-span-2">
											<Input
												label="CÓD. BARRAS PACK"
												placeholder="10000000312"
												bind:value={pres.codigo_barras}
											/>
											<div class="flex justify-end gap-2">
												<button
													type="button"
													onclick={() => generatePresentationBarcode(i)}
													disabled={generatingPresentations[i]}
													class="flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-light-four bg-linear-to-r from-light-one to-light-four px-2 py-1.5 text-xs font-bold text-light-three transition-all hover:ring-1 hover:ring-light-three disabled:opacity-50"
													title="Generar código"
												>
													{#if generatingPresentations[i]}
														<LoaderIcon class="h-3 w-3 animate-spin" />
														GENERANDO...
													{:else}
														<SparklesIcon class="h-4 w-4 font-bold" />
														GENERAR
													{/if}
												</button>
												{#if pres.codigo_barras}
													<button
														type="button"
														onclick={() => copyBarcode(pres.codigo_barras, i)}
														class="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-all {copiedPresentations[
															i
														]
															? 'border-green-200 bg-green-50 text-green-600'
															: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}"
														title="Copiar código"
													>
														{#if copiedPresentations[i]}
															<CheckIcon class="h-3 w-3" />
															COPIADO!
														{:else}
															<CopyIcon class="h-3 w-3" />
															COPIAR
														{/if}
													</button>
												{/if}
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>

			<!-- ── Carga Inicial ─────────────────────────────────────────────── -->
			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-gray-100 bg-green-50 p-4">
					<div class="rounded-lg bg-green-100 p-2 text-green-600">
						<ClipboardIcon class="h-5 w-5" />
					</div>
					<div class="flex-1">
						<h2 class="font-semibold text-gray-800">Carga Inicial de Inventario</h2>
						<p class="text-[10px] text-gray-500">
							Distribuye el stock en múltiples ubicaciones desde el inicio
						</p>
					</div>
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-gray-50"
					>
						<span
							class="text-sm font-bold {aplicar_carga_inicial ? 'text-green-600' : 'text-gray-500'}"
						>
							Añadir Stock Inicial
						</span>
						<input
							type="checkbox"
							bind:checked={aplicar_carga_inicial}
							class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
						/>
					</label>
				</div>

				{#if aplicar_carga_inicial}
					<div class="bg-green-50/20 p-6" transition:slide>
						<!-- Nota informativa -->
						<div class="mb-5 rounded-lg border border-green-100 bg-green-50 p-3">
							<p class="text-xs text-green-700">
								Todos los registros forman parte de <strong>un mismo lote</strong>. El costo
								unitario y fecha de vencimiento aplican a todas las distribuciones.
							</p>
						</div>

						<!-- Costo + Precio venta + Proveedor + Fecha vencimiento (globales del lote) -->
						<div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
							<Input
								type="number"
								step="0.01"
								label="COSTO UNITARIO (COMPRA)"
								placeholder="Ej: 15.50"
								bind:value={cargaInicial.costo_unitario}
							/>
							<Input
								type="number"
								step="0.01"
								label="PRECIO DE VENTA SUGERIDO"
								placeholder="Ej: 20.00"
								bind:value={cargaInicial.precio_venta}
							/>
							<Select label="PROVEEDOR (OPCIONAL)" bind:value={cargaInicial.id_proveedor}>
								<option value="">-- Sin proveedor --</option>
								{#each getProveedoresCatalogo() as prov (prov.id)}
									<option value={prov.id}>{prov.nombre}</option>
								{/each}
							</Select>
							{#if showVencimiento}
								<Input
									type="date"
									label="FECHA DE VENCIMIENTO DEL LOTE"
									bind:value={cargaInicial.fecha_vencimiento}
									required
								/>
							{:else}
								<div class="flex items-end pb-1">
									<p class="text-xs text-gray-400">
										Si el producto maneja vencimiento, activa la opción en "Controles Especiales".
									</p>
								</div>
							{/if}
						</div>

						<!-- Distribuciones -->
						<div class="space-y-4">
							{#each cargaInicial.distribuciones as dist, i (i)}
								<div
									class="relative rounded-xl border border-green-100 bg-white p-4 shadow-sm"
									transition:slide
								>
									<!-- Badge + botón eliminar -->
									<div class="mb-3 flex items-center justify-between">
										<span
											class="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-green-700 uppercase"
										>
											Distribución #{i + 1}
										</span>
										{#if cargaInicial.distribuciones.length > 1}
											<button
												type="button"
												onclick={() => removeDistribucion(i)}
												class="rounded-lg bg-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-200"
											>
												<XIcon class="h-4 w-4" />
											</button>
										{/if}
									</div>

									<!-- Sucursal → Área → Estante (cascada) -->
									<div class="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
										<!-- Sucursal -->
										<Select
											label="SUCURSAL"
											bind:value={dist.id_sucursal}
											onchange={() => onSucursalChange(i)}
										>
											<option value="" disabled selected>-- SELECCIONAR --</option>
											{#each sucursales as suc (suc.id)}
												<option value={suc.id}>{suc.nombre}</option>
											{/each}
										</Select>

										<!-- Área (Ubicacion) — se filtra por sucursal -->
										<Select
											label="ÁREA"
											bind:value={dist.id_ubicacion}
											disabled={!dist.id_sucursal}
											onchange={() => onUbicacionChange(i)}
										>
											<option value="" disabled selected>-- SELECCIONAR --</option>
											{#each getUbicacionesPorSucursal(dist.id_sucursal) as ubi (ubi.id)}
												<option value={ubi.id}>{ubi.nombre} {ubi.tipo_area}</option>
											{/each}
										</Select>

										<!-- Estante / Pasillo (UbicacionFisica) — se filtra por área, opcional -->
										<Select
											label="ESTANTE / PASILLO (OPCIONAL)"
											bind:value={dist.id_ubicacion_fisica}
											disabled={!dist.id_ubicacion}
										>
											<option value="">(Sin especificar)</option>
											{#each getUbicacionesFisicasPorUbicacion(dist.id_ubicacion) as uf (uf.id)}
												<option value={uf.id}>{uf.nombre}</option>
											{/each}
										</Select>
									</div>

									<!-- Cantidad + Presentación -->
									<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
										<Input
											type="number"
											label="CANTIDAD INGRESADA"
											placeholder="0"
											bind:value={dist.cantidad}
											required
										/>

										<Select label="PRESENTACIÓN" bind:value={dist.id_presentacion}>
											<option value="">Unidad base (x1)</option>
											{#each presentaciones as pres (pres.nombre)}
												<option value={pres.nombre}>
													{pres.nombre} (x{pres.factor_conversion})
												</option>
											{/each}
										</Select>

										<!-- Total unidades base de esta fila -->
										<div class="flex flex-col justify-end">
											{#if Number(dist.cantidad) > 0}
												<div class="rounded-lg bg-green-50 px-3 py-2 text-right">
													<p class="text-[10px] font-bold tracking-widest text-green-500 uppercase">
														Unidades base
													</p>
													<p class="text-xl font-black text-green-700">
														{Number(dist.cantidad) * getFactorPresentacion(dist.id_presentacion)} und
													</p>
												</div>
											{:else}
												<div
													class="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-center"
												>
													<p class="text-xs text-gray-400">Ingresa cantidad</p>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>

						<!-- Botón agregar distribución -->
						<button
							type="button"
							onclick={addDistribucion}
							class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-200 py-3 text-sm font-semibold text-green-600 transition-colors hover:border-green-400 hover:bg-green-50"
						>
							<PlusIcon class="h-4 w-4" />
							Agregar otra ubicación
						</button>

						<!-- Total general -->
						{#if totalUnidadesBase > 0}
							<div
								class="mt-4 flex items-center justify-between rounded-xl bg-green-600 px-5 py-3 text-white"
								transition:slide
							>
								<div>
									<p class="text-[10px] font-bold tracking-widest text-green-200 uppercase">
										Total general a ingresar
									</p>
									<p class="text-xs text-green-200">Suma de todas las distribuciones</p>
								</div>
								<p class="text-3xl font-black">
									{totalUnidadesBase} <span class="text-lg font-normal text-green-200">und</span>
								</p>
							</div>
						{/if}
					</div>
				{/if}
			</section>
		</div>

		<!-- ── Columna derecha: Info + Acciones ──────────────────────────── -->
		<div class="flex flex-col gap-6 lg:col-span-1">
			<section
				class="flex-1 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 shadow-sm"
			>
				<div class="flex items-center gap-3 border-b border-blue-100 p-4">
					<div class="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
						<ClipboardIcon class="h-5 w-5" />
					</div>
					<div>
						<h2 class="font-bold text-gray-800">Catálogo de Producto</h2>
						<p class="text-[10px] text-gray-500">Registra los datos maestros del producto.</p>
					</div>
				</div>
				<div class="space-y-4 p-6">
					<div class="rounded-lg border border-blue-100 bg-white p-4">
						<p class="mb-2 text-xs font-semibold text-blue-700">ℹ️ Stock Inicial</p>
						<p class="text-xs text-gray-600">
							Por defecto, este producto nacerá con <strong>stock 0</strong>. Puedes llenar el campo
							<strong>Carga Inicial</strong> si ya tienes inventario, o agregar mercadería después de
							registrarlo.
						</p>
					</div>
					<div class="rounded-lg border border-blue-100 bg-white p-4">
						<p class="mb-2 text-xs font-semibold text-blue-700">📦 Presentaciones</p>
						<p class="text-xs text-gray-600">
							Si añades presentaciones (Caja x10), podrás elegir ingresar "2 cajas", y nosotros
							multiplicaremos internamente para registrar el stock real (20 unidades).
						</p>
					</div>
					<div class="rounded-lg border border-blue-100 bg-white p-4">
						<p class="mb-2 text-xs font-semibold text-blue-700">📍 Ubicaciones</p>
						<p class="text-xs text-gray-600">
							Puedes distribuir el stock inicial en múltiples áreas y estantes desde el momento de
							crear el producto. Todas quedan registradas en el mismo lote.
						</p>
					</div>
				</div>
			</section>

			<div class="grid grid-cols-1 gap-4">
				<button
					onclick={handleSave}
					disabled={loading}
					class="group flex h-20 w-full items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:bg-gray-50 disabled:opacity-50"
				>
					<div
						class="rounded-lg bg-gray-100 p-3 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600"
					>
						{#if loading}
							<LoaderIcon class="h-6 w-6 animate-spin" />
						{:else}
							<ClipboardIcon class="h-6 w-6" />
						{/if}
					</div>
					<span class="text-xl font-black tracking-widest text-gray-800 uppercase">
						{loading ? 'Guardando...' : 'Guardar'}
					</span>
				</button>

				<button
					onclick={onCancel}
					class="group flex h-20 w-full items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:bg-gray-50"
				>
					<div
						class="rounded-lg bg-gray-100 p-3 transition-colors group-hover:bg-red-100 group-hover:text-red-600"
					>
						<XIcon class="h-6 w-6" />
					</div>
					<span class="text-xl font-black tracking-widest text-gray-800 uppercase">Cancelar</span>
				</button>
			</div>
		</div>
	</div>
</div>
