<script lang="ts">
	import { page } from '$app/state';
	import backgroundImg from '$lib/assets/images/background1.png';
	import { Button, Heading, Image } from '$lib/components/ui';
	import { LockIcon, EyeIcon, EyeOffIcon } from '$lib/icons/outline';
	import { authService } from '$lib/services';
	import { alert, redirect } from '$lib/utils';
	import { resolve } from '$app/paths';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let success = $state(false);

	const token = page.params.token || '';

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!password || !confirmPassword || !token) return;

		if (password !== confirmPassword) {
			alert('error', 'Las contraseñas no coinciden.');
			return;
		}

		if (password.length < 8) {
			alert('error', 'La contraseña debe tener al menos 8 caracteres.');
			return;
		}

		try {
			isLoading = true;
			await authService.resetPassword(token, password);
			success = true;
			alert('success', 'Contraseña actualizada exitosamente.');

			setTimeout(() => {
				redirect('/auth/sign-in');
			}, 3000);
		} catch (error: unknown) {
			console.error('Error in reset password:', error);
			const message =
				(error as any)?.message ||
				'Error al restablecer la contraseña. El enlace puede haber expirado.';
			alert('error', message);
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<div class="absolute inset-0 z-0">
		<Image src={backgroundImg} alt="Background" class="h-full w-full object-cover" />
	</div>

	<div class="absolute top-6 left-6 z-20">
		<div class="flex h-24 w-64 items-center justify-center rounded bg-light-one/60 p-2">
			<Image objectFit="contain" src="/images/logofake.png" alt="" />
		</div>
	</div>

	<div
		class="z-10 w-full max-w-md rounded-lg border-8 border-light-one_d bg-light-one p-8 shadow-lg"
	>
		<div class="mb-8 text-center">
			<Heading level="h3">Reset Password</Heading>
		</div>

		{#if !success}
			<p class="mb-8 text-center text-sm text-light-three">
				Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
			</p>

			<form onsubmit={handleSubmit} class="space-y-6">
				<div class="space-y-1">
					<label for="password" class="text-sm font-medium text-light-three">Contraseña</label>
					<div class="relative">
						<span class="absolute top-3 left-0 text-light-four"><LockIcon /></span>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Mínimo 8 caracteres"
							class="w-full border-t-0 border-r-0 border-b border-l-0 border-light-four bg-transparent py-3 pr-12 pl-8 text-light-three placeholder-light-four transition-colors duration-200 outline-none focus:border-b-light-four_d focus:ring-0 focus:outline-0"
							disabled={isLoading}
							required
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute top-3 right-0 text-gray-400 transition-colors hover:text-gray-600"
							disabled={isLoading}
						>
							{#if showPassword}
								<EyeIcon />
							{:else}
								<EyeOffIcon />
							{/if}
						</button>
					</div>
				</div>

				<div class="space-y-1">
					<label for="confirmPassword" class="text-sm font-medium text-light-three"
						>Confirmar Contraseña</label
					>
					<div class="relative">
						<span class="absolute top-3 left-0 text-light-four"><LockIcon /></span>
						<input
							id="confirmPassword"
							type={showPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Repite tu contraseña"
							class="w-full border-t-0 border-r-0 border-b border-l-0 border-light-four bg-transparent py-3 pr-12 pl-8 text-light-three placeholder-light-four transition-colors duration-200 outline-none focus:border-b-light-four_d focus:ring-0 focus:outline-0"
							disabled={isLoading}
							required
						/>
					</div>
				</div>

				<div class="pt-4">
					<Button type="submit" variant="primary" fullWidth size="md" loading={isLoading}>
						ACTUALIZAR CONTRASEÑA
					</Button>
				</div>
			</form>
		{:else}
			<div class="space-y-6 py-6 text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600"
				>
					✓
				</div>
				<p class="font-bold text-light-three">¡Contraseña actualizada!</p>
				<p class="text-sm text-light-four">
					Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos.
				</p>
				<div class="pt-4">
					<a href={resolve('/auth/sign-in')}>
						<Button variant="primary" fullWidth size="md">IR AL LOGIN AHORA</Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</main>
