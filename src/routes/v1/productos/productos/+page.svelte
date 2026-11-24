<script lang="ts">
	import { onMount } from 'svelte';
	import ProductoForm from '$lib/components/features/producto/productoForm.svelte';
	import ProductoTable from '$lib/components/features/producto/productoTable.svelte';
	import ProductoGrid from '$lib/components/features/producto/productoGrid.svelte';
	import ProductoFilterBar from '$lib/components/features/producto/productoFilterBar.svelte';
	import { Button } from '$lib/components/ui';
	import { PlusIcon } from '$lib/icons/outline';
	import {
		productoService,
		sucursalService,
		ubicacionService,
		proveedoresService
	} from '$lib/services';
	import type {
		CreateProductoDto,
		Producto,
		Categoria,
		Marca,
		UnidadMedida,
		ProductoFilters,
		Sucursal,
		Ubicacion,
		UbicacionFisica,
		Proveedor
	} from '$lib/interfaces';
	import { Pagination, ModalConfirm } from '$lib/components/ui';
	import { fade } from 'svelte/transition';
	import { alert, redirect } from '$lib/utils';
	import type { VIEW_MODE_PRODUCTO } from '$lib/types';
	import ProductoTrasladoModal from '$lib/components/features/producto/productoTrasladoModal.svelte';
	import { PresentacionModal, ProductoViewModal } from '$lib/components/features/producto';
	import { goto } from '$app/navigation';
	import { MainLayout } from '$lib/components/layout';

	let showingForm = $state(false);
	let viewMode = $state<VIEW_MODE_PRODUCTO>('table');
	let productos = $state<Producto[]>([]);
	let categorias = $state<Categoria[]>([]);
	let marcas = $state<Marca[]>([]);
	let unidades = $state<UnidadMedida[]>([]);
	let sucursales = $state<Sucursal[]>([]);
	let ubicaciones = $state<Ubicacion[]>([]);
	let ubicacionesFisicas = $state<UbicacionFisica[]>([]);
	let proveedores = $state<Proveedor[]>([]);
	// Catálogo liviano (id + nombre) para el filtro por proveedor
	let proveedoresFiltro = $derived(proveedores.map((p) => ({ id: p.id, nombre: p.nombre })));

	let selectedProducto = $state<Producto | null>(null);
	let isViewModalOpen = $state(false);
	let fetchingProductId = $state<string | null>(null);

	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);
	let isSubmitting = $state(false);

	let isDeleteModalOpen = $state(false);
	let productoToDelete = $state<Producto | null>(null);
	let isDeleting = $state(false);

	let isTrasladoModalOpen = $state(false);
	let productoToTraslado = $state<Producto | null>(null);

	let isPresModalOpen = $state(false);
	let productoIdForPres = $state<string>('');

	let filters = $state<ProductoFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	const loadData = async () => {
		try {
			isLoading = true;
			console.log('filters: ', filters);
			const response = await productoService.getProductos(filters);
			productos = response.data.productos;
			total = response.data.total;
			totalPages = response.data.totalPages;
			console.log('response productos: ', response);

			// Populate form data from extraData
			if (response.extraData) {
				categorias = response.extraData.categorias;
				marcas = response.extraData.marcas;
				unidades = response.extraData.unidades_medida;
			}

			// Load catalogs for Carga Inicial
			if (sucursales.length === 0) {
				const [sucRes, ubRes, ubiFisRes, provRes] = await Promise.all([
					sucursalService.getSucursalesActivas().catch(() => ({ sucursales: [] })),
					ubicacionService.getUbicacionesCatalogo().catch(() => []),
					ubicacionService.getUbicacionFisicaCatalogo().catch(() => []),
					proveedoresService.getProveedoresCatalogo().catch(() => [])
				]);
				sucursales = sucRes.sucursales || [];
				ubicaciones = ubRes || [];
				ubicacionesFisicas = ubiFisRes || [];
				proveedores = provRes || [];
			}
		} catch (error) {
			console.error('Error fetching products:', error);
		} finally {
			isLoading = false;
		}
	};

	onMount(loadData);

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadData();
		}, 500);
	}

	const hayFiltros = $derived(
		!!(filters.search || filters.id_proveedor || filters.id_marca || filters.id_categoria)
	);

	function clearFilters() {
		clearTimeout(searchTimeout);
		searchInput = '';
		filters.search = '';
		filters.id_proveedor = '';
		filters.id_marca = '';
		filters.id_categoria = '';
		filters.page = 1;
		loadData();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}

	async function handleRegisterProduct(data: CreateProductoDto) {
		try {
			isSubmitting = true;
			console.log('data: ', data);
			await productoService.createProducto(data);
			alert('success', 'Producto registrado exitosamente');
			showingForm = false;
			await loadData();
		} catch (error: unknown) {
			const err = error as any;
			const mensaje = err?.message || err?.mensaje || 'Error desconocido al registrar el producto';
			alert('error', mensaje);
			console.error('Error registering product:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function toggleForm() {
		showingForm = !showingForm;
	}

	async function handleViewProducto(producto: Producto) {
		try {
			fetchingProductId = producto.id;
			// Fetch full details with lots
			const fullProducto = await productoService.getProductoConLotes(producto.id);
			selectedProducto = fullProducto;
			isViewModalOpen = true;
		} catch (error) {
			console.error('Error fetching product details:', error);
			alert('error', 'No se pudieron cargar los detalles del producto');
		} finally {
			fetchingProductId = null;
		}
	}

	function handleEditProducto(id: string) {
		redirect(`/v1/productos/productos/${id}`);
	}

	function handleTrasladoProducto(producto: Producto) {
		productoToTraslado = producto;
		isTrasladoModalOpen = true;
	}

	function handleDeleteProducto(producto: Producto) {
		productoToDelete = producto;
		isDeleteModalOpen = true;
	}

	function handleManagePresentaciones(producto: Producto) {
		productoIdForPres = producto.id;
		isPresModalOpen = true;
	}

	async function confirmDelete() {
		if (!productoToDelete) return;
		try {
			isDeleting = true;
			await productoService.deleteProducto(productoToDelete.id);
			alert('success', 'Producto eliminado exitosamente');
			isDeleteModalOpen = false;
			await loadData();
		} catch (error: unknown) {
			const err = error as any;
			const mensaje = err?.message || err?.mensaje || 'Error al eliminar el producto';
			alert('error', mensaje);
		} finally {
			isDeleting = false;
			productoToDelete = null;
		}
	}
</script>

<MainLayout
	title="Productos · Lubricantes Yolanda"
	description="Listado de productos."
	class="mx-auto max-w-[96rem] space-y-5"
>
	{#if !showingForm}
		<div class="space-y-5">
			<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<h1 class="titulo-pagina">Productos</h1>
					<p class="mt-1 text-[0.9375rem] text-acero-500" aria-live="polite">
						{#if isLoading}
							Cargando inventario…
						{:else}
							<span class="font-semibold text-acero-800 tabular-nums">{total}</span>
							{total === 1 ? 'producto' : 'productos'}{hayFiltros
								? ' con estos filtros'
								: ' registrados'}
						{/if}
					</p>
				</div>
				<Button variant="primary" onclick={toggleForm}>
					{#snippet leftIcon()}
						<PlusIcon class="size-5" />
					{/snippet}
					Registrar producto
				</Button>
			</div>

			<ProductoFilterBar
				{searchInput}
				onSearchInput={handleSearchInput}
				onClearFilters={clearFilters}
				{categorias}
				{marcas}
				proveedores={proveedoresFiltro}
				{productos}
				{viewMode}
				setViewMode={(mode) => (viewMode = mode)}
				bind:filters
				{loadData}
			/>

			{#if viewMode === 'table'}
				<ProductoTable
					{productos}
					{isLoading}
					{hayFiltros}
					onView={handleViewProducto}
					onEdit={handleEditProducto}
					onDelete={handleDeleteProducto}
					onTraslado={handleTrasladoProducto}
					onManagePresentaciones={handleManagePresentaciones}
					{fetchingProductId}
				/>
			{:else}
				<ProductoGrid
					{productos}
					{isLoading}
					onView={handleViewProducto}
					onEdit={handleEditProducto}
					onDelete={handleDeleteProducto}
					onTraslado={handleTrasladoProducto}
					onManagePresentaciones={handleManagePresentaciones}
					{fetchingProductId}
				/>
			{/if}

			{#if !isLoading && productos.length > 0}
				<div class="rounded-xl border border-acero-200 bg-white">
					<Pagination
						currentPage={filters.page!}
						{totalPages}
						perPage={filters.perPage!}
						{total}
						onPageChange={handlePageChange}
					/>
				</div>
			{/if}
		</div>
	{:else}
		<div in:fade>
			<ProductoForm
				{categorias}
				{marcas}
				{unidades}
				{sucursales}
				{ubicaciones}
				{ubicacionesFisicas}
				{proveedores}
				loading={isSubmitting}
				onSubmit={handleRegisterProduct}
				onCancel={toggleForm}
			/>
		</div>
	{/if}
</MainLayout>

<ProductoViewModal
	isOpen={isViewModalOpen}
	producto={selectedProducto}
	onClose={() => (isViewModalOpen = false)}
/>

<ModalConfirm
	isOpen={isDeleteModalOpen}
	title="¿Eliminar este producto?"
	confirmLabel="Eliminar producto"
	message={`"${productoToDelete?.nombre_comercial ?? ''}" se eliminará del inventario. Esta acción no se puede deshacer.`}
	onConfirm={confirmDelete}
	onCancel={() => (isDeleteModalOpen = false)}
	loading={isDeleting}
/>

<ProductoTrasladoModal
	isOpen={isTrasladoModalOpen}
	producto={productoToTraslado}
	onClose={() => (isTrasladoModalOpen = false)}
	onSuccess={() => {
		isTrasladoModalOpen = false;
		loadData();
	}}
/>

<PresentacionModal
	isOpen={isPresModalOpen}
	productoId={productoIdForPres}
	onClose={() => (isPresModalOpen = false)}
	onUpdate={loadData}
/>
