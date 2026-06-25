<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { productoService, presentacionService, loteService } from '$lib/services';
	import { categoriaService } from '$lib/services/categoria.service';
	import { marcaService } from '$lib/services/marca.service';
	import { unidadMedidaService } from '$lib/services/unidadMedida.service';
	import type {
		Presentacion,
		Producto,
		Lote,
		CreatePresentacionDto,
		UpdatePresentacionDto,
		CreateLoteDto,
		UpdateLoteDto
	} from '$lib/interfaces';
	import type { Categoria } from '$lib/interfaces/categoria.interface';
	import type { Marca } from '$lib/interfaces/marca.interface';
	import type { UnidadMedida } from '$lib/interfaces/unidadMedida.interface';
	import { Heading, Button, Text, Modal, ModalConfirm } from '$lib/components/ui';
	import {
		ArrowLeftIcon,
		PhotoIcon,
		TagIcon,
		PackageIcon,
		MapPinIcon,
		StopwatchIcon,
		CircleCheckIcon,
		PencilIcon,
		CheckIcon,
		PlusIcon,
		TrashIcon
	} from '$lib/icons/outline';
	import {
		PresentacionCard,
		PresentacionForm,
		LoteCard,
		LoteModal
	} from '$lib/components/features/producto';
	import { fade, fly } from 'svelte/transition';

	import XmarkIcon from '$lib/icons/outline/xmarkIcon.svelte';
	import { MainLayout } from '$lib/components/layout';
	import { alert, formatCurrency, redirect } from '$lib/utils';

	const id = page.params.id as string;
	let producto = $state<Producto | null>(null);
	let isLoading = $state(true);
	let isEditMode = $state(false);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);

	// Dropdown data
	let categorias = $state<Categoria[]>([]);
	let marcas = $state<Marca[]>([]);
	let unidades = $state<UnidadMedida[]>([]);
	let loadingDropdowns = $state(false);

	// Edit form state (only updatable fields)
	let form = $state({
		nombre_comercial: '',
		descripcion: '',
		codigo_barras: '',
		id_categoria: '',
		id_marca: '',
		id_unidad_medida: '',
		stock_minimo: 0,
		precio_venta: 0,
		maneja_vencimiento: false
	});

	// Presentaciones State
	let showModalPres = $state(false);
	let isEditPres = $state(false);
	let currentPresId = $state<string | null>(null);
	let isSavingPres = $state(false);
	let showModalDelPres = $state(false);
	let isDeletingPres = $state(false);

	// Lotes State
	let showModalLote = $state(false);
	let isEditLote = $state(false);
	let currentLoteId = $state<string | null>(null);
	let selectedLote = $state<Lote | null>(null);
	let isSavingLote = $state(false);
	let showModalDelLote = $state(false);
	let isDeletingLote = $state(false);

	function openAddLote() {
		isEditLote = false;
		selectedLote = null;
		showModalLote = true;
	}

	function openEditLote(lote: Lote) {
		isEditLote = true;
		selectedLote = lote;
		showModalLote = true;
	}

	async function handleSaveLote(data: CreateLoteDto | UpdateLoteDto): Promise<void> {
		isSavingLote = true;
		try {
			if (isEditLote && selectedLote) {
				const updated = await loteService.updateLote(selectedLote.id, data as UpdateLoteDto);
				if (producto && producto.lotes) {
					producto.lotes = producto.lotes.map((l) =>
						l.id === selectedLote!.id ? { ...l, ...updated } : l
					);
				}
				await loadProducto(false);
				alert('success', 'Lote actualizado correctamente.');
			} else {
				const created = await loteService.createLote({ ...data, id_producto: id } as CreateLoteDto);
				if (producto) {
					producto.lotes = [...(producto.lotes || []), created];
				}
				await loadProducto(false);
				alert('success', 'Lote creado correctamente.');
			}
			showModalLote = false;
		} catch (err) {
			console.error(err);
			alert('error', 'Error al guardar el lote.');
		} finally {
			isSavingLote = false;
		}
	}

	function confirmDelLote(loteId: string) {
		currentLoteId = loteId;
		showModalDelLote = true;
	}

	async function handleDeleteLote() {
		if (!currentLoteId) return;
		isDeletingLote = true;
		try {
			await loteService.deleteLote(currentLoteId);
			if (producto && producto.lotes) {
				producto.lotes = producto.lotes.filter((l) => l.id !== currentLoteId);
			}
			showModalDelLote = false;
			alert('success', 'Lote eliminado correctamente.');
			currentLoteId = null;
		} catch (err) {
			console.error('Error al eliminar lote', err);
			alert('error', 'Error al eliminar lote.');
		} finally {
			isDeletingLote = false;
		}
	}

	function openAddPres() {
		loadDropdowns();
		isEditPres = false;
		currentPresId = null;
		showModalPres = true;
	}

	function openEditPres(pres: Presentacion) {
		loadDropdowns();
		isEditPres = true;
		currentPresId = pres.id;
		showModalPres = true;
	}

	async function handleSavePres(
		data: CreatePresentacionDto | UpdatePresentacionDto
	): Promise<void> {
		isSavingPres = true;
		try {
			if (isEditPres && currentPresId) {
				const updated = await presentacionService.updatePresentacion(currentPresId, {
					...(data as UpdatePresentacionDto),
					id_producto: id
				});
				if (producto && producto.presentaciones) {
					producto.presentaciones = producto.presentaciones.map((p) =>
						p.id === currentPresId ? { ...p, ...updated } : p
					);
				}
				alert('success', 'Presentación actualizada correctamente.');
			} else {
				const created = await presentacionService.createPresentacion({ ...data, id_producto: id });
				if (producto) {
					producto.presentaciones = [...(producto.presentaciones || []), created];
				}
				alert('success', 'Presentación creada correctamente.');
			}
			showModalPres = false;
		} catch (err) {
			console.error(err);
			alert('error', 'Error al guardar la presentación.');
		} finally {
			isSavingPres = false;
		}
	}

	function confirmDelPres(presId: string) {
		currentPresId = presId;
		showModalDelPres = true;
	}

	async function handleDeletePres() {
		if (!currentPresId) return;
		isDeletingPres = true;
		try {
			await presentacionService.deletePresentacion(currentPresId);
			if (producto && producto.presentaciones) {
				producto.presentaciones = producto.presentaciones.filter((p) => p.id !== currentPresId);
			}

			showModalDelPres = false;
			alert('success', 'Presentación eliminada correctamente.');

			currentPresId = null;
		} catch (err) {
			console.error('Error al eliminar presentación', err);
			alert('error', 'Error al eliminar presentación.');
		} finally {
			isDeletingPres = false;
		}
	}

	// Image upload
	let fotoFile = $state<File | null>(null);
	let fotoPreview = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	async function loadProducto(showLoading = true) {
		try {
			if (showLoading) isLoading = true;
			producto = await productoService.getProductoConLotes(id);
		} catch (error) {
			console.error('Error loading product:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadDropdowns() {
		if (categorias.length > 0) return; // already loaded
		loadingDropdowns = true;
		try {
			const [catData, marcaData, unidadData] = await Promise.all([
				categoriaService.getCategorias(),
				marcaService.getMarcas(),
				unidadMedidaService.getUnidadMedidas()
			]);
			categorias = catData.categorias;
			marcas = marcaData.marcas;
			unidades = unidadData.unidadMedidas as UnidadMedida[];
		} catch (e) {
			console.error('Error loading dropdowns:', e);
		} finally {
			loadingDropdowns = false;
		}
	}

	function enterEditMode() {
		if (!producto) return;
		form = {
			nombre_comercial: producto.nombre_comercial,
			descripcion: producto.descripcion ?? '',
			codigo_barras: producto.codigo_barras ?? '',
			id_categoria: producto.id_categoria,
			id_marca: producto.id_marca,
			id_unidad_medida: producto.id_unidad_medida,
			stock_minimo: producto.stock_minimo ?? 0,
			precio_venta: producto.precio_venta ?? 0,
			maneja_vencimiento: producto.maneja_vencimiento ?? false
		};
		fotoFile = null;
		fotoPreview = null;
		loadDropdowns();
		isEditMode = true;
	}

	function cancelEdit() {
		isEditMode = false;
		fotoFile = null;
		fotoPreview = null;
		saveError = null;
	}

	async function handleSave() {
		if (!producto) return;
		isSaving = true;
		saveError = null;

		try {
			const dto: Record<string, unknown> = {
				nombre_comercial: form.nombre_comercial,
				descripcion: form.descripcion,
				id_categoria: form.id_categoria,
				id_marca: form.id_marca,
				id_unidad_medida: form.id_unidad_medida,
				stock_minimo: form.stock_minimo,
				precio_venta: form.precio_venta,
				maneja_vencimiento: form.maneja_vencimiento
			};
			if (form.codigo_barras) dto.codigo_barras = form.codigo_barras;
			if (fotoFile) dto.foto = fotoFile;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const updated = await productoService.updateProducto(id, dto as any);
			
			const cat = categorias.find((c) => c.id === form.id_categoria);
			const mar = marcas.find((m) => m.id === form.id_marca);
			const uni = unidades.find((u) => u.id === form.id_unidad_medida);

			producto = { 
				...producto, 
				...updated,
				categoria: cat || undefined,
				marca: mar || undefined,
				unidad_medida: uni || undefined
			};
			
			isEditMode = false;
			fotoFile = null;
			fotoPreview = null;
			alert('success', 'Producto actualizado correctamente.');
		} catch (err) {
			console.error(err);
			alert('error', 'Error al actualizar el producto.');
		} finally {
			isSaving = false;
		}
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		fotoFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			fotoPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	onMount(loadProducto);

	function formatDate(dateString: string | null) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function handleBack() {
		redirect('/v1/productos/productos');
	}

	const stockPercent = $derived(() => {
		if (!producto) return 0;
		const actual = producto.stock_actual_consolidado ?? producto.stock_actual ?? 0;
		const minimo = producto.stock_minimo ?? 1;
		const max = Math.max(actual, minimo * 3, 1);
		return Math.min(100, Math.round((actual / max) * 100));
	});
</script>

<!-- ═══ SKELETON ═══ -->
{#if isLoading}
	<div class="flex flex-col gap-6" in:fade>
		<div
			class="h-[60px] animate-[shimmer_1.4s_infinite] rounded-xl bg-gradient-to-r from-[#f0ebe4] via-[#e8e2d9] to-[#f0ebe4] bg-[length:200%_100%]"
		></div>
		<div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
			<div
				class="h-[360px] animate-[shimmer_1.4s_infinite] rounded-xl bg-gradient-to-r from-[#f0ebe4] via-[#e8e2d9] to-[#f0ebe4] bg-[length:200%_100%]"
			></div>
			<div class="flex flex-col gap-5">
				<div
					class="h-[200px] animate-[shimmer_1.4s_infinite] rounded-xl bg-gradient-to-r from-[#f0ebe4] via-[#e8e2d9] to-[#f0ebe4] bg-[length:200%_100%]"
				></div>
				<div
					class="h-[130px] animate-[shimmer_1.4s_infinite] rounded-xl bg-gradient-to-r from-[#f0ebe4] via-[#e8e2d9] to-[#f0ebe4] bg-[length:200%_100%]"
				></div>
				<div
					class="h-[130px] animate-[shimmer_1.4s_infinite] rounded-xl bg-gradient-to-r from-[#f0ebe4] via-[#e8e2d9] to-[#f0ebe4] bg-[length:200%_100%]"
				></div>
			</div>
		</div>
	</div>

	<!-- ═══ NOT FOUND ═══ -->
{:else if !producto}
	<div class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center" in:fade>
		<div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f0e8]">
			<TagIcon class="h-10 w-10 text-[#ccc]" />
		</div>
		<Heading level="h4" class="!text-[#1a1a2e]">Producto no encontrado</Heading>
		<Text variant="body-sm" color="accent">
			No se encontró el producto o hubo un error al cargar los datos.
		</Text>
		<Button variant="primary" onclick={handleBack}>Volver a la lista</Button>
	</div>

	<!-- ═══ MAIN CONTENT ═══ -->
{:else}
	<MainLayout
		title={producto.nombre_comercial}
		description="Información del producto."
		class="relative container  mx-auto flex flex-col gap-6"
	>
		<header
			class="flex flex-wrap items-end justify-between gap-4"
			in:fly={{ y: -16, duration: 350 }}
		>
			<div class="flex items-center gap-2">
				<Button variant="ghost" onclick={handleBack} aria-label="Volver">
					{#snippet leftIcon()}
						<ArrowLeftIcon class="size-5" />
					{/snippet}
				</Button>

				<div class="flex flex-wrap">
					<Heading level="h4" class="tracking-tight !text-[#1a1a2e]">
						{producto.nombre_comercial}
					</Heading>
				</div>
			</div>
			<div class="flex items-center gap-[0.6rem]">
				{#if !isEditMode}
					<Button variant="secondary" size="sm" onclick={enterEditMode}>
						{#snippet leftIcon()}
							<PencilIcon class="size-4" />
						{/snippet}
						Editar Producto
					</Button>
				{:else}
					<Button variant="ghost" size="sm" onclick={cancelEdit} disabled={isSaving}>
						{#snippet leftIcon()}
							<XmarkIcon class="size-4" />
						{/snippet}
						Cancelar
					</Button>
					<Button variant="primary" size="sm" onclick={handleSave} loading={isSaving}>
						{#snippet leftIcon()}
							<CheckIcon class="size-4" />
						{/snippet}
						Guardar Cambios
					</Button>
				{/if}
			</div>
		</header>

		<!-- ─── ERROR BANNER ─── -->
		{#if saveError}
			<div
				class="flex items-center gap-[0.6rem] rounded-[10px] border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-600"
				in:fly={{ y: -8, duration: 250 }}
			>
				<XmarkIcon class="size-4 flex-shrink-0" />
				<Text variant="body-sm" color="error">{saveError}</Text>
				<button
					class="ml-auto flex cursor-pointer items-center justify-center rounded border-none bg-transparent p-1 text-red-600 opacity-70 transition-opacity hover:opacity-100"
					onclick={() => (saveError = null)}
				>
					<XmarkIcon class="size-3.5" />
				</button>
			</div>
		{/if}

		<!-- ─── GRID ─── -->
		<div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
			<!-- ════ LEFT COLUMN ════ -->
			<div class="flex flex-col gap-5">
				<!-- Product Identity Card -->
				<div
					class="grid grid-cols-[168px_1fr] overflow-hidden rounded-2xl border border-[#e8e0d8] bg-white !p-0 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)]"
					in:fly={{ y: 20, duration: 380, delay: 60 }}
				>
					<!-- IMAGE PANEL -->
					<div
						class="relative flex min-h-[260px] flex-col items-center justify-center gap-2.5 border-r border-[#e8e0d8] bg-[#f5f0e8] p-6"
					>
						{#if isEditMode}
							<!-- Clickable image uploader -->
							<button
								class="group relative h-[120px] w-[120px] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#b09475] bg-transparent p-0 transition-colors hover:border-[#8b7355]"
								onclick={() => fileInput.click()}
								type="button"
								aria-label="Cambiar imagen del producto"
							>
								{#if fotoPreview}
									<img
										src={fotoPreview}
										alt="Nueva imagen"
										class="h-[120px] w-[120px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
									/>
									<div
										class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 text-[0.7rem] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
									>
										<PhotoIcon class="size-6" />
										<span>Cambiar</span>
									</div>
								{:else if producto.imagen_url}
									<img
										src={producto.imagen_url}
										alt={producto.nombre_comercial}
										class="h-[120px] w-[120px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
									/>
									<div
										class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 text-[0.7rem] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
									>
										<PhotoIcon class="size-6" />
										<span>Cambiar</span>
									</div>
								{:else}
									<div class="flex h-full w-full flex-col items-center justify-center gap-1.5">
										<PhotoIcon class="h-9 w-9 text-[#b09475]" />
										<Text variant="body-xs" color="muted">Subir imagen</Text>
									</div>
								{/if}
							</button>
							<input
								bind:this={fileInput}
								type="file"
								accept="image/*"
								onchange={handleFileChange}
								class="hidden"
							/>
							<Text variant="body-xs" color="muted" class="!text-[0.58rem]">JPG, PNG, WEBP</Text>
						{:else}
							<!-- View mode image -->
							{#if producto.imagen_url}
								<img
									src={producto.imagen_url}
									alt={producto.nombre_comercial}
									class="h-[120px] w-[120px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
								/>
							{:else}
								<div class="flex flex-col items-center gap-1.5">
									<PhotoIcon class="h-12 w-12 text-[#ccc]" />
									<Text variant="body-xs" color="muted">Sin imagen</Text>
								</div>
							{/if}
						{/if}
					</div>

					<!-- INFO SECTION -->
					<div class="flex flex-col gap-[1.1rem] p-6">
						<div class="flex items-center gap-[0.45rem]">
							<div class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b7355]"></div>
							<span class="text-[0.62rem] font-extrabold tracking-wide text-[#9a8060] uppercase"
								>INFORMACIÓN GENERAL</span
							>
						</div>

						{#if isEditMode}
							<!-- ── EDIT FORM ── -->
							<div class="grid grid-cols-2 gap-3.5">
								<!-- Nombre Comercial -->
								<div class="col-span-full flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="nombre_comercial">Nombre Comercial *</label
									>
									<input
										id="nombre_comercial"
										type="text"
										class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
										bind:value={form.nombre_comercial}
										placeholder="Ej: Cable 5mm"
									/>
								</div>

								<!-- Descripción -->
								<div class="col-span-full flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="descripcion">Descripción</label
									>
									<textarea
										id="descripcion"
										class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
										bind:value={form.descripcion}
										placeholder="Breve descripción del producto (opcional)"
										rows="2"
										maxlength="1000"
									></textarea>
								</div>

								<!-- Código de Barras -->
								<div class="col-span-full flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="codigo_barras">Código de Barras</label
									>
									<input
										id="codigo_barras"
										type="text"
										class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 font-mono text-[0.8rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
										bind:value={form.codigo_barras}
										placeholder="EAN-13, UPC, etc."
									/>
								</div>

								<!-- Categoría -->
								<div class="flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="id_categoria">Categoría *</label
									>
									{#if loadingDropdowns}
										<div
											class="h-[38px] animate-[pulse_1.4s_infinite] rounded-[9px] bg-[#e8e2d9]"
										></div>
									{:else}
										<select
											id="id_categoria"
											class="w-full cursor-pointer appearance-none rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239a8060%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat px-3 py-2 pr-8 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
											bind:value={form.id_categoria}
										>
											<option value="">Seleccionar...</option>
											{#each categorias as cat (cat.id)}
												<option value={cat.id}>{cat.nombre}</option>
											{/each}
										</select>
									{/if}
								</div>

								<!-- Marca -->
								<div class="flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="id_marca">Marca *</label
									>
									{#if loadingDropdowns}
										<div
											class="h-[38px] animate-[pulse_1.4s_infinite] rounded-[9px] bg-[#e8e2d9]"
										></div>
									{:else}
										<select
											id="id_marca"
											class="w-full cursor-pointer appearance-none rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239a8060%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat px-3 py-2 pr-8 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
											bind:value={form.id_marca}
										>
											<option value="">Seleccionar...</option>
											{#each marcas as m (m.id)}
												<option value={m.id}>{m.nombre}</option>
											{/each}
										</select>
									{/if}
								</div>

								<!-- Unidad Base -->
								<div class="form-group">
									<label class="form-label" for="id_unidad_medida">Unidad Base *</label>
									{#if loadingDropdowns}
										<div
											class="h-[38px] animate-[pulse_1.4s_infinite] rounded-[9px] bg-[#e8e2d9]"
										></div>
									{:else}
										<select
											id="id_unidad_medida"
											class="w-full cursor-pointer appearance-none rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239a8060%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat px-3 py-2 pr-8 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
											bind:value={form.id_unidad_medida}
										>
											<option value="">Seleccionar...</option>
											{#each unidades as u (u.id)}
												<option value={u.id}>{u.nombre} ({u.abreviatura})</option>
											{/each}
										</select>
									{/if}
								</div>

								<!-- Stock Mínimo -->
								<div class="flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="stock_minimo">Stock Mínimo</label
									>
									<input
										id="stock_minimo"
										type="number"
										class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
										min="0"
										step="1"
										bind:value={form.stock_minimo}
									/>
								</div>

								<!-- Precio de Venta -->
								<div class="flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="precio_venta">Precio de Venta</label
									>
									<div class="relative">
										<span
											class="absolute top-1/2 left-3 -translate-y-1/2 text-[0.85rem] font-bold text-[#b09475]"
											>Bs.</span
										>
										<input
											id="precio_venta"
											type="number"
											class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] py-2 pr-3 pl-10 text-[0.85rem] font-bold text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
											min="0"
											step="0.01"
											bind:value={form.precio_venta}
										/>
									</div>
								</div>

								<!-- Maneja Vencimiento -->
								<div class="flex flex-col gap-1.5">
									<label
										class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
										for="maneja_venc">Maneja Vencimiento</label
									>
									<button
										id="maneja_venc"
										type="button"
										class="group inline-flex w-fit cursor-pointer items-center gap-[0.7rem] rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-[0.85rem] py-[0.55rem] transition-all {form.maneja_vencimiento
											? '!border-green-500/40 !bg-green-500/10'
											: ''}"
										onclick={() => (form.maneja_vencimiento = !form.maneja_vencimiento)}
									>
										<span
											class="relative h-[20px] w-[36px] shrink-0 rounded-[100px] transition-colors {form.maneja_vencimiento
												? 'bg-[#22c55e]'
												: 'bg-[#ccc]'}"
										>
											<span
												class="absolute top-[3px] left-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 {form.maneja_vencimiento
													? 'translate-x-[16px]'
													: ''}"
											></span>
										</span>
										<span class="text-[0.8rem] font-semibold text-[#1a1a2e]">
											{form.maneja_vencimiento ? 'Sí — activo' : 'No — inactivo'}
										</span>
									</button>
								</div>
							</div>
						{:else}
							<!-- ── VIEW MODE ── -->
							<div class="grid grid-cols-2 gap-3.5">
								<!-- Nombre Comercial -->
								<div class="col-span-full flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Nombre Comercial</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Heading level="h5" class="!text-base !text-[#1a1a2e]"
											>{producto.nombre_comercial}</Heading
										>
									</div>
								</div>

								<!-- Descripción -->
								{#if producto.descripcion}
								<div class="col-span-full flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Descripción</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Text variant="body-sm" color="primary">
											{producto.descripcion}
										</Text>
									</div>
								</div>
								{/if}

								<!-- Código de Barras -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Código de Barras</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2 font-mono">
										<Text variant="body-sm" color="primary" weight="semibold">
											{producto.codigo_barras || '—'}
										</Text>
									</div>
								</div>

								<!-- Unidad Base -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Unidad Base</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Text variant="body-sm" color="primary" weight="semibold">
											{producto.unidad_medida?.nombre ?? '—'} ({producto.unidad_medida
												?.abreviatura ?? ''})
										</Text>
									</div>
								</div>

								<!-- Precio de Venta -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Precio de Venta</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Text variant="body-sm" color="primary" weight="bold">
											{formatCurrency(producto.precio_venta)}
										</Text>
									</div>
								</div>

								<!-- Categoría -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Categoría</span
									>
									<div
										class="flex items-center gap-[0.4rem] rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2"
									>
										<TagIcon class="h-3 w-3 shrink-0 text-[#b09475]" />
										<Text variant="body-sm" color="primary" weight="medium">
											{producto.categoria?.nombre || 'Sin categoría'}
										</Text>
									</div>
								</div>

								<!-- Marca -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Marca</span
									>
									<div
										class="flex items-center gap-[0.4rem] rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2"
									>
										<Text variant="body-sm" color="primary" weight="medium">
											{producto.marca?.nombre || 'Sin marca'}
										</Text>
									</div>
								</div>

								<!-- Creado / Actualizado -->
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Creado</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Text variant="body-xs" color="secondary" weight="medium">
											{formatDate(producto.createdAt)}
										</Text>
									</div>
								</div>
								<div class="flex flex-col gap-1.5">
									<span
										class="text-[0.6rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
										>Actualizado</span
									>
									<div class="rounded-lg border border-[#e8e0d8] bg-[#f8f5f0] px-3 py-2">
										<Text variant="body-xs" color="secondary" weight="medium">
											{formatDate(producto.updatedAt)}
										</Text>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Presentations Card -->
				<div
					class="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)]"
					in:fly={{ y: 20, duration: 380, delay: 130 }}
				>
					<div class="mb-[1.1rem] flex items-center justify-between">
						<div class="flex items-center gap-[0.45rem]">
							<div class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b09475]"></div>
							<span class="text-[0.62rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
								>PRESENTACIONES ADICIONALES</span
							>
						</div>
						<div class="flex items-center gap-3">
							<span
								class="rounded-[100px] border border-[#e8e0d8] bg-[#f5f0e8] px-[0.6rem] py-[0.2rem] text-[0.7rem] font-bold text-[#8b7355]"
								>{producto.presentaciones?.length || 0}</span
							>
							<Button
								variant="secondary"
								size="sm"
								class="!min-h-0 bg-transparent !px-[0.65rem] !py-1 hover:border-[#8b7355] hover:bg-[#8b7355] hover:text-white"
								onclick={openAddPres}
							>
								{#snippet leftIcon()}
									<PlusIcon class="size-3" />
								{/snippet}
								<span class="text-[0.65rem]">Agregar</span>
							</Button>
						</div>
					</div>

					{#if producto.presentaciones && producto.presentaciones.length > 0}
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each producto.presentaciones as pres (pres.id)}
								<PresentacionCard
									{pres}
									onEdit={() => openEditPres(pres)}
									onDelete={() => confirmDelPres(pres.id)}
								/>
							{/each}
						</div>
					{:else}
						<div
							class="flex flex-col items-center gap-[0.6rem] rounded-xl border-2 border-dashed border-[#e8e0d8] bg-[#f8f5f0] p-8 text-center"
						>
							<PackageIcon class="h-9 w-9 text-[#ccc]" />
							<Text variant="body-sm" color="muted">No hay presentaciones registradas.</Text>
						</div>
					{/if}
				</div>
			</div>

			<!-- ════ RIGHT COLUMN ════ -->
			<div class="ep-right">
				<!-- Inventory Hero Card -->
				<div
					class="relative overflow-hidden rounded-2xl border border-[#e8e0d8] bg-gradient-to-br from-white to-[#f8f5f0] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] after:pointer-events-none after:absolute after:-top-[50px] after:-right-[50px] after:h-[160px] after:w-[160px] after:rounded-full after:bg-[radial-gradient(circle,rgba(139,115,85,0.07)_0%,transparent_70%)]"
					in:fly={{ y: 20, duration: 380, delay: 100 }}
				>
					<div class="mb-[1.25rem] flex items-start gap-[0.85rem]">
						<div
							class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl bg-[#8b7355] text-white"
						>
							<StopwatchIcon class="size-5" />
						</div>
						<div>
							<span class="text-[0.62rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
								>INVENTARIO CONSOLIDADO</span
							>
							<div class="mt-[0.2rem] flex items-baseline gap-[0.5rem]">
								<Heading
									level="h2"
									class="!text-[2.8rem] !leading-none tracking-tight !text-[#1a1a2e]"
								>
									{producto.stock_actual_consolidado ?? producto.stock_actual ?? 0}
								</Heading>
								<Text variant="body-sm" color="muted" weight="bold">
									{producto.unidad_medida?.abreviatura}
								</Text>
							</div>
						</div>
					</div>

					<!-- Bar -->
					<div class="mb-[1.25rem] h-[5px] overflow-hidden rounded-full bg-[#e8e0d8]">
						<div
							class="h-full rounded-full transition-all duration-[900ms] {stockPercent() < 30
								? 'bg-gradient-to-r from-red-500 to-orange-500'
								: stockPercent() >= 30 && stockPercent() < 70
									? 'bg-gradient-to-r from-amber-500 to-yellow-500'
									: 'bg-gradient-to-r from-green-500 to-green-600'}"
							style="width:{stockPercent()}%"
						></div>
					</div>

					<!-- Stats -->
					<div
						class="flex items-center gap-[1rem] rounded-xl border border-[#e8e0d8] bg-[#f5f0e8] px-[1rem] py-[0.85rem]"
					>
						<div class="flex flex-1 flex-col gap-[0.25rem]">
							<span class="text-[0.58rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
								>STOCK MÍNIMO</span
							>
							<div class="flex items-baseline gap-[0.3rem]">
								<Text variant="body-sm" color="primary" weight="bold">
									{isEditMode ? form.stock_minimo : producto.stock_minimo}
								</Text>
								<Text variant="body-xs" color="muted">{producto.unidad_medida?.abreviatura}</Text>
							</div>
						</div>
						<div class="h-[36px] w-px bg-[#e8e0d8]"></div>
						<div class="flex flex-1 flex-col gap-[0.25rem]">
							<span class="text-[0.58rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
								>MANEJA VENCIMIENTO</span
							>
							<span
								class="inline-flex w-fit items-center gap-[0.3rem] rounded-[100px] px-[0.55rem] py-[0.2rem] text-[0.68rem] font-bold {(
									isEditMode ? form.maneja_vencimiento : producto.maneja_vencimiento
								)
									? 'border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#b45309]'
									: 'border border-[#e8e0d8] bg-[#f5f0e8] text-[#9a8060]'}"
							>
								{#if isEditMode ? form.maneja_vencimiento : producto.maneja_vencimiento}
									<CircleCheckIcon class="size-3" />
								{/if}
								{(isEditMode ? form.maneja_vencimiento : producto.maneja_vencimiento)
									? 'Activo'
									: 'No aplica'}
							</span>
						</div>
					</div>
				</div>

				<!-- Batches Section -->
				<div class="mt-5 flex flex-col gap-[0.85rem]" in:fly={{ y: 20, duration: 380, delay: 155 }}>
					<div class="flex items-center justify-between px-[0.2rem]">
						<div class="flex items-center gap-[0.45rem]">
							<div class="h-[6px] w-[6px] shrink-0 rounded-full bg-[#8b7355]"></div>
							<span class="text-[0.62rem] font-extrabold tracking-[0.1em] text-[#9a8060] uppercase"
								>DESGLOSE POR LOTES</span
							>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-[0.62rem] font-bold tracking-[0.05em] text-[#9a8060] uppercase">
								{producto.lotes?.length || 0} lote{(producto.lotes?.length || 0) !== 1 ? 's' : ''}
							</span>
							<Button
								variant="secondary"
								size="sm"
								class="!min-h-0 bg-transparent !px-[0.5rem] !py-0.5 hover:border-[#8b7355] hover:bg-[#8b7355] hover:text-white"
								onclick={openAddLote}
							>
								{#snippet leftIcon()}
									<PlusIcon class="size-2.5" />
								{/snippet}
								<span class="text-[0.6rem]">Agregar</span>
							</Button>
						</div>
					</div>

					{#if producto.lotes && producto.lotes.length > 0}
						<div class="flex flex-col gap-4">
							{#each producto.lotes as lote (lote.id)}
								<LoteCard
									{lote}
									onEdit={() => openEditLote(lote)}
									onDelete={() => confirmDelLote(lote.id)}
									onStockUpdate={() => loadProducto(false)}
								/>
							{/each}
						</div>
					{:else}
						<div
							class="flex flex-col items-center gap-[0.6rem] rounded-[12px] border-2 border-dashed border-[#e8e0d8] bg-[#f8f5f0] p-[2rem] text-center"
						>
							<PackageIcon class="h-[36px] w-[36px] text-[#ccc]" />
							<Text variant="body-sm" color="muted">Sin lotes disponibles.</Text>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</MainLayout>
{/if}

<!-- Modals for Presentaciones -->
<Modal
	isOpen={showModalPres}
	title={isEditPres ? 'Editar Presentación' : 'Nueva Presentación'}
	onClose={() => (showModalPres = false)}
>
	<PresentacionForm
		id_producto={id}
		{unidades}
		initialData={isEditPres && producto?.presentaciones?.find((p) => p.id === currentPresId)
			? {
					nombre: producto.presentaciones.find((p) => p.id === currentPresId)!.nombre,
					factor_conversion: Number(
						producto.presentaciones.find((p) => p.id === currentPresId)!.factor_conversion
					),
					precio_especial: Number(
						producto.presentaciones.find((p) => p.id === currentPresId)!.precio_especial
					),
					sku: producto.presentaciones.find((p) => p.id === currentPresId)!.sku || '',
					codigo_barras:
						producto.presentaciones.find((p) => p.id === currentPresId)!.codigo_barras || '',
					id_unidad_medida:
						producto.presentaciones.find((p) => p.id === currentPresId)!.id_unidad_medida || '',
					esta_activo: producto.presentaciones.find((p) => p.id === currentPresId)!.esta_activo
				}
			: undefined}
		onSubmit={handleSavePres}
		onCancel={() => (showModalPres = false)}
		isSaving={isSavingPres}
	/>
</Modal>

<ModalConfirm
	isOpen={showModalDelPres}
	message="¿Estás seguro de que deseas eliminar esta presentación? Esta acción no se puede deshacer."
	loading={isDeletingPres}
	onConfirm={handleDeletePres}
	onCancel={() => (showModalDelPres = false)}
/>

<!-- Modals for Lotes -->
<LoteModal
	isOpen={showModalLote}
	lote={selectedLote}
	id_producto={id}
	loading={isSavingLote}
	onClose={() => (showModalLote = false)}
	onSave={handleSaveLote}
/>

<ModalConfirm
	isOpen={showModalDelLote}
	message="¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer y podría afectar el stock disponible."
	loading={isDeletingLote}
	onConfirm={handleDeleteLote}
	onCancel={() => (showModalDelLote = false)}
/>
