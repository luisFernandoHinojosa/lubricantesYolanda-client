<script lang="ts">
	import type { Cliente, CreateClienteDto } from '$lib/interfaces';
	// import type { Zona } from '$lib/interfaces';
	import { clickOutside, validateSchema, type ValidationResult } from '$lib/utils';
	import { clienteRegisterSchema } from '$lib/zod';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, Select, TextArea } from '$lib/components/ui';

	interface Props {
		isOpen: boolean;
		cliente?: Cliente | null;
		// zonas: Zona[];
		onSubmit: (data: CreateClienteDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	let {
		isOpen = $bindable(),
		cliente = null,
		// zonas,
		onSubmit,
		onClose,
		isReadOnly = false
	}: Props = $props();

	let formData = $state<CreateClienteDto>({
		ci: '',
		// zona_id: '',
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		correo_electronico: '',
		fecha_nacimiento: '',
		telefono: '',
		direccion: '',
		genero: 'M',
		tipo_cliente: 'MIN'
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (cliente) {
			formData = {
				ci: cliente.ci,
				// zona_id: cliente.zona_id,
				nombre: cliente.nombre,
				apellido_paterno: cliente.apellido_paterno,
				apellido_materno: cliente.apellido_materno,
				correo_electronico: cliente.correo_electronico,
				fecha_nacimiento: cliente.fecha_nacimiento.split('T')[0],
				telefono: cliente.telefono,
				direccion: cliente.direccion,
				genero: cliente.genero,
				tipo_cliente: cliente.tipo_cliente
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			ci: '',
			// zona_id: '',
			nombre: '',
			apellido_paterno: '',
			apellido_materno: '',
			correo_electronico: '',
			fecha_nacimiento: '',
			telefono: '',
			direccion: '',
			genero: 'M',
			tipo_cliente: 'MIN'
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('formData: ', formData);
		const validation = validateSchema(clienteRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			console.log('validationErrors: ', validationErrors);
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar cliente:', error);
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
				<h2 class="text-xl font-semibold text-light-two_d">
					{#if isReadOnly}
						Ver Cliente
					{:else}
						{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
					{/if}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Input
							type="text"
							id="ci"
							label="CI"
							bind:value={formData.ci}
							placeholder="Ingrese el CI"
							error={validationErrors.ci}
							disabled={isReadOnly}
						/>
					</div>

					<!-- <div>
						<Select
							id="zona_id"
							bind:value={formData.zona_id}
							label="Zona"
							required
							error={validationErrors.zona_id}
							placeholder="Seleccione una zona"
							disabled={isReadOnly}
						>
							<option value="">Seleccione una zona</option>
							{#each zonas as zona}
								<option value={zona.id}>{zona.nombre}</option>
							{/each}
						</Select>
					</div> -->

					<div>
						<Input
							type="text"
							id="nombre"
							label="Nombre"
							bind:value={formData.nombre}
							error={validationErrors.nombre}
							required
							placeholder="Nombre"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Input
							type="text"
							id="apellido_paterno"
							label="Apellido Paterno"
							bind:value={formData.apellido_paterno}
							error={validationErrors.apellido_paterno}
							placeholder="Apellido Paterno"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Input
							type="text"
							id="apellido_materno"
							label="Apellido Materno"
							bind:value={formData.apellido_materno}
							error={validationErrors.apellido_materno}
							placeholder="Apellido Materno"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Input
							type="email"
							id="correo_electronico"
							label="Correo Electrónico"
							bind:value={formData.correo_electronico}
							error={validationErrors.correo_electronico}
							placeholder="correo@ejemplo.com"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Input
							type="tel"
							id="telefono"
							label="Teléfono"
							bind:value={formData.telefono}
							error={validationErrors.telefono}
							placeholder="Teléfono"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Input
							type="date"
							id="fecha_nacimiento"
							label="Fecha de Nacimiento"
							bind:value={formData.fecha_nacimiento}
							error={validationErrors.fecha_nacimiento}
							placeholder="Fecha de Nacimiento"
							disabled={isReadOnly}
						/>
					</div>

					<div>
						<Select
							id="genero"
							label="Género"
							bind:value={formData.genero}
							error={validationErrors.genero}
							required
							placeholder="Género"
							disabled={isReadOnly}
						>
							<option value="M">Masculino</option>
							<option value="F">Femenino</option>
						</Select>
					</div>

					<div>
						<Select
							id="tipo_cliente"
							label="Tipo de Cliente"
							bind:value={formData.tipo_cliente}
							error={validationErrors.tipo_cliente}
							required
							placeholder="Tipo de Cliente"
							disabled={isReadOnly}
						>
							<option value="MIN">Minorista</option>
							<option value="MAY">Mayorista</option>
						</Select>
					</div>
					<div class="col-span-2">
						<TextArea
							id="direccion"
							label="Dirección"
							bind:value={formData.direccion}
							error={validationErrors.direccion}
							rows={3}
							placeholder="Dirección"
							disabled={isReadOnly}
						/>
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
							{cliente ? 'Actualizar' : 'Crear'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
