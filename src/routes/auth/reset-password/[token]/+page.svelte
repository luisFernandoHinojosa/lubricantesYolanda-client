<script lang="ts">
	import { page } from '$app/state';
	import { AuthShell } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';
	import { EyeIcon, EyeOffIcon, CheckCircleIcon } from '$lib/icons/outline';
	import { authService } from '$lib/services';
	import { alert, redirect } from '$lib/utils';
	import { resolve } from '$app/paths';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let success = $state(false);

	const token = page.params.token || '';

	const muyCorta = $derived(password.length > 0 && password.length < 8);
	const noCoinciden = $derived(confirmPassword.length > 0 && password !== confirmPassword);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!token || password.length < 8 || password !== confirmPassword) return;

		try {
			isLoading = true;
			await authService.resetPassword(token, password);
			success = true;
			setTimeout(() => redirect('/auth/sign-in'), 3000);
		} catch (error: unknown) {
			console.error('Error in reset password:', error);
			const message =
				(error as { message?: string })?.message ||
				'No se pudo cambiar la contraseña. Es posible que el enlace haya vencido: pida uno nuevo.';
			alert('error', message);
		} finally {
			isLoading = false;
		}
	}

	const CAMPO =
		'block h-12 w-full rounded-lg border bg-white px-3.5 text-base outline-none placeholder:text-acero-400 focus:ring-[3px]';
	const OK = 'border-acero-200 focus:border-acero-600 focus:ring-acero-200';
	const MAL = 'border-marca focus:ring-marca-tinte';
</script>

<svelte:head><title>Nueva contraseña · Lubricantes Yolanda</title></svelte:head>

<AuthShell>
	{#if !success}
		<h1 class="font-display text-4xl font-semibold text-acero-950">Crear contraseña nueva</h1>
		<p class="mt-2 text-acero-600">Elija una contraseña que no use en otros sitios.</p>

		<form onsubmit={handleSubmit} class="mt-8 space-y-5">
			<div>
				<label for="password" class="mb-1.5 block text-sm font-medium text-acero-800"
					>Contraseña nueva</label
				>
				<div class="relative">
					<!-- svelte-ignore a11y_autofocus -->
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="new-password"
						autofocus
						bind:value={password}
						aria-invalid={muyCorta ? 'true' : undefined}
						aria-describedby="pw-ayuda"
						class="{CAMPO} pr-12 {muyCorta ? MAL : OK}"
						disabled={isLoading}
						required
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-acero-500 hover:text-acero-950"
						aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
						aria-pressed={showPassword}
					>
						{#if showPassword}<EyeOffIcon />{:else}<EyeIcon />{/if}
					</button>
				</div>
				<p id="pw-ayuda" class="mt-1.5 text-sm {muyCorta ? 'text-marca' : 'text-acero-500'}">
					{muyCorta ? `Faltan ${8 - password.length} caracteres.` : 'Mínimo 8 caracteres.'}
				</p>
			</div>

			<div>
				<label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-acero-800"
					>Repita la contraseña</label
				>
				<input
					id="confirmPassword"
					type={showPassword ? 'text' : 'password'}
					autocomplete="new-password"
					bind:value={confirmPassword}
					aria-invalid={noCoinciden ? 'true' : undefined}
					aria-describedby={noCoinciden ? 'pw-confirmar' : undefined}
					class="{CAMPO} {noCoinciden ? MAL : OK}"
					disabled={isLoading}
					required
				/>
				{#if noCoinciden}
					<p id="pw-confirmar" class="mt-1.5 text-sm text-marca">Las contraseñas no coinciden.</p>
				{/if}
			</div>

			<Button
				type="submit"
				variant="primary"
				fullWidth
				size="lg"
				loading={isLoading}
				disabled={password.length < 8 || password !== confirmPassword}
			>
				Guardar contraseña
			</Button>
		</form>
	{:else}
		<div role="status">
			<span class="mb-5 flex size-12 items-center justify-center rounded-full bg-ok-tinte text-ok">
				<CheckCircleIcon class="size-6" />
			</span>
			<h1 class="font-display text-4xl font-semibold text-acero-950">Contraseña guardada</h1>
			<p class="mt-2 text-acero-600">
				Ya puede ingresar con su contraseña nueva. Lo llevamos al inicio de sesión…
			</p>
			<Button href={resolve('/auth/sign-in')} variant="primary" fullWidth size="lg" class="mt-8">
				Iniciar sesión ahora
			</Button>
		</div>
	{/if}
</AuthShell>
