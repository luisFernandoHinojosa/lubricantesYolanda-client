<script lang="ts">
	import type { Cliente, CreateClienteDto, UpdateClienteDto } from '$lib/interfaces';
	import { validateSchema } from '$lib/utils';
	import { clienteRegisterSchema } from '$lib/zod';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import { Button, Input, Modal, Select, TextArea } from '$lib/components/ui';

	interface Props {
		isOpen: boolean;
		cliente?: Cliente | null;
		/** Crear envía el DTO completo; editar envía solo los campos que cambiaron */
		onSubmit: (data: CreateClienteDto | UpdateClienteDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	interface ClienteFormState {
		ci: string;
		tipo_documento: number;
		complemento: string;
		nombre: string;
		apellido_paterno: string;
		correo_electronico: string;
		fecha_nacimiento: string;
		telefono: string;
		direccion: string;
		genero: string;
		tipo_cliente: 'MIN' | 'MAY';
		esta_activo: 'true' | 'false';
	}

	let { isOpen, cliente = null, onSubmit, onClose, isReadOnly = false }: Props = $props();

	const formVacio = (): ClienteFormState => ({
		ci: '',
		tipo_documento: 1,
		complemento: '',
		nombre: '',
		apellido_paterno: '',
		correo_electronico: '',
		fecha_nacimiento: '',
		telefono: '',
		direccion: '',
		genero: '',
		tipo_cliente: 'MIN',
		esta_activo: 'true'
	});

	let formData = $state<ClienteFormState>(formVacio());
	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	// Carga el cliente (o un formulario limpio) cada vez que se abre el modal
	$effect(() => {
		if (!isOpen) return;
		validationErrors = {};
		formData = cliente
			? {
					ci: cliente.ci,
					tipo_documento: cliente.tipo_documento ?? 1,
					complemento: cliente.complemento ?? '',
					nombre: cliente.nombre,
					apellido_paterno: cliente.apellido_paterno ?? '',
					correo_electronico: cliente.correo_electronico ?? '',
					fecha_nacimiento: cliente.fecha_nacimiento?.split('T')[0] ?? '',
					telefono: cliente.telefono ?? '',
					direccion: cliente.direccion ?? '',
					genero: cliente.genero ?? '',
					tipo_cliente: cliente.tipo_cliente,
					esta_activo: cliente.esta_activo ? 'true' : 'false'
				}
			: formVacio();
	});

	const vacioANull = (v: string) => (v.trim() === '' ? null : v.trim());

	function buildCreateDto(): CreateClienteDto {
		const f = formData;
		const dto: CreateClienteDto = {
			ci: f.ci.trim(),
			tipo_documento: Number(f.tipo_documento),
			nombre: f.nombre.trim(),
			telefono: f.telefono.trim(),
			tipo_cliente: f.tipo_cliente
		};
		// Los opcionales vacíos no se envían; el backend asigna el correo por defecto
		if (f.complemento.trim()) dto.complemento = f.complemento.trim();
		if (f.apellido_paterno.trim()) dto.apellido_paterno = f.apellido_paterno.trim();
		if (f.correo_electronico.trim()) dto.correo_electronico = f.correo_electronico.trim();
		if (f.fecha_nacimiento) dto.fecha_nacimiento = f.fecha_nacimiento;
		if (f.direccion.trim()) dto.direccion = f.direccion.trim();
		if (f.genero) dto.genero = f.genero as CreateClienteDto['genero'];
		return dto;
	}

	// El PUT es parcial y estricto: solo se envían los campos que cambiaron
	function buildUpdateDto(original: Cliente): UpdateClienteDto {
		const f = formData;
		const dto: UpdateClienteDto = {};

		if (f.ci.trim() !== original.ci) dto.ci = f.ci.trim();
		if (Number(f.tipo_documento) !== (original.tipo_documento ?? 1)) {
			dto.tipo_documento = Number(f.tipo_documento);
		}
		if (f.nombre.trim() !== original.nombre) dto.nombre = f.nombre.trim();
		if (f.telefono.trim() !== original.telefono) dto.telefono = f.telefono.trim();
		if (f.tipo_cliente !== original.tipo_cliente) dto.tipo_cliente = f.tipo_cliente;

		// El correo no se puede borrar: vacío se ignora
		const correo = f.correo_electronico.trim();
		if (correo && correo !== original.correo_electronico) dto.correo_electronico = correo;

		// Estos campos se borran enviando null
		const complemento = vacioANull(f.complemento);
		if (complemento !== (original.complemento ?? null)) dto.complemento = complemento;

		const apellidos = vacioANull(f.apellido_paterno);
		if (apellidos !== (original.apellido_paterno ?? null)) dto.apellido_paterno = apellidos;

		const direccion = vacioANull(f.direccion);
		if (direccion !== (original.direccion ?? null)) dto.direccion = direccion;

		const fecha = f.fecha_nacimiento || null;
		if (fecha !== (original.fecha_nacimiento?.split('T')[0] ?? null)) dto.fecha_nacimiento = fecha;

		const genero = (f.genero || null) as UpdateClienteDto['genero'];
		if (genero !== (original.genero ?? null)) dto.genero = genero;

		const activo = f.esta_activo === 'true';
		if (activo !== original.esta_activo) dto.esta_activo = activo;

		return dto;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (isReadOnly) return;

		const validation = validateSchema(clienteRegisterSchema, formData);
		if (!validation.success) {
			validationErrors = validation.errors;
			return;
		}
		validationErrors = {};

		isSubmitting = true;
		try {
			await onSubmit(cliente ? buildUpdateDto(cliente) : buildCreateDto());
			onClose();
		} catch (error) {
			// El mensaje del backend (409, 422…) lo muestra el padre
			console.error('Error al guardar cliente:', error);
		} finally {
			isSubmitting = false;
		}
	}

	const title = $derived(isReadOnly ? 'Ver Cliente' : cliente ? 'Editar Cliente' : 'Nuevo Cliente');
</script>

<Modal {isOpen} {title} {onClose} maxWidth="sm:max-w-3xl">
	<form id="cliente-form" onsubmit={handleSubmit} class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<Select
			id="tipo_documento"
			label="Tipo de Documento"
			bind:value={formData.tipo_documento}
			error={validationErrors.tipo_documento}
			disabled={isReadOnly}
		>
			{#each TIPO_DOCUMENTO_IDENTIDAD_FACTURA as t (t.codigoClasificador)}
				<option value={t.codigoClasificador}>{t.descripcion}</option>
			{/each}
		</Select>

		<div class="grid grid-cols-[1fr_6rem] gap-3">
			<Input
				type="text"
				id="ci"
				label="CI / NIT"
				bind:value={formData.ci}
				placeholder="Ingrese el documento"
				error={validationErrors.ci}
				disabled={isReadOnly}
				maxlength={20}
				required
			/>
			<Input
				type="text"
				id="complemento"
				label="Compl."
				bind:value={formData.complemento}
				placeholder="1A"
				error={validationErrors.complemento}
				disabled={isReadOnly}
				maxlength={5}
			/>
		</div>

		<Input
			type="text"
			id="nombre"
			label="Nombre"
			bind:value={formData.nombre}
			error={validationErrors.nombre}
			required
			placeholder="Nombre"
			disabled={isReadOnly}
			maxlength={100}
		/>

		<Input
			type="text"
			id="apellido_paterno"
			label="Apellidos"
			bind:value={formData.apellido_paterno}
			error={validationErrors.apellido_paterno}
			placeholder="Apellidos"
			disabled={isReadOnly}
			maxlength={100}
		/>

		<Input
			type="tel"
			id="telefono"
			label="Teléfono"
			bind:value={formData.telefono}
			error={validationErrors.telefono}
			required
			placeholder="Teléfono"
			disabled={isReadOnly}
			maxlength={20}
		/>

		<Input
			type="email"
			id="correo_electronico"
			label="Correo Electrónico"
			bind:value={formData.correo_electronico}
			error={validationErrors.correo_electronico}
			placeholder={cliente ? 'correo@ejemplo.com' : 'Opcional (se asigna uno por defecto)'}
			disabled={isReadOnly}
			maxlength={100}
		/>

		<Input
			type="date"
			id="fecha_nacimiento"
			label="Fecha de Nacimiento"
			bind:value={formData.fecha_nacimiento}
			error={validationErrors.fecha_nacimiento}
			disabled={isReadOnly}
		/>

		<Select
			id="genero"
			label="Género"
			bind:value={formData.genero}
			error={validationErrors.genero}
			disabled={isReadOnly}
		>
			<option value="">Sin especificar</option>
			<option value="M">Masculino</option>
			<option value="F">Femenino</option>
			<option value="O">Otro</option>
		</Select>

		<Select
			id="tipo_cliente"
			label="Tipo de Cliente"
			bind:value={formData.tipo_cliente}
			error={validationErrors.tipo_cliente}
			required
			disabled={isReadOnly}
		>
			<option value="MIN">Minorista</option>
			<option value="MAY">Mayorista</option>
		</Select>

		{#if cliente}
			<Select
				id="esta_activo"
				label="Estado"
				bind:value={formData.esta_activo}
				error={validationErrors.esta_activo}
				disabled={isReadOnly}
			>
				<option value="true">Activo</option>
				<option value="false">Inactivo</option>
			</Select>
		{/if}

		<TextArea
			id="direccion"
			label="Dirección"
			bind:value={formData.direccion}
			error={validationErrors.direccion}
			rows={3}
			placeholder="Dirección"
			disabled={isReadOnly}
			maxlength={1000}
			class="sm:col-span-2"
		/>

		{#if cliente}
			<p class="text-sm text-light-two sm:col-span-2">
				Puntos acumulados: <span class="font-semibold text-light-black">{cliente.puntos}</span>
				<span class="text-xs">(se ajustan desde la opción «Ajustar puntos»)</span>
			</p>
		{/if}
	</form>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			{#if isReadOnly}
				<Button type="button" onclick={onClose} variant="secondary" size="md">Cerrar</Button>
			{:else}
				<Button
					type="button"
					onclick={onClose}
					disabled={isSubmitting}
					variant="secondary"
					size="md"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					form="cliente-form"
					disabled={isSubmitting}
					variant="primary"
					size="md"
					loading={isSubmitting}
				>
					{cliente ? 'Actualizar' : 'Crear'}
				</Button>
			{/if}
		</div>
	{/snippet}
</Modal>
