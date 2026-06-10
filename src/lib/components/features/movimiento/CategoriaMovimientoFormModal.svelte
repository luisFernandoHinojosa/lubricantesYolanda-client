<script lang="ts">
	import type { CreateCategoriaMovimientoDto, CategoriaMovimiento } from '$lib/interfaces';
	import { clickOutside, validateSchema } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { Button, Heading, Input, TextArea } from '$lib/components/ui';
	import { CategoriaMovimientoRegisterSchema } from '$lib/zod';
	import { TredingUpIcon, TrendingDownIcon } from '$lib/icons/outline';

	interface Props {
		isOpen: boolean;
		categoria?: CategoriaMovimiento | null;
		onSubmit: (data: CreateCategoriaMovimientoDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
		defaultTipo?: 'INGRESO' | 'EGRESO';
	}

	let {
		isOpen = $bindable(),
		categoria = null,
		onSubmit,
		onClose,
		isReadOnly = false,
		defaultTipo = 'INGRESO'
	}: Props = $props();

	let formData = $state<CreateCategoriaMovimientoDto>({
		nombre: '',
		descripcion: '',
		tipo: 'INGRESO'
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (categoria) {
			formData.nombre = categoria.nombre;
			formData.descripcion = categoria.descripcion;
			formData.tipo = categoria.tipo;
		} else {
			formData.nombre = '';
			formData.descripcion = '';
			formData.tipo = defaultTipo;
		}
	});

	function resetForm() {
		formData.nombre = '';
		formData.descripcion = '';
		formData.tipo = defaultTipo;
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateSchema(CategoriaMovimientoRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar categoría:', error);
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			use:clickOutside={handleClose}
			class="w-full max-w-lg overflow-y-auto rounded-2xl bg-light-one shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="relative border-b border-light-four px-8 py-6">
				<Heading level="h4" class="text-2xl font-bold text-light-black">
					{#if categoria}
						Editar Categoría
					{:else}
						Nueva Categoría de <span
							class={formData.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'}
						>
							{formData.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
						</span>
					{/if}
				</Heading>
			</div>

			<form onsubmit={handleSubmit} class="p-8">
				<div class="space-y-6">
					<Input
						type="text"
						id="nombre"
						label="Nombre de la Categoría"
						bind:value={formData.nombre}
						placeholder="Ej: Servicios Básicos"
						required
						error={validationErrors.nombre}
						disabled={isReadOnly}
					/>

					<div class="space-y-3">
						<label
							for="tipo-modal"
							class="block text-sm font-bold tracking-wider uppercase {formData.tipo === 'INGRESO'
								? 'text-light-success'
								: 'text-light-error'}">Tipo de Categoría</label
						>

						{#if !categoria}
							<!-- Visual Informative Badge for Context-Aware UX -->
							<div
								class="flex items-center gap-4 rounded-2xl border-2 p-4 transition-all {formData.tipo ===
								'INGRESO'
									? 'border-green-100 bg-green-50/50'
									: 'border-red-100 bg-red-50/50'}"
							>
								<div
									class="flex size-12 items-center justify-center rounded-full shadow-sm {formData.tipo ===
									'INGRESO'
										? 'bg-green-100 text-green-600'
										: 'bg-red-100 text-red-600'}"
								>
									{#if formData.tipo === 'INGRESO'}
										<TredingUpIcon class="size-6" />
									{:else}
										<TrendingDownIcon class="size-6" />
									{/if}
								</div>
								<div class="flex-1">
									<p
										class="text-base font-bold {formData.tipo === 'INGRESO'
											? 'text-light-success'
											: 'text-light-error'}"
									>
										{formData.tipo === 'INGRESO' ? 'INGRESO' : 'EGRESO'}
									</p>
									<p
										class="text-xs leading-relaxed {formData.tipo === 'INGRESO'
											? 'text-light-success'
											: 'text-light-error'}"
									>
										Esta categoría se registrará como un {formData.tipo === 'INGRESO'
											? 'movimiento de entrada'
											: 'movimiento de salida'}.
									</p>
								</div>
							</div>
						{:else}
							<select
								id="tipo-modal"
								bind:value={formData.tipo}
								class="focus:ring-primary/20 w-full rounded-xl border border-light-four bg-light-one px-4 py-3 text-sm text-light-black transition-all outline-none focus:ring-4"
								disabled={isReadOnly}
							>
								<option value="INGRESO">Ingreso</option>
								<option value="EGRESO">Egreso</option>
							</select>
						{/if}
					</div>

					<TextArea
						id="descripcion"
						label="Descripción"
						bind:value={formData.descripcion}
						placeholder="Escribe para qué sirve esta categoría..."
						rows={4}
						error={validationErrors.descripcion}
						disabled={isReadOnly}
					/>
				</div>

				<div class="mt-10 flex justify-end gap-4">
					<Button type="button" onclick={handleClose} disabled={isSubmitting} variant="secondary">
						Cancelar
					</Button>
					<Button type="submit" disabled={isSubmitting} variant="primary" loading={isSubmitting}>
						{categoria ? 'Actualizar Categoría' : 'Crear Categoría'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
