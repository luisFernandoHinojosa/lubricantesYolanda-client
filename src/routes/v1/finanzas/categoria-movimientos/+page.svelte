<script lang="ts">
	import { categoriaMovimientoService } from '$lib/services';
	import { page } from '$app/state';
	import type {
		CategoriaMovimiento,
		CategoriaMovimientoFilters,
		CreateCategoriaMovimientoDto
	} from '$lib/interfaces';

	import { Button, Heading, Input, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon, ArrowLeftIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import {
		CategoriaMovimientoCard,
		CategoriaMovimientoFormModal
	} from '$lib/components/features/movimiento';
	import { CategoriaMovimientoTableSkeleton } from '$lib/components/skeletons';
	import { MainLayout } from '$lib/components/layout';

	let categorias = $state<CategoriaMovimiento[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let currentTipo = $derived(
		(page.url.searchParams.get('tipo') || 'INGRESO') as 'INGRESO' | 'EGRESO'
	);

	let filters = $state<CategoriaMovimientoFilters>({
		page: 1,
		perPage: 15,
		search: '',
		tipo: 'INGRESO'
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedCategoria = $state<CategoriaMovimiento | null>(null);
	let categoriaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	$effect(() => {
		filters.tipo = currentTipo;
		loadCategorias();
	});

	async function loadCategorias() {
		isLoading = true;
		try {
			const response = await categoriaMovimientoService.getCategoriasMovimientos(filters);
			categorias = response.categoriasMovimientos;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar categorías');
			console.error('Error:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadCategorias();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadCategorias();
	}

	function openCreateModal() {
		selectedCategoria = null;
		isFormModalOpen = true;
	}

	function openEditModal(categoria: CategoriaMovimiento) {
		selectedCategoria = categoria;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		categoriaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmit(data: CreateCategoriaMovimientoDto) {
		try {
			if (selectedCategoria) {
				const updated = await categoriaMovimientoService.updateCategoriaMovimiento(
					selectedCategoria.id,
					data
				);
				categorias = categorias.map((c) => (c.id === updated.id ? updated : c));
				alert('success', 'Categoría actualizada exitosamente');
			} else {
				await categoriaMovimientoService.createCategoriaMovimiento(data);
				alert('success', 'Categoría creada exitosamente');
				await loadCategorias();
			}
			isFormModalOpen = false;
		} catch (error) {
			alert('error', 'Error al procesar la categoría');
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!categoriaToDelete) return;

		try {
			isDeleting = true;
			await categoriaMovimientoService.deleteCategoriaMovimiento(categoriaToDelete);
			alert('success', 'Categoría eliminada exitosamente');
			categorias = categorias.filter((c) => c.id !== categoriaToDelete);
			total -= 1;
		} catch (error) {
			alert('error', 'Error al eliminar categoría');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			categoriaToDelete = null;
		}
	}

	function goBack() {
		window.history.back();
	}
</script>

<MainLayout
	title="Gestión de Categorías de Movimientos"
	description="Administra tus categorías de ingresos y egresos."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div class="flex items-center gap-4">
			<Button onclick={goBack} variant="outline" size="xs">
				{#snippet leftIcon()}<ArrowLeftIcon class="size-5" />{/snippet}
				Volver
			</Button>
			<div>
				<Heading level="h4" class="font-bold text-light-black">
					Categorías de {currentTipo === 'INGRESO' ? 'Ingresos' : 'Egresos'}
				</Heading>
			</div>
		</div>
		<Button onclick={openCreateModal} variant="primary" class="shadow-primary/20 shadow-lg">
			{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
			Nueva Categoría
		</Button>
	</div>

	<div class="">
		<div class="relative max-w-md">
			<div class="relative">
				<Input
					id="search-categorias"
					type="text"
					label="Buscar categorías"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Ej: Comida, Servicios, Sueldos..."
					icon={ZoomIcon}
				/>
			</div>
		</div>
	</div>

	{#if isLoading}
		<CategoriaMovimientoTableSkeleton />
	{:else if categorias.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<h3 class="text-xl font-bold text-light-black">No se encontraron categorías</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has creado ninguna categoría financiera.'}
			</p>
			{#if !filters.search}
				<Button onclick={openCreateModal} variant="primary" size="md" class="mt-8">
					Crear mi primera categoría
				</Button>
			{/if}
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-one_d font-bold">
					<tr>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Nombre</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Tipo</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Descripción</th
						>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
							>Acciones</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each categorias as categoria (categoria.id)}
						<CategoriaMovimientoCard
							{categoria}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && categorias.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<CategoriaMovimientoFormModal
	bind:isOpen={isFormModalOpen}
	categoria={selectedCategoria}
	defaultTipo={currentTipo}
	onSubmit={handleSubmit}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que deseas eliminar esta categoría? Si tiene movimientos asociados, esto podría afectar la visibilidad de los reportes."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
