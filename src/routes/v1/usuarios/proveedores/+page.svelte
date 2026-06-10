<script lang="ts">
	import { onMount } from 'svelte';
	import { proveedoresService } from '$lib/services';
	import type { Proveedor, ProveedorFilters, CreateProveedorDto } from '$lib/interfaces';

	import { ProveedorCard } from '$lib/components/features/proveedor';
	// import { Provee } from '$lib/components/proveedor';

	import { Button, Heading, Input, ModalConfirm, Pagination, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { ProveedorTableSkeleton } from '$lib/components/skeletons';
	import ProveedorFormModal from '$lib/components/features/proveedor/proveedorFormModal.svelte';
	import { MainLayout } from '$lib/components/layout';

	let proveedores = $state<Proveedor[]>([]);
	// let zonas = $state<Zona[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<ProveedorFilters>({
		page: 1,
		perPage: 15,
		search: ''
		// zona_id: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedProveedor = $state<Proveedor | null>(null);
	let proveedorToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadProveedores()]);
		isLoading = false;
	});

	async function loadProveedores() {
		try {
			const response = await proveedoresService.getProveedores(filters);
			proveedores = response.proveedores;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar proveedores');
			console.error('Error:', error);
		}
	}

	// async function loadZonas() {
	// 	try {
	// 		const response = await zonasService.getZonas();
	// 		zonas = response.zonas;
	// 	} catch (error) {
	// 		alert('error', 'Error al cargar zonas');
	// 		console.error('Error al cargar zonas:', error);
	// 	}
	// }

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadProveedores();
		}, 500);
	}

	// function handleZonaChange(id: string) {
	// 	// filters.zona_id = id;
	// 	filters.page = 1;
	// 	loadProveedores();
	// }

	function handlePageChange(page: number) {
		filters.page = page;
		loadProveedores();
	}

	function openCreateModal() {
		selectedProveedor = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(proveedor: Proveedor) {
		selectedProveedor = proveedor;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(proveedor: Proveedor) {
		selectedProveedor = proveedor;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		proveedorToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitProveedor(data: CreateProveedorDto) {
		try {
			if (selectedProveedor) {
				await proveedoresService.updateProveedor(selectedProveedor.id, data);
				alert('success', 'Proveedor actualizado exitosamente');
			} else {
				await proveedoresService.createProveedor(data);
				alert('success', 'Proveedor creado exitosamente');
			}
			await loadProveedores();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedProveedor ? 'Error al actualizar Proveedor' : 'Error al crear Proveedor'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!proveedorToDelete) return;

		try {
			isDeleting = true;
			await proveedoresService.deleteProveedor(proveedorToDelete);
			alert('success', 'Proveedor eliminado exitosamente');
			await loadProveedores();
		} catch (error) {
			alert('error', 'Error al eliminar Proveedor');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			proveedorToDelete = null;
		}
	}
</script>

<MainLayout
	title="Proveedores"
	description="Listado de proveedores."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Proveedores</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Proveedor
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-proveedores"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por nombre y apellidos"
					icon={ZoomIcon}
				/>
			</div>

			<!-- <div class="w-full md:w-48">
				<Select
					id="zona_filter"
					label="Zona"
					value={filters.zona_id}
					onchange={(e) => handleZonaChange((e.target as HTMLSelectElement).value)}
				>
					<option value="">Todas las zonas</option>
					{#each zonas as zona, index (index)}
						<option value={zona.id}>{zona.nombre}</option>
					{/each}
				</Select>
			</div> -->
		</div>
	</div>

	{#if isLoading}
		<ProveedorTableSkeleton />
	{:else if proveedores.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron proveedores</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún proveedor. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !filters.search}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primer proveedor
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
							Nombre Completo
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Empresa
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Teléfono
						</th>
						<!-- <th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Zona
						</th> -->
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Direccion
						</th>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each proveedores as proveedor (proveedor.id)}
						<ProveedorCard
							{proveedor}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && proveedores.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<ProveedorFormModal
	bind:isOpen={isFormModalOpen}
	proveedor={selectedProveedor}
	{isReadOnly}
	onSubmit={handleSubmitProveedor}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
