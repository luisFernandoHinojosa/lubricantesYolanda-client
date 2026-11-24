<script lang="ts">
	import { fade } from 'svelte/transition';
	import { posService } from '$lib/services/pos.service';
	import type { VentaResponse } from '$lib/interfaces/venta.interface';
	import VentaDetalleModal from '$lib/components/features/puntoventas/ventas/ventaDetalleModal.svelte';
	import { alert } from '$lib/utils';

	interface Props {
		/** N° de comprobante de la venta a mostrar; null cierra el modal */
		numero: string | null;
		onClose: () => void;
	}

	let { numero, onClose }: Props = $props();

	let venta = $state<VentaResponse | null>(null);
	let cargando = $state(false);
	let requestId = 0;

	$effect(() => {
		const actual = numero;
		const id = ++requestId;
		venta = null;
		if (!actual) {
			cargando = false;
			return;
		}

		cargando = true;
		posService
			.getVentaPorComprobante(actual)
			.then((data) => {
				if (id === requestId) venta = data;
			})
			.catch((err) => {
				if (id !== requestId) return;
				console.error('Error al cargar la venta:', err);
				alert('error', `No se pudo cargar la venta ${actual}.`);
				onClose();
			})
			.finally(() => {
				if (id === requestId) cargando = false;
			});
	});
</script>

{#if cargando}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-light-three/60 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
	>
		<div class="flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-medium shadow-xl">
			<span
				class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-light-two"
			></span>
			Cargando venta {numero}…
		</div>
	</div>
{/if}

<VentaDetalleModal isOpen={!!numero && !!venta} {venta} {onClose} />
