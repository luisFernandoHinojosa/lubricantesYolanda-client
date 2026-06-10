<script lang="ts">
	import { onMount } from 'svelte';
	import { marcaService } from '$lib/services';
	import type { Marca, MarcaFilters, CreateMarcaDto } from '$lib/interfaces';

	import { Button, Heading, Input, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { MarcaTableSkeleton } from '$lib/components/skeletons';
	import { MarcaCard, MarcaFormModal } from '$lib/components/features/marca';
	import { MainLayout } from '$lib/components/layout';

	let marcas = $state<Marca[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<MarcaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedMarca = $state<Marca | null>(null);
	let marcaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadMarcas()]);
		isLoading = false;
	});

	async function loadMarcas() {
		try {
			const response = await marcaService.getMarcas(filters);
			marcas = response.marcas;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar marcas');
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
			loadMarcas();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadMarcas();
	}

	function openCreateModal() {
		selectedMarca = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(marca: Marca) {
		selectedMarca = marca;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(marca: Marca) {
		selectedMarca = marca;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		marcaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitMarca(data: CreateMarcaDto) {
		try {
			if (selectedMarca) {
				const updatedMarca = await marcaService.updateMarca(selectedMarca.id, data);
				// Actualizar la marca en la lista local sin recargar todo
				marcas = marcas.map((m) => (m.id === updatedMarca.id ? updatedMarca : m));
				alert('success', 'Marca actualizada exitosamente');
			} else {
				await marcaService.createMarca(data);
				alert('success', 'Marca creada exitosamente');
				await loadMarcas();
			}
			isFormModalOpen = false;
		} catch (error) {
			alert('error', selectedMarca ? 'Error al actualizar Marca' : 'Error al crear Marca');
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!marcaToDelete) return;

		try {
			isDeleting = true;
			await marcaService.deleteMarca(marcaToDelete);
			alert('success', 'Marca eliminada exitosamente');
			marcas = marcas.filter((m) => m.id !== marcaToDelete);
			total -= 1;
		} catch (error) {
			alert('error', 'Error al eliminar Marca');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			marcaToDelete = null;
		}
	}
</script>

<MainLayout
	title="Marcas"
	description="Listado de marcas de productos."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Marcas</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Marca
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-marcas"
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
	{:else if marcas.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron marcas</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ninguna marca. ¡Empieza creando una nueva!'}
			</p>
			{#if !filters.search}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primera marca
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
					{#each marcas as marca (marca.id)}
						<MarcaCard
							{marca}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && marcas.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<MarcaFormModal
	bind:isOpen={isFormModalOpen}
	marca={selectedMarca}
	{isReadOnly}
	onSubmit={handleSubmitMarca}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta marca? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
