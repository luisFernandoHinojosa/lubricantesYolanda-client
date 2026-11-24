<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui';
	import { AuthShell } from '$lib/components/layout';
	import { EyeIcon, EyeOffIcon, AlertTriangleIcon } from '$lib/icons/outline';
	import { ErrorType, type LoginCredentials } from '$lib/interfaces';
	import { AppError } from '$lib/services';
	import { authStore, currentUserStore, isLoading } from '$lib/stores';
	import { redirect } from '$lib/utils';
	import { canAccess, getDefaultRedirect } from '$lib/utils/rbac.utils';
	import { resolve } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loginError = $state('');
	let emailInput = $state<HTMLInputElement>();
	// Hasta que la página es interactiva, el formulario no se puede enviar (evita un envío nativo vacío)
	let lista = $state(false);
	$effect(() => {
		lista = true;
	});

	// Pantalla que se intentó abrir sin sesión (solo rutas internas)
	const redirectTo = $derived.by(() => {
		const r = page.url.searchParams.get('redirectTo');
		return r && r.startsWith('/v1/') ? r : null;
	});

	const handleLogin = async (event: SubmitEvent): Promise<void> => {
		event.preventDefault();
		loginError = '';

		const credentials: LoginCredentials = { email: email.trim(), password };
		authStore.setLoading(true);

		try {
			await authStore.login(credentials);
			const user = $currentUserStore;
			if (user) {
				const rol = user.Role.code_rol;
				redirect(
					redirectTo && canAccess(rol, redirectTo) ? redirectTo : getDefaultRedirect(rol),
					true
				);
			} else {
				loginError = 'No se pudieron cargar los datos de su cuenta. Intente de nuevo.';
			}
		} catch (error) {
			if (error instanceof AppError) {
				switch (error.type) {
					case ErrorType.AUTHENTICATION:
						loginError = 'El correo o la contraseña no son correctos.';
						break;
					case ErrorType.NETWORK:
						loginError = 'No hay conexión con el servidor. Revise su internet e intente de nuevo.';
						break;
					case ErrorType.SERVER:
						loginError = 'El servidor no responde. Intente de nuevo en unos minutos.';
						break;
					default:
						loginError = error.message || 'No se pudo iniciar sesión. Intente de nuevo.';
				}
			} else {
				loginError = 'No se pudo iniciar sesión. Intente de nuevo.';
			}
			emailInput?.focus();
		} finally {
			authStore.setLoading(false);
		}
	};

	const CAMPO =
		'block h-12 w-full rounded-lg border border-acero-200 bg-white px-3.5 text-base text-acero-950 outline-none placeholder:text-acero-400 hover:border-acero-300 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200 disabled:bg-acero-50';
</script>

<svelte:head><title>Iniciar sesión · Lubricantes Yolanda</title></svelte:head>

<AuthShell>
	<h1 class="font-display text-4xl font-semibold text-acero-950">Iniciar sesión</h1>
	<p class="mt-2 text-acero-600">
		{redirectTo
			? 'Su sesión terminó. Ingrese de nuevo para continuar.'
			: 'Ingrese con la cuenta que le dio el administrador.'}
	</p>

	{#if loginError}
		<div
			class="mt-6 flex items-start gap-2.5 rounded-lg border border-marca/30 bg-marca-tinte px-3.5 py-3 text-[0.9375rem] text-marca-oscuro"
			role="alert"
		>
			<AlertTriangleIcon class="mt-0.5 size-5 shrink-0" />
			<span>{loginError}</span>
		</div>
	{/if}

	<form onsubmit={handleLogin} class="mt-8 space-y-5">
		<div>
			<label for="email" class="mb-1.5 block text-sm font-medium text-acero-800"
				>Correo electrónico</label
			>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:this={emailInput}
				id="email"
				type="email"
				autocomplete="username"
				inputmode="email"
				autofocus
				bind:value={email}
				placeholder="nombre@correo.com"
				class={CAMPO}
				disabled={$isLoading}
				aria-invalid={loginError ? 'true' : undefined}
				required
			/>
		</div>

		<div>
			<div class="mb-1.5 flex items-baseline justify-between">
				<label for="password" class="block text-sm font-medium text-acero-800">Contraseña</label>
				<a
					href={resolve('/auth/forgot-password')}
					class="text-sm font-medium text-acero-600 underline-offset-2 hover:text-acero-950 hover:underline"
				>
					¿La olvidó?
				</a>
			</div>
			<div class="relative">
				<input
					id="password"
					type={showPassword ? 'text' : 'password'}
					autocomplete="current-password"
					bind:value={password}
					class="{CAMPO} pr-12"
					disabled={$isLoading}
					aria-invalid={loginError ? 'true' : undefined}
					required
				/>
				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-acero-500 hover:text-acero-950"
					disabled={!lista}
					aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
					aria-pressed={showPassword}
				>
					{#if showPassword}<EyeOffIcon />{:else}<EyeIcon />{/if}
				</button>
			</div>
		</div>

		<Button
			type="submit"
			variant="primary"
			fullWidth
			size="lg"
			loading={$isLoading}
			disabled={!lista}>Ingresar</Button
		>
	</form>
	{#snippet pie()}
		¿No tiene cuenta? Pídala al administrador del sistema.
	{/snippet}
</AuthShell>
