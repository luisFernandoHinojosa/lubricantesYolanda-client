<script lang="ts">
	import type { CreateMarcaDto, Marca } from '$lib/interfaces';
	import { clickOutside, validateSchema } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input } from '$lib/components/ui';
	import { MarcaRegisterSchema } from '$lib/zod';

	interface Props {
		isOpen: boolean;
		marca?: Marca | null;
		onSubmit: (data: CreateMarcaDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	let {
		isOpen = $bindable(),
		marca = null,
		onSubmit,
		onClose,
		isReadOnly = false
	}: Props = $props();

	let formData = $state<CreateMarcaDto>({
		nombre: '',
		descripcion: ''
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (marca) {
			formData = {
				nombre: marca.nombre,
				descripcion: marca.descripcion
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			nombre: '',
			descripcion: ''
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateSchema(MarcaRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar proveedor:', error);
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
						Ver Marca
					{:else}
						{marca ? 'Editar Marca' : 'Nueva Marca'}
					{/if}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<div class="mb-6">
					<h3 class="mb-4 text-lg font-semibold text-light-black">Información de la Marca</h3>
					<div class="grid grid-cols-2 gap-4">
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
								id="descripcion"
								label="Descripción"
								bind:value={formData.descripcion}
								placeholder="Ej: Guillen"
								error={validationErrors.descripcion}
								disabled={isReadOnly}
							/>
						</div>
					</div>
				</div>
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
							{marca ? 'Actualizar' : 'Crear'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
