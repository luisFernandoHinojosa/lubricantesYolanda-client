<script lang="ts">
	import type { CreateUsuarioDto, Rol, Sucursal, Usuario } from '$lib/interfaces';
	import { usuariosService } from '$lib/services';
	import { Button } from '$lib/components/ui';
	import { PlusIcon } from '$lib/icons/outline';

	interface Props {
		roles: Rol[];
		sucursales: Sucursal[];
		usuario?: Usuario | null;
		isReadOnly?: boolean;
		onclose: () => void;
		oncreated: () => void;
	}

	let {
		roles = [],
		sucursales = [],
		usuario = null,
		isReadOnly = false,
		onclose,
		oncreated
	}: Props = $props();

	let formData = $state<CreateUsuarioDto>({
		rol_id: '',
		name_user: '',
		email: '',
		password: '',
		id_sucursal: ''
	});

	let confirmPassword = $state('');
	let errors = $state<Record<string, string>>({});
	let loading = $state(false);
	let generalError = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	$effect(() => {
		if (usuario) {
			formData.name_user = usuario.name_user;
			formData.email = usuario.email;
			formData.rol_id = usuario.rol_id;
			formData.password = '********'; // Placeholder for read-only
			confirmPassword = '********';
		}
	});

	function validateForm(): boolean {
		errors = {};

		if (!formData.name_user.trim()) {
			errors.name_user = 'El nombre de usuario es requerido';
		} else if (formData.name_user.length < 3) {
			errors.name_user = 'El nombre de usuario debe tener al menos 3 caracteres';
		}

		if (!formData.email.trim()) {
			errors.email = 'El email es requerido';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'El email no es válido';
		}

		if (!formData.rol_id) {
			errors.rol_id = 'Debe seleccionar un rol';
		}

		if (!formData.password) {
			errors.password = 'La contraseña es requerida';
		} else if (formData.password.length < 8) {
			errors.password = 'La contraseña debe tener al menos 8 caracteres';
		}

		if (!confirmPassword) {
			errors.confirmPassword = 'Debe confirmar la contraseña';
		} else if (formData.password !== confirmPassword) {
			errors.confirmPassword = 'Las contraseñas no coinciden';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			loading = true;
			generalError = '';
			await usuariosService.createUsuario(formData);
			oncreated();
		} catch (err) {
			const error = err as { response?: { data?: { message?: string } } };
			generalError = error.response?.data?.message || 'Error al crear el usuario';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

<div class=" fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
	<div class="w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
		<!-- Header -->
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6"
		>
			<h2 class="text-2xl font-bold text-gray-900">
				{#if isReadOnly}
					Ver Usuario
				{:else}
					Crear Nuevo Usuario
				{/if}
			</h2>
			<button
				onclick={onclose}
				class="text-gray-400 transition-colors hover:text-gray-600"
				disabled={loading}
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<form onsubmit={handleSubmit} class="p-6">
			{#if generalError}
				<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex">
						<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						<p class="ml-3 text-sm text-red-800">{generalError}</p>
					</div>
				</div>
			{/if}

			<div class="space-y-6">
				<div>
					<label for="name_user" class="mb-2 block text-sm font-medium text-gray-700">
						Nombre de Usuario <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="name_user"
						bind:value={formData.name_user}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.name_user
							? 'border-red-500'
							: ''}"
						placeholder="Ej: juan.perez"
						disabled={loading || isReadOnly}
					/>
					{#if errors.name_user}
						<p class="mt-1 text-sm text-red-600">{errors.name_user}</p>
					{:else}
						<p class="mt-1 text-sm text-gray-500">Mínimo 3 caracteres</p>
					{/if}
				</div>
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
						Email <span class="text-red-500">*</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.email
							? 'border-red-500'
							: ''}"
						placeholder="ejemplo@correo.com"
						disabled={loading || isReadOnly}
					/>
					{#if errors.email}
						<p class="mt-1 text-sm text-red-600">{errors.email}</p>
					{/if}
				</div>
				<div>
					<label for="rol_id" class="mb-2 block text-sm font-medium text-gray-700">
						Rol <span class="text-red-500">*</span>
					</label>
					<select
						id="rol_id"
						bind:value={formData.rol_id}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.rol_id
							? 'border-red-500'
							: ''}"
						disabled={loading || isReadOnly}
					>
						<option value="">Seleccione un rol</option>
						{#each roles as rol (rol.id)}
							<option value={rol.id}>{rol.nombre_rol} ({rol.code_rol})</option>
						{/each}
					</select>
					{#if errors.rol_id}
						<p class="mt-1 text-sm text-red-600">{errors.rol_id}</p>
					{/if}
				</div>
				<div>
					<label for="id_sucursal" class="mb-2 block text-sm font-medium text-gray-700">
						Sucursal <span class="text-red-500">*</span>
					</label>
					<select
						id="id_sucursal"
						bind:value={formData.id_sucursal}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.id_sucursal
							? 'border-red-500'
							: ''}"
						disabled={loading || isReadOnly}
					>
						<option value="">Seleccione una sucursal</option>
						{#each sucursales as sucursal (sucursal.id)}
							<option value={sucursal.id}>{sucursal.nombre}</option>
						{/each}
					</select>
					{#if errors.id_sucursal}
						<p class="mt-1 text-sm text-red-600">{errors.id_sucursal}</p>
					{/if}
				</div>
				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Contraseña <span class="text-red-500">*</span>
					</label>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={formData.password}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.password
								? 'border-red-500'
								: ''}"
							placeholder="Ingrese la contraseña"
							disabled={loading || isReadOnly}
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
					{#if errors.password}
						<p class="mt-1 text-sm text-red-600">{errors.password}</p>
					{:else}
						<p class="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
					{/if}
				</div>
				<div>
					<label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
						Confirmar Contraseña <span class="text-red-500">*</span>
					</label>
					<div class="relative">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							id="confirmPassword"
							bind:value={confirmPassword}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.confirmPassword
								? 'border-red-500'
								: ''}"
							placeholder="Confirme la contraseña"
							disabled={loading || isReadOnly}
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
					{#if errors.confirmPassword}
						<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
					{/if}
				</div>
			</div>

			<div class="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
				{#if isReadOnly}
					<Button type="button" onclick={onclose} variant="secondary">Cerrar</Button>
				{:else}
					<Button type="button" onclick={onclose} variant="secondary" disabled={loading}>
						Cancelar
					</Button>
					<Button type="submit" variant="primary" disabled={loading} {loading}>
						{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
						Crear Usuario
					</Button>
				{/if}
			</div>
		</form>
	</div>
</div>
