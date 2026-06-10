<script lang="ts">
	import type { Proveedor, CreateProveedorDto } from '$lib/interfaces';
	import { clickOutside, validateSchema } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, TextArea } from '$lib/components/ui';
	import { ProveedorRegisterSchema } from '$lib/zod';

	interface Props {
		isOpen: boolean;
		proveedor?: Proveedor | null;
		// zonas: Zona[];
		onSubmit: (data: CreateProveedorDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	let {
		isOpen = $bindable(),
		proveedor = null,
		// zonas,
		onSubmit,
		onClose,
		isReadOnly = false
	}: Props = $props();

	let formData = $state<CreateProveedorDto>({
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		empresa: '',
		// zona_id: '',
		telefono: '',
		direccion: ''
	});

	let submitError = $state<string | null>(null);
	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (!isOpen) return;

		if (proveedor) {
			formData = {
				nombre: proveedor.nombre,
				apellido_paterno: proveedor.apellido_paterno,
				apellido_materno: proveedor.apellido_materno,
				empresa: proveedor.empresa,
				telefono: proveedor.telefono,
				direccion: proveedor.direccion
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			nombre: '',
			apellido_paterno: '',
			apellido_materno: '',
			empresa: '',
			telefono: '',
			direccion: ''
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateSchema(ProveedorRegisterSchema, formData);
		if (!validation.success) {
			validationErrors = validation.errors;
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar proveedor:', error);
			submitError = 'Ocurrió un error al guardar. Intenta de nuevo.';
		} finally {
			isSubmitting = false;
			validationErrors = {};
		}
	}

	function handleClose() {
		resetForm();
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		transition:fade={{ duration: 200 }}
	>
		<div
			use:clickOutside={handleClose}
			class="w-full max-w-4xl overflow-y-auto rounded-lg bg-light-one shadow-xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="border-b border-light-four px-6 py-4">
				<h2 class="text-xl font-semibold text-light-black">
					{#if isReadOnly}
						Ver Proveedor
					{:else}
						{proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
					{/if}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<!-- Datos del Proveedor -->
				<div class="mb-6">
					<h3 class="mb-4 text-lg font-semibold text-light-black">Información del Proveedor</h3>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<Input
								type="text"
								id="nombre"
								label="Nombre"
								bind:value={formData.nombre}
								placeholder="Ej: Liucas"
								required
								error={validationErrors.nombre}
								disabled={isReadOnly}
							/>
						</div>

						<div>
							<Input
								type="text"
								id="apellido_paterno"
								label="Apellido Paterno"
								bind:value={formData.apellido_paterno}
								placeholder="Ej: Guillen"
								error={validationErrors.apellido_paterno}
								disabled={isReadOnly}
							/>
						</div>

						<div>
							<Input
								type="text"
								id="apellido_materno"
								label="Apellido Materno"
								bind:value={formData.apellido_materno}
								placeholder="Ej: Robertson"
								error={validationErrors.apellido_materno}
								disabled={isReadOnly}
							/>
						</div>
					</div>

					<div class="mt-4 grid grid-cols-2 gap-4">
						<div>
							<Input
								type="text"
								id="empresa"
								label="Empresa"
								bind:value={formData.empresa}
								placeholder="Ej: Sofia"
								required
								error={validationErrors.empresa}
								disabled={isReadOnly}
							/>
						</div>

						<div>
							<Input
								type="text"
								id="telefono"
								label="Teléfono"
								bind:value={formData.telefono}
								placeholder="Ej: 789494654"
								error={validationErrors.telefono}
								maxlength={10}
								disabled={isReadOnly}
							/>
						</div>
					</div>
				</div>

				<!-- Ubicación -->
				<div class="mb-6">
					<!-- <h3 class="mb-4 text-lg font-semibold text-light-black">Ubicación</h3> -->
					<div class="grid grid-cols-1 gap-4">
						<!-- <div>
							<Select
								id="zona_id"
								label="Zona"
								bind:value={formData.zona_id}
								required
								error={validationErrors.zona_id}
								placeholder="Seleccione una zona"
								disabled={isReadOnly}
							>
								{#each zonas as z}
									<option value={z.id}>{z.nombre} - {z.provincia}</option>
								{/each}
							</Select>
						</div> -->

						<div>
							<TextArea
								id="direccion"
								label="Dirección"
								bind:value={formData.direccion}
								placeholder="Ej: B/los cafeces, calle 123"
								error={validationErrors.direccion}
								rows={3}
								disabled={isReadOnly}
							/>
						</div>
					</div>
				</div>
				{#if submitError}
					<p class="mb-3 text-sm text-red-500">{submitError}</p>
				{/if}
				<!-- Botones -->
				<div class="mt-6 flex justify-end gap-3">
					{#if isReadOnly}
						<Button type="button" onclick={handleClose} variant="secondary" size="md">
							Cerrar
						</Button>
					{:else}
						<Button
							type="button"
							onclick={handleClose}
							disabled={isSubmitting}
							variant="secondary"
							size="md"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							variant="primary"
							size="md"
							loading={isSubmitting}
						>
							{proveedor ? 'Actualizar' : 'Crear'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
