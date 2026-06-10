<script lang="ts">
	import { Button, Input, Select, TextArea } from '$lib/components/ui';
	import { XIcon } from '$lib/icons/outline';
	import type { Empleado, CreateEmpleadoDto, Rol, Sucursal } from '$lib/interfaces';
	import { clickOutside, validateSchema } from '$lib/utils';
	import { EmpleadoRegisterSchema } from '$lib/zod';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		isOpen: boolean;
		empleado?: any;
		roles: Rol[];
		sucursales: Sucursal[];
		onSubmit: (data: CreateEmpleadoDto) => Promise<void>;
		onClose: () => void;
		isReadOnly?: boolean;
	}

	let {
		isOpen = $bindable(),
		empleado = null,
		roles,
		sucursales,
		onSubmit,
		onClose,
		isReadOnly = false
	}: Props = $props();

	let formData = $state<CreateEmpleadoDto>({
		ci: '',
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		cargo: '',
		fecha_nacimiento: '',
		fecha_contratacion: '',
		salario_base: 0,
		telefono: '',
		direccion: '',
		usuario: {
			rol_id: '',
			name_user: '',
			email: '',
			password: '',
			id_sucursal: ''
		}
	});

	let confirmPassword = $state('');
	let crearUsuario = $state(false);
	let initialHasUser = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	const CARGOS = [
		'Gerente',
		'Supervisor',
		'Ayudante',
		'Operador',
		'Técnico',
		'Administrativo',
		'Contador',
		'Vendedor',
		'Chofer',
		'Almacenero'
	];

	$effect(() => {
		if (empleado) {
			formData = {
				ci: empleado.ci || '',
				nombre: empleado.nombre || '',
				apellido_paterno: empleado.apellido_paterno || '',
				apellido_materno: empleado.apellido_materno || '',
				cargo: empleado.cargo || '',
				fecha_nacimiento: empleado.fecha_nacimiento ? empleado.fecha_nacimiento.split('T')[0] : '',
				fecha_contratacion: empleado.fecha_contratacion ? empleado.fecha_contratacion.split('T')[0] : '',
				salario_base: Number(empleado.salario_base) || 0,
				telefono: empleado.telefono || '',
				direccion: empleado.direccion || '',
				usuario: empleado.Usuario ? {
					rol_id: empleado.Usuario.Role?.id || '',
					name_user: empleado.Usuario.name_user || '',
					email: empleado.Usuario.email || '',
					password: '',
					id_sucursal: empleado.Usuario.id_sucursal || ''
				} : {
					rol_id: '',
					name_user: '',
					email: '',
					password: '',
					id_sucursal: ''
				}
			};
			crearUsuario = !!empleado.Usuario;
			initialHasUser = !!empleado.Usuario;
		} else {
			resetForm();
		}
	});

	function formatDateForInput(dateString: string): string {
		const date = new Date(dateString);
		return date.toISOString().split('T')[0];
	}

	function formatDateForAPI(dateString: string): string {
		const [year, month, day] = dateString.split('-');
		return `${day}-${month}-${year}`;
	}

	function resetForm() {
		formData = {
			ci: '',
			nombre: '',
			apellido_paterno: '',
			apellido_materno: '',
			cargo: '',
			fecha_nacimiento: '',
			fecha_contratacion: '',
			salario_base: 0,
			telefono: '',
			direccion: '',
			usuario: {
				rol_id: '',
				name_user: '',
				email: '',
				password: '',
				id_sucursal: ''
			}
		};
		confirmPassword = '';
		crearUsuario = false;
		initialHasUser = false;
		showPassword = false;
		showConfirmPassword = false;
		validationErrors = {};
	}

	function toggleCrearUsuario() {
		crearUsuario = !crearUsuario;
		if (!crearUsuario) {
			formData.usuario = {
				rol_id: '',
				name_user: '',
				email: '',
				password: '',
				id_sucursal: ''
			};
			confirmPassword = '';
			// Limpiar errores de usuario
			delete validationErrors['usuario.rol_id'];
			delete validationErrors['usuario.name_user'];
			delete validationErrors['usuario.email'];
			delete validationErrors['usuario.password'];
			delete validationErrors['usuario.id_sucursal'];
			delete validationErrors.confirmPassword;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('formData: ', formData);
		const validation = validateSchema(EmpleadoRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			console.log('validationErrors: ', validationErrors);
			return;
		}

		isSubmitting = true;
		try {
			const dataToSubmit = JSON.parse(JSON.stringify(formData));

			if (empleado) {
				if (!crearUsuario) {
					// Caso 1 y Caso 4: Se quita o se mantiene sin usuario
					delete dataToSubmit.usuario;
				} else {
					// Caso 2 y 3: Mantener/Crear usuario
					if (dataToSubmit.usuario && !dataToSubmit.usuario.password) {
						delete dataToSubmit.usuario.password;
					}
				}
			} else {
				// Crear empleado
				if (!crearUsuario) {
					delete dataToSubmit.usuario;
				}
			}

			await onSubmit(dataToSubmit);
			handleClose();
		} catch (error) {
			console.error('Error al guardar empleado:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		transition:fade={{ duration: 200 }}
	>
		<div
			use:clickOutside={handleClose}
			class="h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-light-one shadow-xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div
				class="flex items-center justify-between border-b border-light-four bg-light-one px-6 py-4"
			>
				<h2 class="text-2xl font-semibold text-light-black">
					{#if isReadOnly}
						Ver Empleado
					{:else}
						{empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
					{/if}
				</h2>
				<Button variant="ghost" onclick={handleClose}><XIcon /></Button>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<!-- Datos Personales -->
				<div class="mb-6">
					<h3 class="mb-4 text-lg font-semibold text-light-black">Datos Personales</h3>
					<div class="grid grid-cols-3 gap-4">
						<div class="col-span-1">
							<Input
								type="text"
								id="ci"
								label="CI"
								bind:value={formData.ci}
								placeholder="Ej: 12345678"
								error={validationErrors.ci}
								maxlength={10}
								disabled={isReadOnly}
							/>
						</div>

						<div class="col-span-1">
							<Input
								type="text"
								id="telefono"
								label="Teléfono"
								bind:value={formData.telefono}
								placeholder="Ej: 72472244"
								error={validationErrors.telefono}
								maxlength={10}
								disabled={isReadOnly}
							/>
						</div>

						<div class="col-span-1">
							<Input
								type="date"
								id="fecha_nacimiento"
								label="Fecha de Nacimiento"
								bind:value={formData.fecha_nacimiento}
								error={validationErrors.fecha_nacimiento}
								max={new Date().toISOString().split('T')[0]}
								disabled={isReadOnly}
							/>
						</div>
					</div>

					<div class="mt-4 grid grid-cols-3 gap-4">
						<div>
							<Input
								type="text"
								id="nombre"
								label="Nombre"
								bind:value={formData.nombre}
								placeholder="Ej: Pedro"
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
								placeholder="Ej: Aguirre"
								required
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
								placeholder="Ej: Gutierrez"
								error={validationErrors.apellido_materno}
								disabled={isReadOnly}
							/>
						</div>
					</div>

					<div class="mt-4">
						<TextArea
							id="direccion"
							label="Dirección"
							bind:value={formData.direccion}
							placeholder="Ej: B/los angeles, calle 123"
							error={validationErrors.direccion}
							rows={3}
							disabled={isReadOnly}
						/>
					</div>
				</div>

				<!-- Datos Laborales -->
				<div class="mb-6">
					<h3 class="mb-4 text-lg font-semibold text-light-black">Datos Laborales</h3>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<Input
								type="text"
								id="cargo"
								label="Cargo"
								bind:value={formData.cargo}
								placeholder="Ej: Gerente"
								error={validationErrors.cargo}
								disabled={isReadOnly}
							/>
						</div>

						<div>
							<Input
								type="date"
								id="fecha_contratacion"
								label="Fecha de Contratación"
								bind:value={formData.fecha_contratacion}
								error={validationErrors.fecha_contratacion}
								max={new Date().toISOString().split('T')[0]}
								disabled={isReadOnly}
							/>
						</div>

						<div>
							<Input
								type="number"
								id="salario_base"
								label="Salario Base (Bs.)"
								bind:value={formData.salario_base}
								placeholder="Ej: 2500.00"
								error={validationErrors.salario_base}
								step="0.01"
								min="0"
								disabled={isReadOnly}
							/>
						</div>
					</div>
				</div>

				<!-- Toggle Crear Usuario -->
				{#if !isReadOnly}
					<div class="mb-6">
						<div
							class="flex items-center justify-between rounded-lg border border-light-four bg-light-two p-4"
						>
							<div>
								<h3 class="text-lg font-semibold text-light-black">Crear Usuario del Sistema</h3>
								<p class="text-sm text-light-black/60">
									Active esta opción si desea crear credenciales de acceso para este empleado
								</p>
							</div>
							<button
								type="button"
								onclick={toggleCrearUsuario}
								class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {crearUsuario
									? 'bg-blue-600'
									: 'bg-gray-200'}"
								role="switch"
								aria-checked={crearUsuario}
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {crearUsuario
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>
				{/if}
				<!-- Credenciales de Usuario (condicional) -->
				{#if crearUsuario}
					<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
						<h3 class="mb-4 text-lg font-semibold text-light-black">Credenciales de Usuario</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Input
									type="text"
									id="name_user"
									label="Nombre de Usuario"
									bind:value={formData.usuario!.name_user}
									placeholder="Ej: pedro.aguirre"
									required
									error={validationErrors['usuario.name_user']}
									disabled={isSubmitting || isReadOnly}
								/>
							</div>

							<div>
								<Input
									type="email"
									id="email"
									label="Email"
									bind:value={formData.usuario!.email}
									placeholder="ejemplo@correo.com"
									required
									error={validationErrors['usuario.email']}
									disabled={isSubmitting || isReadOnly}
								/>
							</div>
						</div>

						<div class="mt-4">
							<Select
								id="rol_id"
								label="Rol"
								bind:value={formData.usuario!.rol_id}
								required
								error={validationErrors['usuario.rol_id']}
								placeholder="Seleccione un rol"
								disabled={isSubmitting || isReadOnly}
							>
								{#each roles as role}
									<option value={role.id}>{role.nombre_rol} ({role.code_rol})</option>
								{/each}
							</Select>
						</div>

						<div class="mt-4">
							<Select
								id="id_sucursal"
								label="Sucursal"
								bind:value={formData.usuario!.id_sucursal}
								required
								error={validationErrors['usuario.id_sucursal']}
								placeholder="Seleccione una sucursal"
								disabled={isSubmitting || isReadOnly}
							>
								{#each sucursales as sucursal}
									<option value={sucursal.id}>{sucursal.nombre}</option>
								{/each}
							</Select>
						</div>

						<div class="mt-4 grid grid-cols-2 gap-4">
							<div>
								<label for="password" class="mb-2 block text-sm font-medium text-light-black">
									Contraseña <span class="text-red-500">*</span>
								</label>
								<div class="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										id="password"
										bind:value={formData.usuario!.password}
										class="w-full rounded-lg border border-light-four bg-light-one px-4 py-2 pr-12 text-light-black focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {validationErrors[
											'usuario.password'
										]
											? 'border-red-500'
											: ''}"
										placeholder="Ingrese la contraseña"
										disabled={isSubmitting || isReadOnly}
									/>
									<button
										type="button"
										onclick={togglePasswordVisibility}
										class="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
										tabindex="-1"
									>
										{#if showPassword}
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
												/>
											</svg>
										{:else}
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										{/if}
									</button>
								</div>
								{#if validationErrors['usuario.password']}
									<p class="mt-1 text-sm text-red-600">{validationErrors['usuario.password']}</p>
								{:else}
									<p class="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
								{/if}
							</div>

							<div>
								<label
									for="confirmPassword"
									class="mb-2 block text-sm font-medium text-light-black"
								>
									Confirmar Contraseña <span class="text-red-500">*</span>
								</label>
								<div class="relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										id="confirmPassword"
										bind:value={confirmPassword}
										class="w-full rounded-lg border border-light-four bg-light-one px-4 py-2 pr-12 text-light-black focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {validationErrors.confirmPassword
											? 'border-red-500'
											: ''}"
										placeholder="Confirme la contraseña"
										disabled={isSubmitting || isReadOnly}
									/>
									<button
										type="button"
										onclick={toggleConfirmPasswordVisibility}
										class="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
										tabindex="-1"
									>
										{#if showConfirmPassword}
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
												/>
											</svg>
										{:else}
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										{/if}
									</button>
								</div>
								{#if validationErrors.confirmPassword}
									<p class="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Botones -->
				<div class=" mt-6 flex justify-end gap-3 border-t border-light-four bg-light-one pt-4">
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
							{empleado ? 'Actualizar' : 'Crear Empleado'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- <script lang="ts">
	import type { Cliente, CreateClienteDto } from '$lib/interfaces';
	import type { Zona } from '$lib/interfaces';
	import { clickOutside, validateSchema, type ValidationResult } from '$lib/utils';
	import { clienteRegisterSchema } from '$lib/zod';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, Select, TextArea } from '$lib/components/ui';

	interface Props {
		isOpen: boolean;
		cliente?: Cliente | null;
		zonas: Zona[];
		onSubmit: (data: CreateClienteDto) => Promise<void>;
		onClose: () => void;
	}

	let { isOpen = $bindable(), cliente = null, zonas, onSubmit, onClose }: Props = $props();

	let formData = $state<CreateClienteDto>({
		ci: '',
		zona_id: '',
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
				zona_id: cliente.zona_id,
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
			zona_id: '',
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
					{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
							required
							error={validationErrors.ci}
						/>
					</div>

					<div>
						<Select
							id="zona_id"
							bind:value={formData.zona_id}
							label="Zona"
							required
							error={validationErrors.zona_id}
							placeholder="Seleccione una zona"
						>
							<option value="">Seleccione una zona</option>
							{#each zonas as zona}
								<option value={zona.id}>{zona.nombre}</option>
							{/each}
						</Select>
					</div>

					<div>
						<Input
							type="text"
							id="nombre"
							label="Nombre"
							bind:value={formData.nombre}
							error={validationErrors.nombre}
							required
							placeholder="Nombre"
						/>
					</div>

					<div>
						<Input
							type="text"
							id="apellido_paterno"
							label="Apellido Paterno"
							bind:value={formData.apellido_paterno}
							error={validationErrors.apellido_paterno}
							required
							placeholder="Apellido Paterno"
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
						/>
					</div>

					<div>
						<Input
							type="email"
							id="correo_electronico"
							label="Correo Electrónico"
							bind:value={formData.correo_electronico}
							error={validationErrors.correo_electronico}
							required
							placeholder="correo@ejemplo.com"
						/>
					</div>

					<div>
						<Input
							type="tel"
							id="telefono"
							label="Teléfono"
							bind:value={formData.telefono}
							error={validationErrors.telefono}
							required
							placeholder="Teléfono"
						/>
					</div>

					<div>
						<Input
							type="date"
							id="fecha_nacimiento"
							label="Fecha de Nacimiento"
							bind:value={formData.fecha_nacimiento}
							error={validationErrors.fecha_nacimiento}
							required
							placeholder="Fecha de Nacimiento"
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
							required
							rows={3}
							placeholder="Dirección"
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
						{cliente ? 'Actualizar' : 'Crear'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if} -->
