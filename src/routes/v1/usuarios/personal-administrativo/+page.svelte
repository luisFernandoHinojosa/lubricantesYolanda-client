<script lang="ts">
	import { onMount } from 'svelte';
	import type { Usuario, Rol } from '$lib/interfaces';
	import { rolesService, usuariosService } from '$lib/services';
	import { CrearUsuarioModal, UsuarioCard } from '$lib/components/features/usuario';
	import { Button, Heading, Input, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { EmpleadoTableSkeleton } from '$lib/components/skeletons';
	import { MainLayout } from '$lib/components/layout';

	let usuarios = $state<Usuario[]>([]);
	let roles = $state<Rol[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showCrearModal = $state(false);
	let isReadOnly = $state(false);
	let selectedUsuario = $state<Usuario | null>(null);

	// Búsqueda y filtros
	let searchTerm = $state('');
	let selectedRol = $state('');
	let selectedEstado = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		loadData();
	});

	async function loadData() {
		await Promise.all([loadUsuarios(), loadRoles()]);
	}

	async function loadUsuarios() {
		try {
			loading = true;
			error = '';
			usuarios = await usuariosService.getUsuarios({
				search: searchTerm || undefined,
				rol_id: selectedRol || undefined,
				esta_activo: selectedEstado === '' ? undefined : selectedEstado === 'true'
			});
		} catch (err) {
			error = 'Error al cargar los usuarios';
			console.error(err);
		} finally {
			loading = false;
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

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadUsuarios();
		}, 500);
	}

	function handleFilterChange() {
		loadUsuarios();
	}

	function openCrearModal() {
		selectedUsuario = null;
		isReadOnly = false;
		showCrearModal = true;
	}

	function closeCrearModal() {
		showCrearModal = false;
	}

	async function handleUsuarioCreated() {
		closeCrearModal();
		await loadUsuarios();
	}

	async function handleToggleEstado(id: string, currentEstado: boolean) {
		try {
			await usuariosService.toggleEstado(id, !currentEstado);
			await loadUsuarios();
		} catch (err) {
			alert('Error al cambiar el estado del usuario');
			console.error(err);
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getRolNombre(usuario: Usuario): string {
		if (usuario.rol) return usuario.rol.nombre_rol;
		const rol = roles.find((r) => r.id === usuario.rol_id);
		return rol?.nombre_rol || 'Sin rol';
	}

	function getRolCode(usuario: Usuario): string {
		if (usuario.rol) return usuario.rol.code_rol;
		const rol = roles.find((r) => r.id === usuario.rol_id);
		return rol?.code_rol || 'N/A';
	}
</script>

<MainLayout
	title="Personal Administrativo"
	description="Listado de personal administrativo."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Personal Administrativo</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCrearModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Usuario
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<Input
					id="search-usuarios"
					type="text"
					label="Búsqueda"
					bind:value={searchTerm}
					oninput={handleSearch}
					placeholder="Buscar por nombre o email..."
					icon={ZoomIcon}
				/>
			</div>

			<div class="w-full md:w-48">
				<Select id="filter-rol" label="Rol" bind:value={selectedRol} onchange={handleFilterChange}>
					<option value="">Todos los roles</option>
					{#each roles as rol (rol.id)}
						<option value={rol.id}>{rol.nombre_rol}</option>
					{/each}
				</Select>
			</div>

			<div class="w-full md:w-48">
				<Select
					id="filter-estado"
					label="Estado"
					bind:value={selectedEstado}
					onchange={handleFilterChange}
				>
					<option value="">Todos</option>
					<option value="true">Activos</option>
					<option value="false">Inactivos</option>
				</Select>
			</div>
		</div>
	</div>

	{#if loading}
		<EmpleadoTableSkeleton rows={5} />
	{:else if error}
		<div class="p-12 text-center">
			<p class="text-red-600">{error}</p>
			<button
				onclick={loadUsuarios}
				class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Reintentar
			</button>
		</div>
	{:else if usuarios.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron usuarios</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{searchTerm || selectedRol || selectedEstado !== ''
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún usuario. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !(searchTerm || selectedRol || selectedEstado !== '')}
				<Button
					onclick={openCrearModal}
					variant="outline"
					class="mt-8 border-light-four text-light-two hover:bg-light-one_d"
				>
					Crear mi primer usuario
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
							>Usuario</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Email</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Rol</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Estado</th
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
					{#each usuarios as usuario (usuario.id)}
						<UsuarioCard
							{usuario}
							{getRolCode}
							{getRolNombre}
							{formatDate}
							onToggleEstado={handleToggleEstado}
						/>
					{/each}
				</tbody>
			</table>
		</div>
		<!-- Contador de resultados -->
		<div class="mt-4 text-sm text-light-two">
			Total: <span class="font-medium">{usuarios.length}</span> usuarios
		</div>
	{/if}
</MainLayout>

{#if showCrearModal}
	<CrearUsuarioModal
		{roles}
		usuario={selectedUsuario}
		{isReadOnly}
		onclose={closeCrearModal}
		oncreated={handleUsuarioCreated}
	/>
{/if}
