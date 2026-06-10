<script lang="ts">
	import { onMount } from 'svelte';
	import type { Rol } from '$lib/interfaces';
	import { rolesService } from '$lib/services';
	import { CrearRolModal, RolCard } from '$lib/components/features/roles';
	import { Button, Heading, Input } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { MainLayout } from '$lib/components/layout';

	let roles = $state<Rol[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showCrearModal = $state(false);
	let isReadOnly = $state(false);
	let selectedRol = $state<Rol | null>(null);
	let currentPage = $state(1);
	let perPage = $state(10);
	let totalPages = $state(1);
	let total = $state(0);
	let searchTerm = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		loadRoles();
	});

	async function loadRoles() {
		try {
			loading = true;
			error = '';
			const response = await rolesService.getRoles({
				page: currentPage,
				perPage,
				search: searchTerm || undefined
			});

			roles = response;
		} catch (err) {
			error = 'Error al cargar los roles';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			currentPage = 1;
			loadRoles();
		}, 500);
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadRoles();
	}

	function openCrearModal() {
		selectedRol = null;
		isReadOnly = false;
		showCrearModal = true;
	}

	function openViewModal(rol: Rol) {
		selectedRol = rol;
		isReadOnly = true;
		showCrearModal = true;
	}

	function openEditModal(rol: Rol) {
		selectedRol = rol;
		isReadOnly = false;
		showCrearModal = true;
	}

	function closeCrearModal() {
		showCrearModal = false;
	}

	async function handleRolSuccess() {
		closeCrearModal();
		alert('success', `Rol ${selectedRol ? 'actualizado' : 'creado'} correctamente`);
		await loadRoles();
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<MainLayout title="Roles" description="Listado de roles." class="container mx-auto space-y-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Roles</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCrearModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Rol
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-roles"
					type="text"
					label="Búsqueda"
					bind:value={searchTerm}
					oninput={handleSearch}
					placeholder="Buscar por nombre o código..."
					icon={ZoomIcon}
				/>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="p-12 text-center">
			<div
				class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
			></div>
			<p class="mt-4 text-gray-600">Cargando roles...</p>
		</div>
	{:else if error}
		<div class="p-12 text-center">
			<p class="text-red-600">{error}</p>
			<button
				onclick={loadRoles}
				class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Reintentar
			</button>
		</div>
	{:else if roles.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron roles</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{searchTerm
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún rol. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !searchTerm}
				<Button
					onclick={openCrearModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primer rol
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
							>Código</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Nombre</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Descripción</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Fecha Creación</th
						>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
							>Acciones</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each roles as rol (rol.id)}
						<RolCard {rol} onEdit={openEditModal} onView={openViewModal} {formatDate} />
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Paginación -->
		{#if totalPages > 1}
			<div class="mt-4 border-t border-gray-200 bg-white px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="text-sm text-gray-700">
						Mostrando
						<span class="font-medium">{(currentPage - 1) * perPage + 1}</span>
						a
						<span class="font-medium">{Math.min(currentPage * perPage, total)}</span>
						de
						<span class="font-medium">{total}</span>
						resultados
					</div>
					<div class="flex gap-2">
						<button
							onclick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Anterior
						</button>
						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
							{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
								<button
									onclick={() => handlePageChange(page)}
									class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors {page ===
									currentPage
										? 'border-blue-600 bg-blue-600 text-white'
										: 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
								>
									{page}
								</button>
							{:else if page === currentPage - 2 || page === currentPage + 2}
								<span class="px-2 py-2 text-gray-500">...</span>
							{/if}
						{/each}
						<button
							onclick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Siguiente
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</MainLayout>
<!-- Modal Crear / Editar Rol -->
{#if showCrearModal}
	<CrearRolModal
		role={selectedRol}
		{isReadOnly}
		onClose={closeCrearModal}
		onSuccess={handleRolSuccess}
	/>
{/if}
