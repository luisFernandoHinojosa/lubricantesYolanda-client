<!-- <script lang="ts">
	import { onMount } from 'svelte';
	import { zonasService } from '$lib/services';
	import type { CreateZonaDto, Zona, ZonaFilters } from '$lib/interfaces';
	// import { ZonaTableSkeleton } from '$lib/components/skeletons';
	import { Button, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { ZonaCard, ZonaFormModal } from '$lib/components/zona';
	import { alert } from '$lib/utils';

	// Estados principales
	let zonas = $state<Zona[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	// Filtros
	let filters = $state<ZonaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Modales y estados UI
	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedZona = $state<Zona | null>(null);
	let zonaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadZonas()]);
		isLoading = false;
	});

	// async function loadZonas() {
	// 	try {
	// 		// const response = await zonasService.getZonas(filters);
	// 		// zonas = response.zonas;
	// 		// total = response.total;
	// 		totalPages = response.totalPages;
	// 	} catch (error) {
	// 		// alert('Error al cargar clientes', 'error');
	// 		console.error('Error:', error);
	// 	}
	// }

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadZonas();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadZonas();
	}

	function openCreateModal() {
		selectedZona = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(zona: Zona) {
		selectedZona = zona;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(zona: Zona) {
		selectedZona = zona;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		zonaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitZona(data: CreateZonaDto) {
		try {
			//console.log('data submit: ', data);
			if (selectedZona) {
				await zonasService.updateZona(selectedZona.id, data);
				alert('success', 'Zona actualizada exitosamente');
			} else {
				await zonasService.createZona(data);
				alert('success', 'Zona creada exitosamente');
			}
			await loadZonas();
		} catch (error) {
			alert('error', selectedZona ? 'Error al actualizar zona' : 'Error al crear zona');
			throw error;
		}
	}

	async function handleDelete() {
		if (!zonaToDelete) return;

		try {
			isDeleting = true;
			await zonasService.deleteZona(zonaToDelete);
			alert('success', 'Zona eliminada exitosamente');
			await loadZonas();
		} catch (error) {
			alert('error', 'Error al eliminar zona');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			zonaToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Zonas</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Zona
			</Button>
		</div>
	</div>

	<div class="mb-6">
		<div class="flex gap-4">
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						value={searchInput}
						oninput={handleSearchInput}
						placeholder="Buscar por nombre, apellido, CI..."
						class="w-full rounded-md border border-light-four bg-light-one px-4 py-2 pl-10 text-light-two_d focus:border-light-two focus:ring-1 focus:ring-light-two focus:outline-none"
					/>
					<span class="absolute top-1/2 left-3 -translate-y-1/2 text-light-two"><ZoomIcon /></span>
				</div>
			</div>
		</div>
	</div>

	{#if isLoading}
		<ZonaTableSkeleton />
	{:else if zonas.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay zonas</h3>
			<p class="text-sm text-light-two">
				{filters.search
					? 'No se encontraron zonas con los filtros aplicados'
					: 'Comienza agregando tu primer zona'}
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-light-four bg-light-one">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-two">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Id
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Nombre
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Provincia
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each zonas as zona (zona.id)}
						<ZonaCard
							{zona}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && zonas.length > 0}
		<div class="mt-6">
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

<ZonaFormModal
	bind:isOpen={isFormModalOpen}
	zona={selectedZona}
	{zonas}
	{isReadOnly}
	onSubmit={handleSubmitZona}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/> -->
