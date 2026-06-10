<script lang="ts">
	import { onMount } from 'svelte';
	import { unidadMedidaService } from '$lib/services';
	import type { UnidadMedida, UnidadMedidaFilters, CreateUnidadMedidaDto } from '$lib/interfaces';

	import { Button, Heading, Input, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { UnidadMedidaTableSkeleton } from '$lib/components/skeletons';
	import { UnidadMedidaCard, UnidadMedidaFormModal } from '$lib/components/features/unidadMedida';
	import { MainLayout } from '$lib/components/layout';

	let unidadMedidas: UnidadMedida[] = $state([]);
	let isLoading: boolean = $state(true);
	let total: number = $state(0);
	let totalPages: number = $state(1);

	let filters = $state<UnidadMedidaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedUnidadMedida = $state<UnidadMedida | null>(null);
	let unidadMedidaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await loadUnidadMedidas();
		isLoading = false;
	});

	async function loadUnidadMedidas() {
		try {
			const response = await unidadMedidaService.getUnidadMedidas(filters);
			unidadMedidas = response.unidadMedidas;
			console.log('response', response);
			console.log('unidadMedidas', unidadMedidas);
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar unidad de medida');
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
			loadUnidadMedidas();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadUnidadMedidas();
	}

	function openCreateModal() {
		selectedUnidadMedida = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(unidadMedida: UnidadMedida) {
		selectedUnidadMedida = unidadMedida;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(unidadMedida: UnidadMedida) {
		selectedUnidadMedida = unidadMedida;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		unidadMedidaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitUnidadMedida(data: CreateUnidadMedidaDto) {
		try {
			if (selectedUnidadMedida) {
				await unidadMedidaService.updateUnidadMedida(selectedUnidadMedida.id, data);
				alert('success', 'Unidad de medida actualizada exitosamente');
			} else {
				await unidadMedidaService.createUnidadMedida(data);
				alert('success', 'Unidad de medida creada exitosamente');
			}
			await loadUnidadMedidas();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedUnidadMedida
					? 'Error al actualizar Unidad de medida'
					: 'Error al crear Unidad de medida'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!unidadMedidaToDelete) return;

		try {
			isDeleting = true;
			await unidadMedidaService.deleteUnidadMedida(unidadMedidaToDelete);
			alert('success', 'Unidad de medida eliminada exitosamente');
			await loadUnidadMedidas();
		} catch (error) {
			alert('error', 'Error al eliminar unidad de medida');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			unidadMedidaToDelete = null;
		}
	}
</script>

<MainLayout
	title="Unidades de Medida"
	description="Listado de unidades de medida."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Unidades de Medida</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Unidad de Medida
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-unidades"
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
		<UnidadMedidaTableSkeleton />
	{:else if unidadMedidas.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron unidades de medida</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ninguna unidad de medida. ¡Empieza creando una nueva!'}
			</p>
			{#if !filters.search}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primera unidad
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
							Abreviatura
						</th>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each unidadMedidas as unidadMedida (unidadMedida.id)}
						<UnidadMedidaCard
							{unidadMedida}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && unidadMedidas.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<UnidadMedidaFormModal
	bind:isOpen={isFormModalOpen}
	unidadMedida={selectedUnidadMedida}
	{isReadOnly}
	onSubmit={handleSubmitUnidadMedida}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta unidad de medida? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
