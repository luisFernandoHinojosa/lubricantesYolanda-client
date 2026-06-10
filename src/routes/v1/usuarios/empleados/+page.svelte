<script lang="ts">
	import { onMount } from 'svelte';
	import { empleadosService, rolesService, sucursalService } from '$lib/services';
	import type {
		CreateEmpleadoDto,
		EmpleadoData,
		Rol,
		Sucursal,
		ZonaFilters
	} from '$lib/interfaces';
	import { EmpleadoTableSkeleton } from '$lib/components/skeletons';
	import { Button, Heading, Input, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { EmpleadoCard, EmpleadoFormModal } from '$lib/components/features/empleado';
	import { alert } from '$lib/utils';
	import { MainLayout } from '$lib/components/layout';

	// Estados principales
	let empleados = $state<EmpleadoData[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);
	let roles: Rol[] = $state([]);
	let sucursales: Sucursal[] = $state([]);

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
	let selectedEmpleado = $state<EmpleadoData | null>(null);
	let empleadoToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadEmpleados(), loadRoles(), loadSucursales()]);
		isLoading = false;
	});

	async function loadEmpleados() {
		try {
			const response = await empleadosService.getEmpleados(filters);
			empleados = response.empleados;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar empleados');
			console.error('Error:', error);
		}
	}

	async function loadRoles() {
		try {
			const response = await rolesService.getRoles({ perPage: 100 });
			roles = response;
		} catch (err) {
			console.error('Error al cargar roles:', err);
		}
	}

	async function loadSucursales() {
		try {
			const response = await sucursalService.getSucursalesCatalogo();
			sucursales = response;
		} catch (err) {
			console.error('Error al cargar sucursales:', err);
		}
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadEmpleados();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadEmpleados();
	}

	function openCreateModal() {
		selectedEmpleado = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(empleado: EmpleadoData) {
		selectedEmpleado = empleado;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(empleado: EmpleadoData) {
		selectedEmpleado = empleado;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		empleadoToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitEmpleado(data: CreateEmpleadoDto) {
		try {
			//console.log('data submit: ', data);
			if (selectedEmpleado) {
				await empleadosService.updateEmpleado(selectedEmpleado.id, data);
				alert('success', 'Empleado actualizado exitosamente');
			} else {
				await empleadosService.createEmpleado(data);
				alert('success', 'Empleado creado exitosamente');
			}
			await loadEmpleados();
		} catch (error: any) {
			console.log('Error:', error);
			const errorMessage =
				error.message ||
				(selectedEmpleado ? 'Error al actualizar empleado' : 'Error al crear empleado');
			alert('error', errorMessage);
			throw error;
		}
	}

	async function handleDelete() {
		if (!empleadoToDelete) return;

		try {
			isDeleting = true;
			await empleadosService.deleteEmpleado(empleadoToDelete);
			alert('success', 'Empleado eliminado exitosamente');
			await loadEmpleados();
		} catch (error) {
			alert('error', 'Error al eliminar empleado');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			empleadoToDelete = null;
		}
	}
</script>

<MainLayout
	title="Empleados"
	description="Listado de empleados."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Empleados</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Empleado
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-empleados"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por nombre, apellido, CI..."
					icon={ZoomIcon}
				/>
			</div>
		</div>
	</div>

	{#if isLoading}
		<EmpleadoTableSkeleton rows={filters.perPage} />
	{:else if empleados.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron empleados</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún empleado. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !filters.search}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primer empleado
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
						>
							CI
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Nombre
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Cargo
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Usuario
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Rol
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Fecha nacimiento
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Fecha contratación
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Fecha despido
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Salario
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Telefono
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Dirección
						</th>
						<th
							class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Estado
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Registro
						</th>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each empleados as empleado (empleado.id)}
						<EmpleadoCard
							{empleado}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && empleados.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<EmpleadoFormModal
	bind:isOpen={isFormModalOpen}
	empleado={selectedEmpleado}
	{roles}
	{sucursales}
	{isReadOnly}
	onSubmit={handleSubmitEmpleado}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
