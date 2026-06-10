<script lang="ts">
	import { onMount } from 'svelte';
	import { movimientoService } from '$lib/services';
	import type {
		Movimiento,
		MovimientoFilters,
		CreateMovimientoDto,
		CategoriaExtra
	} from '$lib/interfaces';

	import { Button, Heading, Input, ModalConfirm, Pagination, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon, ListIcon } from '$lib/icons/outline';
	import { alert } from '$lib/utils';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import { MovimientoCard, MovimientoFormModal } from '$lib/components/features/movimiento';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { MainLayout } from '$lib/components/layout';

	let movimientos = $state<Movimiento[]>([]);
	let categorias = $state<CategoriaExtra[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<MovimientoFilters>({
		page: 1,
		perPage: 15,
		search: '',
		tipo: 'INGRESO'
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let divisaInput = $state('');
	let divisaTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let isReadOnly = $state(false);
	let selectedMovimiento = $state<Movimiento | null>(null);
	let movimientoToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadMovimientos()]);
		isLoading = false;
	});

	async function loadMovimientos() {
		try {
			const response = await movimientoService.getMovimientos(filters);
			movimientos = response.movimientos;
			total = response.total;
			totalPages = response.totalPages;
			if (response.extraData?.categoriasMovimientos) {
				categorias = response.extraData.categoriasMovimientos;
			}
		} catch (error) {
			alert('error', 'Error al cargar ingresos');
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
			loadMovimientos();
		}, 500);
	}

	function handleDivisaInput(e: Event) {
		const value = (e.target as HTMLInputElement).value.toUpperCase();
		divisaInput = value;

		clearTimeout(divisaTimeout);
		divisaTimeout = setTimeout(() => {
			filters.divisa = value;
			filters.page = 1;
			loadMovimientos();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadMovimientos();
	}

	function openCreateModal() {
		selectedMovimiento = null;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openViewModal(movimiento: Movimiento) {
		selectedMovimiento = movimiento;
		isReadOnly = true;
		isFormModalOpen = true;
	}

	function openEditModal(movimiento: Movimiento) {
		selectedMovimiento = movimiento;
		isReadOnly = false;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		movimientoToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitMovimiento(data: CreateMovimientoDto) {
		try {
			if (selectedMovimiento) {
				const updated = await movimientoService.updateMovimiento(selectedMovimiento.id, data);
				// Actualizar localmente
				movimientos = movimientos.map((m) => (m.id === updated.id ? updated : m));
				alert('success', 'Ingreso actualizado exitosamente');
			} else {
				await movimientoService.createMovimiento({ ...data, tipo: 'INGRESO' });
				alert('success', 'Ingreso creado exitosamente');
				await loadMovimientos();
			}
			isFormModalOpen = false;
		} catch (error) {
			alert('error', selectedMovimiento ? 'Error al actualizar ingreso' : 'Error al crear ingreso');
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!movimientoToDelete) return;

		try {
			isDeleting = true;
			await movimientoService.deleteMovimiento(movimientoToDelete);
			alert('success', 'Ingreso eliminado exitosamente');
			movimientos = movimientos.filter((m) => m.id !== movimientoToDelete);
			total -= 1;
		} catch (error) {
			alert('error', 'Error al eliminar ingreso');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			movimientoToDelete = null;
		}
	}
</script>

<MainLayout
	title="Ingresos"
	description="Historial de ingresos"
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4" class="text-primary font-bold">Ingresos</Heading>
		</div>
		<div class="flex items-center gap-3">
			<Button
				href="/v1/finanzas/categoria-movimientos?tipo=INGRESO"
				variant="outline"
				class="border-light-four shadow-sm transition-all hover:bg-light-one_d"
			>
				{#snippet leftIcon()}<ListIcon class="size-5" />{/snippet}
				Categorías
			</Button>
			<Button onclick={openCreateModal} variant="primary" class="shadow-primary/20 shadow-lg">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Ingreso
			</Button>
		</div>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="relative min-w-[300px] flex-1">
				<div class="relative">
					<Input
						id="search-ingresos"
						type="text"
						label="Búsqueda"
						value={searchInput}
						oninput={handleSearchInput}
						placeholder="Buscar por nombre, descripción, categoría..."
						icon={ZoomIcon}
					/>
				</div>
			</div>

			<div class="w-full md:w-48">
				<Select
					id="tipoPago-ingresos"
					bind:value={filters.tipoPago}
					onchange={loadMovimientos}
					label="Método de Pago"
				>
					<option value="">Todos</option>
					<option value="EFECTIVO">Efectivo</option>
					<option value="TARJETA">Tarjeta</option>
					<option value="TRANSFERENCIA">Transferencia</option>
					<option value="QR">QR</option>
					<option value="CHEQUE">Cheque</option>
					<option value="OTRO">Otro</option>
				</Select>
			</div>

			<div class="w-full md:w-32">
				<Input
					id="divisa-ingresos"
					type="text"
					value={divisaInput}
					oninput={handleDivisaInput}
					label="Divisa"
					placeholder="Ej: BOB"
				/>
			</div>

			<div class="w-full md:w-56">
				<Select
					id="categoria-ingresos"
					bind:value={filters.categoriaMovimientoId}
					onchange={loadMovimientos}
					label="Categoría"
				>
					<option value="">Todas las categorías</option>
					{#each categorias as cat (cat.id)}
						<option value={cat.id}>{cat.nombre}</option>
					{/each}
				</Select>
			</div>
		</div>
	</div>

	{#if isLoading}
		<MovimientoTableSkeleton />
	{:else if movimientos.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<FilePencilIcon class="size-16 text-light-three" />
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron ingresos</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{filters.search
					? 'No hay resultados para tu búsqueda. Prueba con otros términos.'
					: 'Aún no has registrado ningún ingreso. ¡Empieza creando uno nuevo!'}
			</p>
			{#if !filters.search}
				<Button onclick={openCreateModal} variant="outline" class="mt-8">
					Crear mi primer ingreso
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
							>Concepto</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Monto</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Fecha</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Categoría</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Pago</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Ubicación</th
						>
						<th
							class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
							>Responsable</th
						>
						<th
							class="px-6 py-4 text-right text-xs font-bold tracking-wider text-light-two uppercase"
							>Acciones</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each movimientos as movimiento (movimiento.id)}
						<MovimientoCard
							{movimiento}
							onEdit={openEditModal}
							onDelete={openDeleteConfirm}
							onView={openViewModal}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && movimientos.length > 0}
		<Pagination
			currentPage={filters.page!}
			{totalPages}
			perPage={filters.perPage!}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<MovimientoFormModal
	bind:isOpen={isFormModalOpen}
	movimiento={selectedMovimiento}
	defaultTipo="INGRESO"
	{categorias}
	{isReadOnly}
	onSubmit={handleSubmitMovimiento}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que deseas eliminar este registro de ingreso? Esta acción no se puede deshacer y afectará los balances financieros."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
