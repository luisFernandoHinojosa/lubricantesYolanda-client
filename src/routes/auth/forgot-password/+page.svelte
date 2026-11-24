<script lang="ts">
	import { AuthShell } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';
	import { ArrowLeftIcon, CheckCircleIcon } from '$lib/icons/outline';
	import { authService } from '$lib/services';
	import { alert } from '$lib/utils';
	import { resolve } from '$app/paths';

	let email = $state('');
	let isLoading = $state(false);
	let emailSent = $state(false);
	let lista = $state(false);
	$effect(() => {
		lista = true;
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!email.trim()) return;

		try {
			isLoading = true;
			await authService.forgotPassword(email.trim());
			emailSent = true;
		} catch (error: unknown) {
			console.error('Error in forgot password:', error);
			const message =
				(error as { message?: string })?.message ||
				'No se pudo enviar el enlace. Intente de nuevo.';
			alert('error', message);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head><title>Recuperar contraseña · Lubricantes Yolanda</title></svelte:head>

<AuthShell>
	<a
		href={resolve('/auth/sign-in')}
		class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-acero-600 hover:text-acero-950"
	>
		<ArrowLeftIcon class="size-4" /> Volver a iniciar sesión
	</a>

	{#if !emailSent}
		<h1 class="font-display text-4xl font-semibold text-acero-950">Recuperar contraseña</h1>
		<p class="mt-2 text-acero-600">
			Escriba el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva.
		</p>

		<form onsubmit={handleSubmit} class="mt-8 space-y-5">
			<div>
				<label for="email" class="mb-1.5 block text-sm font-medium text-acero-800"
					>Correo electrónico</label
				>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					id="email"
					type="email"
					autocomplete="email"
					autofocus
					bind:value={email}
					placeholder="nombre@correo.com"
					class="block h-12 w-full rounded-lg border border-acero-200 px-3.5 text-base outline-none placeholder:text-acero-400 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200"
					disabled={isLoading}
					required
				/>
			</div>
			<Button
				type="submit"
				variant="primary"
				fullWidth
				size="lg"
				loading={isLoading}
				disabled={!lista}>Enviar enlace</Button
			>
		</form>
	{:else}
		<div role="status">
			<span class="mb-5 flex size-12 items-center justify-center rounded-full bg-ok-tinte text-ok">
				<CheckCircleIcon class="size-6" />
			</span>
			<h1 class="font-display text-4xl font-semibold text-acero-950">Revise su correo</h1>
			<p class="mt-2 text-acero-600">
				Si <strong class="text-acero-950">{email}</strong> está registrado, le llegará un enlace para
				crear una contraseña nueva. Revise también la carpeta de correo no deseado.
			</p>
			<Button href={resolve('/auth/sign-in')} variant="secondary" fullWidth size="lg" class="mt-8">
				Volver a iniciar sesión
			</Button>
		</div>
	{/if}
</AuthShell>
