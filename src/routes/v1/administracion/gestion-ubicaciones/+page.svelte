<script lang="ts">
	import { onMount } from 'svelte';
	import { Heading, Button, Input, Select, ModalConfirm } from '$lib/components/ui';
	import {
		PlusIcon,
		XIcon,
		CheckIcon,
		LoaderIcon,
		ClipboardIcon,
		TagIcon,
		ChevronRightIcon
	} from '$lib/icons/outline';
	import { ubicacionService, sucursalService } from '$lib/services';
	import type {
		Ubicacion,
		UbicacionFisica,
		CreateUbicacionDto,
		CreateUbicacionFisicaDto,
		Sucursal
	} from '$lib/interfaces';
	import { alert } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';
	import { MainLayout } from '$lib/components/layout';

	// State
	let isLoading = $state(true);
	let ubicaciones = $state<Ubicacion[]>([]);
	let sucursales = $state<Sucursal[]>([]);

	// Expanded ubicacion (shows its children)
	let expandedUbicacionId = $state<string | null>(null);
	let ubicacionesFisicasMap = $state<Record<string, UbicacionFisica[]>>({});
	let loadingFisicas = $state<string | null>(null);

	// Create Ubicacion Macro form
	let showCreateMacro = $state(false);
	let isCreatingMacro = $state(false);
	let newMacro = $state<CreateUbicacionDto>({
		id_sucursal: '',
		nombre: '',
		descripcion: '',
		tipo_area: 'VENTA'
	});

	// Create Ubicacion Fisica form
	let creatingFisicaForId = $state<string | null>(null);
	let isCreatingFisica = $state(false);
	let newFisica = $state<CreateUbicacionFisicaDto>({
		id_ubicacion: '',
		nombre: '',
		descripcion: ''
	});

	// Delete modal
	let isDeleteModalOpen = $state(false);
	let deleteTarget = $state<{ type: 'macro' | 'fisica'; id: string; nombre: string } | null>(null);
	let isDeleting = $state(false);

	async function loadData() {
		try {
			isLoading = true;
			const [ubicData, sucData] = await Promise.all([
				ubicacionService.getUbicacionesFull(),
				sucursalService.getSucursalesActivas()
			]);
			ubicaciones = Array.isArray(ubicData) ? ubicData : [];
			sucursales = sucData?.sucursales || [];

			// Default sucursal if there's only one
			if (sucursales.length === 1 && !newMacro.id_sucursal) {
				newMacro.id_sucursal = sucursales[0].id!;
			}
		} catch (error) {
			console.error('Error cargando ubicaciones:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(loadData);

	async function toggleExpand(ubicacion: Ubicacion) {
		const id = ubicacion.id!;

		if (expandedUbicacionId === id) {
			expandedUbicacionId = null;
			return;
		}

		expandedUbicacionId = id;

		// Load children if not cached
		if (!ubicacionesFisicasMap[id]) {
			try {
				loadingFisicas = id;
				const fisicas = await ubicacionService.getUbicacionesFisicasByUbicacion(id);
				ubicacionesFisicasMap[id] = Array.isArray(fisicas) ? fisicas : [];
			} catch (error) {
				console.error('Error cargando ubicaciones físicas:', error);
				ubicacionesFisicasMap[id] = [];
			} finally {
				loadingFisicas = null;
			}
		}
	}

	async function handleCreateMacro() {
		if (isCreatingMacro) return;
		if (!newMacro.nombre.trim()) return alert('error', 'El nombre es requerido.');
		if (!newMacro.id_sucursal) return alert('error', 'Selecciona una sucursal.');

		try {
			isCreatingMacro = true;
			await ubicacionService.createUbicacion(newMacro);
			alert('success', `Ubicación "${newMacro.nombre}" creada correctamente.`);
			newMacro = {
				id_sucursal: newMacro.id_sucursal,
				nombre: '',
				descripcion: '',
				tipo_area: 'VENTA'
			};
			showCreateMacro = false;
			await loadData();
		} catch (error: unknown) {
			const err = error as any;
			alert('error', err?.message || 'Error al crear la ubicación.');
		} finally {
			isCreatingMacro = false;
		}
	}

	function startCreateFisica(idUbicacion: string) {
		creatingFisicaForId = idUbicacion;
		newFisica = { id_ubicacion: idUbicacion, nombre: '', descripcion: '' };
	}

	async function handleCreateFisica() {
		if (isCreatingFisica) return;
		if (!newFisica.nombre.trim()) return alert('error', 'El nombre es requerido.');

		try {
			isCreatingFisica = true;
			await ubicacionService.createUbicacionFisica(newFisica);
			alert('success', `Ubicación física "${newFisica.nombre}" creada.`);

			// Refresh children
			const fisicas = await ubicacionService.getUbicacionesFisicasByUbicacion(
				newFisica.id_ubicacion
			);
			ubicacionesFisicasMap[newFisica.id_ubicacion] = Array.isArray(fisicas) ? fisicas : [];

			creatingFisicaForId = null;
		} catch (error: unknown) {
			const err = error as any;
			alert('error', err?.message || 'Error al crear la ubicación física.');
		} finally {
			isCreatingFisica = false;
		}
	}

	function requestDelete(type: 'macro' | 'fisica', id: string, nombre: string) {
		deleteTarget = { type, id, nombre };
		isDeleteModalOpen = true;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		try {
			isDeleting = true;
			if (deleteTarget.type === 'macro') {
				await ubicacionService.deleteUbicacion(deleteTarget.id);
				await loadData();
			} else {
				await ubicacionService.deleteUbicacionFisica(deleteTarget.id);
				// Refresh the parent's children
				if (expandedUbicacionId) {
					const fisicas =
						await ubicacionService.getUbicacionesFisicasByUbicacion(expandedUbicacionId);
					ubicacionesFisicasMap[expandedUbicacionId] = Array.isArray(fisicas) ? fisicas : [];
				}
			}
			alert('success', `"${deleteTarget.nombre}" eliminada correctamente.`);
			isDeleteModalOpen = false;
		} catch (error: unknown) {
			const err = error as any;
			alert('error', err?.message || 'Error al eliminar.');
		} finally {
			isDeleting = false;
			deleteTarget = null;
		}
	}

	function getTipoAreaBadge(tipo: string) {
		switch (tipo) {
			case 'Venta':
				return 'bg-green-100 text-green-700';
			case 'Deposito':
				return 'bg-amber-100 text-amber-700';
			case 'Merma':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}
</script>

<MainLayout
	title="Gestión de Ubicaciones"
	description="Administra tus áreas macro (Tienda, Depósito) y sus ubicaciones físicas (Pasillos, Estantes)."
	class="container mx-auto space-y-6"
>
	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<Heading level="h4">Gestión de Ubicaciones</Heading>
			<!-- <p class="mt-1 text-sm text-gray-500">
				Administra tus áreas macro (Tienda, Depósito) y sus ubicaciones físicas (Pasillos,
				Estantes).
			</p> -->
		</div>
		<Button variant="primary" onclick={() => (showCreateMacro = !showCreateMacro)}>
			{#snippet leftIcon()}
				<PlusIcon class="size-5" />
			{/snippet}
			Nueva Área
		</Button>
	</div>

	<!-- Create Macro Form -->
	{#if showCreateMacro}
		<section class="overflow-hidden rounded-xl border border-light-five shadow-sm" transition:slide>
			<div class="flex items-center gap-3 border-b border-light-five p-4">
				<div class="rounded-lg bg-light-three p-2 text-light-one">
					<PlusIcon class="h-5 w-5" />
				</div>
				<h2 class="font-semibold text-light-black">Nueva Ubicación Macro (Área)</h2>
			</div>
			<div class="space-y-4 p-6">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Input
						label="NOMBRE"
						placeholder="Ej: Tienda Central, Depósito 1"
						bind:value={newMacro.nombre}
						required
					/>
					<Select label="TIPO DE ÁREA" bind:value={newMacro.tipo_area} required>
						<option value="VENTA">Venta (Tienda)</option>
						<option value="DEPOSITO">Depósito (Almacén)</option>
						<option value="MERMA">Merma (Pérdidas)</option>
					</Select>
					<Select label="SUCURSAL" bind:value={newMacro.id_sucursal} required>
						<option value="" disabled>-- SELECCIONAR --</option>
						{#each sucursales as suc (suc.id)}
							<option value={suc.id}>{suc.nombre}</option>
						{/each}
					</Select>
				</div>
				<Input
					label="DESCRIPCIÓN (OPCIONAL)"
					placeholder="Notas sobre esta área..."
					bind:value={newMacro.descripcion}
				/>
				<div class="flex gap-3">
					<Button
						onclick={handleCreateMacro}
						disabled={isCreatingMacro}
						variant="primary"
						loading={isCreatingMacro}
					>
						{#snippet leftIcon()}
							<CheckIcon class="h-4 w-4" />
						{/snippet}

						Crear Área
					</Button>
					<Button variant="secondary" onclick={() => (showCreateMacro = false)}>Cancelar</Button>
				</div>
			</div>
		</section>
	{/if}

	<!-- Ubicaciones List -->
	<div class="space-y-4">
		{#if isLoading}
			{#each Array(3) as _, index (index)}
				<div class="h-20 animate-pulse rounded-xl border border-gray-200 bg-gray-50"></div>
			{/each}
		{:else if ubicaciones.length === 0}
			<div class="rounded-xl border-2 border-dashed border-light-four p-12 text-center">
				<ClipboardIcon class="mx-auto mb-3 h-10 w-10 text-gray-300" />
				<p class="text-sm text-light-five">No hay ubicaciones registradas.</p>
				<p class="text-xs text-light-five">Crea la primera área para empezar.</p>
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2">
				{#each ubicaciones as ubic (ubic.id)}
					{@const isExpanded = expandedUbicacionId === ubic.id}
					{@const fisicas = ubicacionesFisicasMap[ubic.id!] || []}
					{@const isLoadingChildren = loadingFisicas === ubic.id}

					<div
						class="overflow-hidden rounded-xl bg-light-one shadow-sm transition-all {isExpanded
							? 'border border-light-five shadow-md'
							: ''}"
					>
						<!-- Macro Row — was a single <button>, now a <div> with two sibling areas -->
						<div
							class="flex w-full items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/50"
						>
							<!-- Clickable expand area -->
							<button
								type="button"
								onclick={() => toggleExpand(ubic)}
								class="flex flex-1 items-center gap-4 text-left"
							>
								<!-- Expand indicator -->
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all {isExpanded
										? 'rotate-90 bg-light-four text-light-one'
										: 'bg-light-four_d text-light-one'}"
								>
									<ChevronRightIcon class="h-4 w-4" />
								</div>

								<div class="flex-1">
									<div class="flex items-center gap-3">
										<h3 class="text-base font-bold text-light-black">{ubic.nombre}</h3>
										<span
											class="rounded-full px-2.5 py-0.5 text-sm font-bold tracking-wider uppercase {getTipoAreaBadge(
												ubic.tipo_area
											)}"
										>
											{ubic.tipo_area}
										</span>
									</div>
									{#if ubic.descripcion}
										<p class="mt-0.5 text-xs text-light-five">{ubic.descripcion}</p>
									{/if}
								</div>
							</button>

							<!-- Sibling actions (no longer inside the expand button) -->
							<div class="flex items-center gap-2">
								<span class="text-xs text-light-five">
									{fisicas.length || '...'} ubicaciones físicas
								</span>
								<Button
									type="button"
									onclick={() => requestDelete('macro', ubic.id!, ubic.nombre)}
									variant="ghost"
									size="xs"
									title="Eliminar"
								>
									<XIcon class="h-4 w-4" />
								</Button>
							</div>
						</div>

						<!-- Children Panel -->
						{#if isExpanded}
							<div class=" px-5 py-4" transition:slide>
								{#if isLoadingChildren}
									<div class="flex items-center gap-2 py-4">
										<LoaderIcon class="h-5 w-5 animate-spin text-light-four" />
										<span class="text-sm text-gray-400">Cargando...</span>
									</div>
								{:else if fisicas.length === 0 && creatingFisicaForId !== ubic.id}
									<div class="py-4 text-center">
										<TagIcon class="mx-auto mb-2 h-6 w-6 text-light-four" />
										<p class="text-xs text-light-five">
											Sin ubicaciones físicas. Agrega pasillos, estantes o filas.
										</p>
									</div>
								{:else}
									<div class="space-y-2">
										{#each fisicas as fisica (fisica.id)}
											<div
												class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
											>
												<div class="flex items-center gap-3">
													<div class="h-2 w-2 rounded-full bg-light-three"></div>
													<div>
														<p class="text-sm font-semibold text-gray-700">{fisica.nombre}</p>
														{#if fisica.descripcion}
															<p class="text-xs text-gray-400">{fisica.descripcion}</p>
														{/if}
													</div>
												</div>
												<Button
													onclick={() => requestDelete('fisica', fisica.id!, fisica.nombre)}
													variant="ghost"
													size="sm"
												>
													<XIcon class="h-3.5 w-3.5" />
												</Button>
											</div>
										{/each}
									</div>
								{/if}
								{#if creatingFisicaForId === ubic.id}
									<div
										class="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4"
										transition:slide
									>
										<p class="mb-3 text-lg font-bold tracking-wider text-light-two uppercase">
											Nueva ubicación física
										</p>
										<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
											<Input
												label="NOMBRE"
												placeholder="Ej: Pasillo 1, Estante A-3"
												bind:value={newFisica.nombre}
												required
											/>
											<Input
												label="DESCRIPCIÓN"
												placeholder="Opcional..."
												bind:value={newFisica.descripcion}
											/>
										</div>
										<div class="mt-3 flex gap-2">
											<Button
												onclick={handleCreateFisica}
												disabled={isCreatingFisica}
												variant="primary"
												loading={isCreatingFisica}
											>
												{#snippet leftIcon()}
													<CheckIcon class="h-3.5 w-3.5" />
												{/snippet}
												Crear
											</Button>
											<Button onclick={() => (creatingFisicaForId = null)} variant="secondary">
												Cancelar
											</Button>
										</div>
									</div>
								{:else}
									<div class="mt-4">
										<Button onclick={() => startCreateFisica(ubic.id!)} variant="primary">
											{#snippet leftIcon()}
												<PlusIcon class="h-4 w-4" />
											{/snippet}
											Agregar ubicación física
										</Button>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</MainLayout>
<ModalConfirm
	isOpen={isDeleteModalOpen}
	message={`¿Estás seguro de que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
	onConfirm={confirmDelete}
	onCancel={() => (isDeleteModalOpen = false)}
	loading={isDeleting}
/>
