<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/images/logo1.webp';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';

	let { children } = $props();

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
	<div
		class="fixed inset-x-0 bottom-0 z-[9999] flex flex-wrap items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-sm text-white shadow-lg"
		role="status"
	>
		<span>Hay una nueva versión del sistema disponible.</span>
		<button
			type="button"
			class="rounded bg-white px-3 py-1 font-semibold text-blue-700 hover:bg-blue-50"
			onclick={() => location.reload()}
		>
			Actualizar ahora
		</button>
	</div>
{/if}

{@render children()}
