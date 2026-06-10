<script lang="ts">
	//zonaFormModal.svelte
	import type { Zona, CreateZonaDto } from '$lib/interfaces';
	import { clickOutside, validateSchema, type ValidationResult } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, Select, TextArea } from '../ui';
	import { zonaRegisterSchema } from '$lib/zod';

	interface Props {
		isOpen: boolean;
		zona?: Zona | null;
		zonas: Zona[];
		onSubmit: (data: CreateZonaDto) => Promise<void>;
		onClose: () => void;
	}

	let { isOpen = $bindable(), zona = null, zonas, onSubmit, onClose }: Props = $props();

	let formData = $state<CreateZonaDto>({
		nombre: '',
		provincia: ''
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (zona) {
			formData = {
				nombre: zona.nombre,
				provincia: zona.provincia
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			nombre: '',
			provincia: ''
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('formData: ', formData);
		const validation = validateSchema(zonaRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			//console.log('validationErrors: ', validationErrors);
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar zona:', error);
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
			class="w-full max-w-3xl rounded-lg bg-light-one shadow-xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="border-b border-light-four px-6 py-4">
				<h2 class="text-xl font-semibold text-light-black">
					{zona ? 'Editar Zona' : 'Nueva Zona'}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Input
							type="text"
							id="nombre"
							label="Nombre"
							bind:value={formData.nombre}
							placeholder="Ingrese el nombre"
							required
							error={validationErrors.nombre}
						/>
					</div>

					<div>
						<Input
							type="text"
							id="provincia"
							label="Provincia"
							bind:value={formData.provincia}
							error={validationErrors.provincia}
							required
							placeholder="Ingrese la provincia"
						/>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
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
						{zona ? 'Actualizar' : 'Crear'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
