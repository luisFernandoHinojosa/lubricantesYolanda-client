<script lang="ts">
	import type { CreateMovimientoDto, Movimiento, CategoriaExtra } from '$lib/interfaces';
	import { clickOutside, validateSchema } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, Select, TextArea } from '$lib/components/ui';
	import { MovimientoRegisterSchema } from '$lib/zod';

	interface Props {
		isOpen: boolean;
		movimiento?: Movimiento | null;
		defaultTipo: 'INGRESO' | 'EGRESO';
		categorias: CategoriaExtra[];
		onSubmit: (data: CreateMovimientoDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	let {
		isOpen = $bindable(),
		movimiento = null,
		defaultTipo,
		categorias = [],
		onSubmit,
		onClose,
		isReadOnly = false
	}: Props = $props();
	console.log('categorias modal', categorias);
	let formData = $state<CreateMovimientoDto>({
		nombre: '',
		monto: 0,
		descripcion: '',
		fecha: new Date().toISOString().split('T')[0],
		tipo: defaultTipo,
		tipoPago: 'EFECTIVO',
		divisa: 'BOB',
		categoriaMovimientoId: ''
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (movimiento) {
			formData = {
				nombre: movimiento.nombre,
				monto: Number(movimiento.monto),
				descripcion: movimiento.descripcion,
				fecha: movimiento.fecha.split('T')[0],
				tipo: movimiento.tipo,
				tipoPago: movimiento.tipoPago,
				divisa: movimiento.divisa,
				categoriaMovimientoId: movimiento.categoriaMovimientoId
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			nombre: '',
			monto: 0,
			descripcion: '',
			fecha: new Date().toISOString().split('T')[0],
			tipo: defaultTipo,
			tipoPago: 'EFECTIVO',
			divisa: 'BOB',
			categoriaMovimientoId: ''
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateSchema(MovimientoRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit({ ...formData, monto: Number(formData.monto) });
			handleClose();
		} catch (error) {
			console.error('Error al guardar movimiento:', error);
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
			class="w-full max-w-2xl overflow-y-auto rounded-2xl bg-light-one shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="border-b border-light-four px-8 py-6">
				<h2 class="text-2xl font-bold text-light-black">
					{#if isReadOnly}
						Detalles del Movimiento
					{:else}
						{movimiento
							? 'Editar Movimiento'
							: `Nuevo ${defaultTipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}`}
					{/if}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-8">
				<div class="space-y-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Input
							type="text"
							id="nombre"
							label="Nombre / Título"
							bind:value={formData.nombre}
							placeholder="Ej: Pago de servicios"
							required
							error={validationErrors.nombre}
							disabled={isReadOnly}
						/>

						<Input
							type="number"
							id="monto"
							label="Monto"
							bind:value={formData.monto}
							placeholder="0.00"
							step="0.01"
							required
							error={validationErrors.monto}
							disabled={isReadOnly}
						/>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Input
							type="date"
							id="fecha"
							label="Fecha"
							bind:value={formData.fecha}
							required
							error={validationErrors.fecha}
							disabled={isReadOnly}
						/>

						<Select
							id="categoriaMovimientoId"
							label="Categoría"
							bind:value={formData.categoriaMovimientoId}
							required
							error={validationErrors.categoriaMovimientoId}
							disabled={isReadOnly}
						>
							<option value="" disabled>Seleccione una categoría</option>
							{#each categorias as cat (cat.id)}
								<option value={cat.id}>{cat.nombre}</option>
							{/each}
						</Select>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Select
							id="tipoPago"
							label="Método de Pago"
							bind:value={formData.tipoPago}
							required
							error={validationErrors.tipoPago}
							disabled={isReadOnly}
						>
							<option value="EFECTIVO">Efectivo</option>
							<option value="TARJETA">Tarjeta</option>
							<option value="TRANSFERENCIA">Transferencia</option>
							<option value="QR">QR</option>
							<option value="CHEQUE">Cheque</option>
							<option value="OTRO">Otro</option>
						</Select>

						<Input
							type="text"
							id="divisa"
							label="Divisa"
							bind:value={formData.divisa}
							placeholder="Ej: BOB, USD"
							required
							error={validationErrors.divisa}
							disabled={isReadOnly}
						/>
					</div>

					<TextArea
						id="descripcion"
						label="Descripción"
						bind:value={formData.descripcion}
						placeholder="Escribe una descripción detallada..."
						rows={3}
						error={validationErrors.descripcion}
						disabled={isReadOnly}
					/>
				</div>

				<div class="mt-10 flex justify-end gap-4">
					{#if isReadOnly}
						<Button type="button" onclick={handleClose} variant="secondary">Cerrar</Button>
					{:else}
						<Button type="button" onclick={handleClose} disabled={isSubmitting} variant="secondary">
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting} variant="primary" loading={isSubmitting}>
							{movimiento ? 'Actualizar Cambios' : 'Registrar Movimiento'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
