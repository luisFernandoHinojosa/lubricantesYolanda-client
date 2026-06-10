<script lang="ts">
	import { onMount } from 'svelte';
	import { clientesService } from '$lib/services';
	import type { Cliente, ClienteFilters, CreateClienteDto } from '$lib/interfaces';

	import { ClienteTableSkeleton } from '$lib/components/skeletons';
	import { Button, Heading, Input, ModalConfirm, Pagination, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { ClienteCard, ClienteFormModal } from '$lib/components/features/cliente';
	import { MainLayout } from '$lib/components/layout';

	// Estados principales
	let clientes = $state<Cliente[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	// Filtros
	let filters = $state<ClienteFilters>({
		page: 1,
		perPage: 15,
		search: '',
		tipo_cliente: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Modales y estados UI
	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedCliente = $state<Cliente | null>(null);
	let clienteToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await loadClientes();
		isLoading = false;
	});

	async function loadClientes() {
		try {
			// isLoading = true;
			const response = await clientesService.getClientes(filters);
			clientes = response.clientes;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar clientes');
			console.error('Error:', error);
		}
		// finally {
		// 	isLoading = false;
		// }
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadClientes();
		}, 500);
	}

	function handleTipoClienteChange(tipo: string) {
		filters.tipo_cliente = tipo as 'MIN' | 'MAY' | '';
		filters.page = 1;
		loadClientes();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadClientes();
	}

	function openCreateModal() {
		selectedCliente = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(cliente: Cliente) {
		selectedCliente = cliente;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(cliente: Cliente) {
		selectedCliente = cliente;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		clienteToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitCliente(data: CreateClienteDto) {
		try {
			console.log('data submit: ', data);
			if (selectedCliente) {
				await clientesService.updateCliente(selectedCliente.id, data);
				alert('success', 'Cliente actualizado exitosamente');
			} else {
				await clientesService.createCliente(data);
				alert('success', 'Cliente creado exitosamente');
			}
			await loadClientes();
		} catch (error) {
			alert('error', selectedCliente ? 'Error al actualizar cliente' : 'Error al crear cliente');
			throw error;
		}
	}

	async function handleDelete() {
		if (!clienteToDelete) return;

		try {
			isDeleting = true;
			await clientesService.deleteCliente(clienteToDelete);
			alert('success', 'Cliente eliminado exitosamente');
			await loadClientes();
		} catch (error) {
			alert('error', 'Error al eliminar cliente');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			clienteToDelete = null;
		}
	}
</script>

<MainLayout title="Clientes" description="Listado de clientes." class="container mx-auto space-y-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Clientes</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Cliente
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-clientes"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Buscar por nombre, apellido, CI..."
					icon={ZoomIcon}
				/>
			</div>

			<div class="w-full md:w-48">
				<Select
					id="tipo_cliente"
					label="Tipo de Cliente"
					value={filters.tipo_cliente}
					onchange={(e) => handleTipoClienteChange((e.target as HTMLSelectElement).value)}
				>
					<option value="">Todos los tipos</option>
					<option value="MIN">Minorista</option>
					<option value="MAY">Mayorista</option>
				</Select>
			</div>
		</div>
	</div>

	{#if isLoading}
		<ClienteTableSkeleton />
	{:else if clientes.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron clientes</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search || filters.tipo_cliente
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún cliente. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !(filters.search || filters.tipo_cliente)}
				<Button
					onclick={openCreateModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primer cliente
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
							Nombre Completo
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Correo
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Teléfono
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Fecha nacimiento
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Puntos
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Tipo
						</th>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Dirección
						</th>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each clientes as cliente (cliente.id)}
						<ClienteCard
							{cliente}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && clientes.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<ClienteFormModal
	bind:isOpen={isFormModalOpen}
	cliente={selectedCliente}
	{isReadOnly}
	onSubmit={handleSubmitCliente}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
