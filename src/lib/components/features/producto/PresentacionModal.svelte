<script lang="ts">
	import { productoService, presentacionService, unidadMedidaService } from '$lib/services';
	import type {
		Producto,
		Presentacion,
		UnidadMedida,
		CreatePresentacionDto,
		UpdatePresentacionDto
	} from '$lib/interfaces';
	import { Modal, ModalConfirm, Text, Heading, Button } from '$lib/components/ui';
	import { PlusIcon, PackageIcon, LoaderIcon } from '$lib/icons/outline';
	import PresentacionCard from './PresentacionCard.svelte';
	import PresentacionForm from './PresentacionForm.svelte';

	interface Props {
		isOpen: boolean;
		productoId: string;
		onClose: () => void;
		onUpdate?: () => void; // Para avisar que algo cambió y recargar la tabla si es necesario
	}

	let { isOpen, productoId, onClose, onUpdate }: Props = $props();

	let producto = $state<Producto | null>(null);
	let unidades = $state<UnidadMedida[]>([]);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Form/List state
	let showForm = $state(false);
	let editingPres = $state<Presentacion | null>(null);
	let deletingPresId = $state<string | null>(null);

	async function loadData() {
		isLoading = true;
		try {
			const [prodData, unitData] = await Promise.all([
				productoService.getProductoConLotes(productoId),
				unidadMedidaService.getUnidadMedidas()
			]);
			producto = prodData;
			unidades = unitData.unidadMedidas as UnidadMedida[];
		} catch (error) {
			console.error('Error loading presentation data:', error);
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		if (isOpen && productoId) {
			loadData();
		}
	});

	function openCreate() {
		editingPres = null;
		showForm = true;
	}

	function openEdit(pres: Presentacion): void {
		editingPres = pres;
		showForm = true;
	}

	async function handleSubmit(data: CreatePresentacionDto | UpdatePresentacionDto): Promise<void> {
		isSaving = true;
		try {
			if (editingPres) {
				const updated = await presentacionService.updatePresentacion(editingPres.id, data);
				if (producto && producto.presentaciones) {
					producto.presentaciones = producto.presentaciones.map((p) =>
						p.id === editingPres!.id ? { ...p, ...updated } : p
					);
				}
			} else {
				const dataRequest: CreatePresentacionDto = {
					id_producto: productoId,
					nombre: data.nombre || '',
					factor_conversion: data.factor_conversion || 0,
					precio_especial: data.precio_especial,
					sku: data.sku,
					codigo_barras: data.codigo_barras,
					id_unidad_medida: data.id_unidad_medida
				};
				const created = await presentacionService.createPresentacion(dataRequest);
				if (producto) {
					producto.presentaciones = [...(producto.presentaciones || []), created];
				}
			}
			showForm = false;
			onUpdate?.();
		} finally {
			isSaving = false;
		}
	}

	async function confirmDelete(id: string) {
		deletingPresId = id;
	}

	async function handleDelete() {
		if (!deletingPresId) return;
		isDeleting = true;
		try {
			await presentacionService.deletePresentacion(deletingPresId);
			if (producto && producto.presentaciones) {
				producto.presentaciones = producto.presentaciones.filter((p) => p.id !== deletingPresId);
			}
			deletingPresId = null;
			onUpdate?.();
		} finally {
			isDeleting = false;
		}
	}
</script>

<Modal {isOpen} title="Gestión de Presentaciones" {onClose}>
	<div class="flex flex-col gap-6">
		{#if isLoading}
			<div class="flex h-40 flex-col items-center justify-center gap-3">
				<LoaderIcon class="h-8 w-8 animate-spin text-[#8b7355]" />
				<Text variant="body-sm" color="muted">Cargando presentaciones...</Text>
			</div>
		{:else if producto}
			<!-- Header info -->
			<div class="flex items-center gap-4 rounded-xl border border-[#e8e0d8] bg-[#f8f5f0] p-4">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
				>
					<PackageIcon class="h-6 w-6 text-[#8b7355]" />
				</div>
				<div class="flex flex-col">
					<Heading level="h5" class="!text-[1.1rem] !text-[#1a1a2e]"
						>{producto.nombre_comercial}</Heading
					>
					<Text variant="body-xs" color="muted"
						>Administra las diferentes formas de venta para este producto.</Text
					>
				</div>
			</div>

			{#if showForm}
				<div class="rounded-2xl border border-[#b09475]/30 bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<Heading level="h5" class="!text-[#8b7355]">
							{editingPres ? 'Editar Presentación' : 'Nueva Presentación'}
						</Heading>
					</div>
					<PresentacionForm
						id_producto={productoId}
						{unidades}
						initialData={editingPres
							? {
									nombre: editingPres.nombre,
									factor_conversion: Number(editingPres.factor_conversion),
									precio_especial: Number(editingPres.precio_especial),
									sku: editingPres.sku || '',
									codigo_barras: editingPres.codigo_barras || '',
									id_unidad_medida: editingPres.id_unidad_medida || '',
									esta_activo: editingPres.esta_activo
								}
							: undefined}
						onSubmit={handleSubmit}
						onCancel={() => (showForm = false)}
						{isSaving}
					/>
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold text-[#9a8060] uppercase">Listado Actual</span>
							<span class="rounded-full bg-[#f5f0e8] px-2 py-0.5 text-xs font-bold text-[#8b7355]">
								{producto.presentaciones?.length || 0}
							</span>
						</div>
						<Button variant="primary" size="sm" onclick={openCreate}>
							{#snippet leftIcon()}
								<PlusIcon class="size-4" />
							{/snippet}
							Agregar Presentación
						</Button>
					</div>

					{#if producto.presentaciones && producto.presentaciones.length > 0}
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each producto.presentaciones as pres (pres.id)}
								<PresentacionCard {pres} onEdit={openEdit} onDelete={confirmDelete} />
							{/each}
						</div>
					{:else}
						<div
							class="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#e8e0d8] bg-[#f8f5f0] py-10 text-center"
						>
							<PackageIcon class="h-10 w-10 text-[#ccc]" />
							<Text variant="body-sm" color="muted"
								>No hay presentaciones adicionales registradas.</Text
							>
							<Button variant="secondary" size="sm" onclick={openCreate}>Comenzar ahora</Button>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</Modal>

<ModalConfirm
	isOpen={!!deletingPresId}
	message="¿Estás seguro de que deseas eliminar esta presentación? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (deletingPresId = null)}
/>
