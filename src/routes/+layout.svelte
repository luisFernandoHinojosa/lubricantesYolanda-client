<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/images/logo1.webp';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import { fade, scale } from 'svelte/transition';

	let { children } = $props();

	// Señal de que la página ya es interactiva (hidratada)
	$effect(() => {
		document.documentElement.dataset.app = 'lista';
	});
	let updateButton = $state<HTMLButtonElement>();

	// Cuando aparece el modal, el foco va al botón (Enter actualiza) y se bloquea el scroll de fondo
	$effect(() => {
		if (!updated.current) return;
		updateButton?.focus();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	});

	// Si hay un despliegue nuevo, la siguiente navegación recarga la página completa
	// para descargar el código nuevo (no se interrumpe una venta en curso).
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});

	// Al volver a la pestaña (p. ej. al día siguiente), revisar al momento si hay versión nueva
	$effect(() => {
		const onVisible = () => {
			if (document.visibilityState === 'visible') updated.check().catch(() => {});
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if updated.current}
	<!-- Modal obligatorio: no se cierra con clic afuera ni con Escape, solo actualizando -->
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="update-title"
			aria-describedby="update-desc"
			class="flex w-full max-w-sm flex-col items-center rounded-lg border-t-4 border-light-two bg-light-one px-6 py-8 text-center shadow-xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div
				class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-light-accent/40 text-light-two"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-8 w-8"
					aria-hidden="true"
				>
					<path d="M21 12a9 9 0 1 1-2.64-6.36" />
					<path d="M21 3v6h-6" />
				</svg>
			</div>

			<h2 id="update-title" class="mb-2 text-xl font-semibold text-light-black">
				Nueva versión disponible
			</h2>
			<p id="update-desc" class="mb-6 text-sm text-light-five/80">
				Se instalaron mejoras en el sistema. Presiona <strong>Actualizar</strong> para seguir trabajando
				con la versión más reciente.
			</p>

			<button
				bind:this={updateButton}
				type="button"
				class="w-full rounded-lg bg-light-two px-4 py-3 font-semibold text-white shadow transition-colors hover:bg-light-two/90 focus:ring-2 focus:ring-light-three focus:ring-offset-2 focus:outline-none"
				onclick={() => location.reload()}
			>
				Actualizar
			</button>
		</div>
	</div>
{/if}

<div style="display: contents" inert={updated.current}>
	{@render children()}
</div>
