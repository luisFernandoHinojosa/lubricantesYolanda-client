<script lang="ts">
	import backgroundImg from '$lib/assets/images/background1.png';
	import { Button, Heading, Image } from '$lib/components/ui';
	import { MailIcon } from '$lib/icons/outline';
	import { authService } from '$lib/services';
	import { alert } from '$lib/utils';
	import { ArrowLeftIcon } from '$lib/icons/outline';
	import { resolve } from '$app/paths';

	let email = $state('');
	let isLoading = $state(false);
	let emailSent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email) return;

		try {
			isLoading = true;
			await authService.forgotPassword(email);
			emailSent = true;
			alert(
				'success',
				'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.'
			);
		} catch (error: unknown) {
			console.error('Error in forgot password:', error);
			const message =
				(error as any)?.message || 'Error al procesar la solicitud. Intente nuevamente.';
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
		<div class="mb-6 flex items-center gap-2">
			<a
				href={resolve('/auth/sign-in')}
				class="text-light-three transition-colors hover:text-light-four"
			>
				<ArrowLeftIcon class="size-5" />
			</a>
			<Heading level="h3" class="mx-auto">Forgot Password</Heading>
		</div>

		{#if !emailSent}
			<p class="mb-8 text-center text-sm text-light-three">
				Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
			</p>

			<form onsubmit={handleSubmit} class="space-y-6">
				<div class="space-y-1">
					<label for="email" class="text-sm font-medium text-light-three">Email</label>
					<div class="relative">
						<span class="absolute top-3 left-0 text-light-four"><MailIcon /></span>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="ejemplo@email.com"
							class="border-g w-full border-t-0 border-r-0 border-b border-l-0 bg-transparent py-3 pl-8 text-light-three placeholder-light-four outline-0 transition-colors duration-200 outline-none focus:border-b-light-four_d focus:ring-0 focus:outline-0"
							disabled={isLoading}
							required
						/>
					</div>
				</div>

				<div class="pt-4">
					<Button type="submit" variant="primary" fullWidth size="md" loading={isLoading}>
						ENVIAR ENLACE
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
				<p class="text-light-three">
					Hemos enviado las instrucciones a <strong>{email}</strong>.
				</p>
				<p class="text-sm text-light-four">
					Por favor revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
				</p>
				<div class="pt-4">
					<a href={resolve('/auth/sign-in')}>
						<Button variant="primary" fullWidth size="md">VOLVER AL LOGIN</Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</main>
