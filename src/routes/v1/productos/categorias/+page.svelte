<script lang="ts">
	import { onMount } from 'svelte';
	import { categoriaService } from '$lib/services';
	import type { CreateMarcaDto, Categoria, CategoriaFilters } from '$lib/interfaces';

	import { Button, Heading, Input, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { MarcaTableSkeleton } from '$lib/components/skeletons';

	import { CategoriaCard, CategoriaFormModal } from '$lib/components/features/categoria';
	import { MainLayout } from '$lib/components/layout';

	let categorias = $state<Categoria[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<CategoriaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedCategoria = $state<Categoria | null>(null);
	let categoriaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadCategorias()]);
		isLoading = false;
	});

	async function loadCategorias() {
		try {
			const response = await categoriaService.getCategorias(filters);
			categorias = response.categorias;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar categorias');
			console.error('Error:', error);
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

	function openEditModal(categoria: Categoria) {
		selectedCategoria = categoria;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		categoriaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitCategoria(data: CreateMarcaDto) {
		try {
			if (selectedCategoria) {
				await categoriaService.updateCategoria(selectedCategoria.id, data);
				alert('success', 'Categoria actualizada exitosamente');
			} else {
				await categoriaService.createCategoria(data);
				alert('success', 'Categoria creada exitosamente');
			}
			await loadCategorias();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedCategoria ? 'Error al actualizar Categoria' : 'Error al crear Categoria'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!categoriaToDelete) return;

		try {
			isDeleting = true;
			await categoriaService.deleteCategoria(categoriaToDelete);
			alert('success', 'Categoria eliminada exitosamente');
			await loadCategorias();
		} catch (error) {
			alert('error', 'Error al eliminar Categoria');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			categoriaToDelete = null;
		}
	}
</script>

<MainLayout
	title="Categorías"
	description="Listado de categorías de productos."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Categorías</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Categoría
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-categorias"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por nombre y apellidos"
					icon={ZoomIcon}
				/>
			</div>
		</div>
	</div>

	{#if isLoading}
		<MarcaTableSkeleton />
	{:else if categorias.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron categorías</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ninguna categoría. ¡Empieza creando una nueva!'}
			</p>
			{#if !filters.search}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primera categoría
				</Button>
			{/if}
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-one_d font-bold">
					<tr>
						<!-- <th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase">
                            CI / NIT
                        </th> -->
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Nombre
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Descripción
						</th>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each categorias as categoria (categoria.id)}
						<CategoriaCard {categoria} onEdit={openEditModal} onDelete={openDeleteConfirm} />
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

<CategoriaFormModal
	bind:isOpen={isFormModalOpen}
	categoria={selectedCategoria}
	onSubmit={handleSubmitCategoria}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta marca? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
