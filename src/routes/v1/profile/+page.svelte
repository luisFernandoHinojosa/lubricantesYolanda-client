<script lang="ts">
	import { Heading, Button } from '$lib/components/ui';
	import {
		MailIcon,
		MapPinIcon,
		ClipboardIcon,
		WhatsappIcon,
		TagIcon,
		UserIcon,
		LockIcon
	} from '$lib/icons/outline';
	import { currentUserStore } from '$lib/stores';
	import { formatDate } from '$lib/utils';
	import { onMount } from 'svelte';
	import { authService } from '$lib/services';
	import { alert } from '$lib/utils';
	import { MainLayout } from '$lib/components/layout';

	let mounted = $state(false);
	let activeTab = $state<'general' | 'security'>('general');

	onMount(() => {
		mounted = true;
	});

	function getInitials(name?: string, lastName?: string): string {
		const first = name?.charAt(0) || '';
		const second = lastName?.charAt(0) || '';
		return (first + second).toUpperCase() || name?.slice(0, 2).toUpperCase() || 'US';
	}

	let resettingPassword = $state(false);

	async function handleResetPassword() {
		const email = $currentUserStore?.email;
		if (!email) {
			alert('error', 'No se encontró un email asociado a tu cuenta.');
			return;
		}

		try {
			resettingPassword = true;
			await authService.forgotPassword(email);
			alert('success', 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.');
		} catch (error: unknown) {
			const message = (error as any)?.message || 'Error al enviar el enlace de restablecimiento.';
			alert('error', message);
		} finally {
			resettingPassword = false;
		}
	}
</script>

<MainLayout
	title="Mi Cuenta"
	description="Información de la cuenta."
	class="container mx-auto space-y-6"
>
	<div class="mb-6 flex items-center justify-between">
		<Heading level="h4">Mi Cuenta</Heading>
	</div>

	<!-- Tabs Navigation -->
	<div class="mb-8 border-b border-light-five">
		<div class="flex gap-8">
			<button
				onclick={() => (activeTab = 'general')}
				class="relative pb-4 text-sm font-semibold transition-colors
                {activeTab === 'general'
					? 'text-light-three'
					: 'text-light-five hover:text-light-three'}"
			>
				Información General
				{#if activeTab === 'general'}
					<div class="absolute bottom-0 left-0 h-0.5 w-full bg-light-three"></div>
				{/if}
			</button>
			<button
				onclick={() => (activeTab = 'security')}
				class="relative pb-4 text-sm font-semibold transition-colors
                {activeTab === 'security'
					? 'text-light-three'
					: 'text-light-five hover:text-light-three'}"
			>
				Seguridad y Acceso
				{#if activeTab === 'security'}
					<div class="absolute bottom-0 left-0 h-0.5 w-full bg-light-three"></div>
				{/if}
			</button>
		</div>
	</div>

	<div class="fade-up {mounted ? 'show' : ''}" style="transition-delay: 100ms">
		{#if activeTab === 'general'}
			<div class="flex flex-col lg:flex-row">
				<!-- Sidebar Info -->
				<div class="w-full space-y-8 border-r-0 border-light-five lg:w-80 lg:border-r">
					<div class="flex items-center gap-4">
						<div
							class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-light-three text-light-one shadow-sm"
						>
							{getInitials(
								$currentUserStore?.Empleado?.nombre,
								$currentUserStore?.Empleado?.apellido_paterno
							)}
						</div>
						<div class="min-w-0 pr-4">
							<h2 class="truncate text-[17px] font-bold text-light-black">
								{#if $currentUserStore?.Empleado}
									{$currentUserStore.Empleado.nombre}
									{$currentUserStore.Empleado.apellido_paterno}
								{:else}
									{$currentUserStore?.name_user}
								{/if}
							</h2>
							<p class="text-sm text-light-five">
								CI: {($currentUserStore?.Empleado?.ci || 'N/A').toUpperCase()}
							</p>
						</div>
					</div>

					<div class="space-y-4">
						<Heading level="h5">Acerca de</Heading>
						<div class="space-y-3">
							<div class="flex items-center gap-3 text-light-two">
								<WhatsappIcon class="size-6 shrink-0 text-light-five" />
								<span class="w-16 text-sm font-medium text-light-five">Teléfono:</span>
								<span class="truncate text-sm text-light-black"
									>{$currentUserStore?.Empleado?.telefono || 'No registrado'}</span
								>
							</div>
							<div class="flex items-center gap-3 text-light-two">
								<MailIcon class="size-6 shrink-0 text-light-five" />
								<span class="w-16 text-sm font-medium text-light-five">Correo:</span>
								<span
									class="truncate text-sm text-light-black"
									title={$currentUserStore?.email}>{$currentUserStore?.email}</span
								>
							</div>
						</div>
					</div>

					<hr class="border-light-five" />

					<div class="space-y-4">
						<Heading level="h5">Dirección</Heading>
						<div class="space-y-3">
							<div class="flex items-start gap-3 text-light-two">
								<MapPinIcon class="size-6 shrink-0 text-light-five" />
								<div class="flex flex-col gap-2">
									<div class="flex gap-2">
										<span class="text-sm font-medium text-light-five">Dirección:</span>
										<span class="text-sm leading-relaxed text-light-black"
											>{$currentUserStore?.Empleado?.direccion || 'No especificada'}</span
										>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Main Info Content -->
				<div class="flex-1 space-y-12 px-0 py-8 lg:px-8 lg:py-0">
					<div>
						<div class="mb-4 flex items-center justify-between">
							<Heading level="h5">Información Laboral</Heading>
						</div>

						<div class="overflow-x-auto">
							<ul class="flex flex-wrap gap-8">
								<li class="text-light-five">
									<div class="text-xs font-semibold tracking-wider uppercase">Sucursal</div>
									<div class="text-md mt-1 font-medium text-light-black">No asignada</div>
								</li>
								<li class="text-light-five">
									<div class="text-xs font-semibold tracking-wider uppercase">Rol de Usuario</div>
									<div class="text-md mt-1 font-medium text-light-black">
										{$currentUserStore?.Role?.nombre_rol || 'USER'}
									</div>
								</li>
								<li class="text-light-five">
									<div class="text-xs font-semibold tracking-wider uppercase">Estado</div>
									<div class="mt-1 flex items-center gap-2">
										<div
											class="h-2 w-2 rounded-full {$currentUserStore?.esta_activo
												? 'bg-green-500'
												: 'bg-red-500'}"
										></div>
										<span class="text-md font-medium text-light-black"
											>{$currentUserStore?.esta_activo ? 'Activo' : 'Inactivo'}</span
										>
									</div>
								</li>
								<li class="text-light-five">
									<div class="text-xs font-semibold tracking-wider uppercase">Compensación</div>
									<div class="text-md mt-1 font-medium text-light-black">
										Bs. {$currentUserStore?.Empleado?.salario_base || '0.00'}
									</div>
								</li>
							</ul>
						</div>
					</div>

					<hr class="border-light-five" />

					<div class="space-y-4">
						<Heading level="h5">Detalles del Empleado</Heading>
						<div class="space-y-3">
							{#if $currentUserStore?.Empleado?.fecha_nacimiento}
								<div class="flex items-center gap-3 text-sm">
									<UserIcon class="size-6 shrink-0 text-light-five" />
									<span class="font-medium text-light-five">Fecha de nac.:</span>
									<span class="text-light-black"
										>{formatDate($currentUserStore?.Empleado?.fecha_nacimiento)}</span
									>
								</div>
							{/if}

							<div class="flex items-center gap-3 text-sm">
								<ClipboardIcon class="size-6 shrink-0 text-light-five" />
								<span class="font-medium text-light-five">CI:</span>
								<span class="text-light-black">{$currentUserStore?.Empleado?.ci || 'N/A'}</span
								>
							</div>

							<div class="flex items-center gap-3 text-sm">
								<TagIcon class="size-6 shrink-0 text-light-five" />
								<span class="font-medium text-light-five">Cargo:</span>
								<span class="text-light-black"
									>{$currentUserStore?.Empleado?.cargo || 'N/A'}</span
								>
							</div>

							{#if $currentUserStore?.Empleado?.fecha_contratacion}
								<div class="flex items-center gap-3 text-sm">
									<ClipboardIcon class="size-6 shrink-0 text-light-five" />
									<span class="font-medium text-light-five">Contratación:</span>
									<span class="text-light-black"
										>{formatDate($currentUserStore?.Empleado?.fecha_contratacion)}</span
									>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'security'}
			<div class="max-w-4xl space-y-8">
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<!-- Account Security Card -->
					<div>
						<!-- {#snippet header()} -->
						<div class="flex items-center gap-2">
							<LockIcon class="size-5 text-light-three" />
							<Heading level="h5">Seguridad de la Cuenta</Heading>
						</div>
						<!-- {/snippet} -->

						<div class="space-y-6">
							<p class="text-sm leading-relaxed text-light-five">
								Protege tu acceso actualizando tu contraseña periódicamente. Para tu seguridad, te
								enviaremos un enlace de restablecimiento directamente a tu correo registrado.
							</p>

							<div class=" p-4">
								<div class="flex items-center gap-2 text-xs font-medium text-light-three">
									<MailIcon class="size-4" />
									Email de recuperación:
								</div>
								<div class="mt-1 text-sm font-bold text-light-black">
									{$currentUserStore?.email}
								</div>
							</div>

							<Button
								variant="primary"
								size="md"
								fullWidth
								onclick={handleResetPassword}
								loading={resettingPassword}
							>
								{#snippet leftIcon()}
									<LockIcon class="size-4" />
								{/snippet}
								Solicitar nueva contraseña
							</Button>
						</div>
					</div>

					<div class="space-y-6">
						<Heading level="h5">Actividad Reciente</Heading>

						<div class="space-y-4">
							<div class="flex items-start gap-4">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-five/10 text-light-three"
								>
									<UserIcon class="h-5 w-5" />
								</div>
								<div>
									<p class="text-sm font-medium text-light-black">Perfil Actualizado</p>
									<p class="text-xs text-light-five">
										{formatDate($currentUserStore?.updatedAt)}
									</p>
								</div>
							</div>

							<div class="flex items-start gap-4">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-five/10 text-light-three"
								>
									<ClipboardIcon class="h-5 w-5" />
								</div>
								<div>
									<p class="text-sm font-medium text-light-black">Cuenta Creada</p>
									<p class="text-xs text-light-five">
										{formatDate($currentUserStore?.createdAt)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</MainLayout>
