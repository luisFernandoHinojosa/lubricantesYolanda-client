<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { XIcon } from '$lib/icons/outline';
	import { Input } from '$lib/components/ui';
	import type { ProductoPOS } from '$lib/interfaces/venta.interface';

	interface Props {
		pendingProduct: { producto: ProductoPOS; id_presentacion: string | null };
		cantidadManual: string;
		onCerrar: () => void;
		onConfirmar: () => void;
	}

	let { pendingProduct, cantidadManual = $bindable(), onCerrar, onConfirmar }: Props = $props();
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-xs overflow-hidden rounded-3xl border border-light-one_d bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-one_d px-6 py-4">
			<div>
				<h3 class="text-sm font-bold text-light-black">
					{pendingProduct.producto.nombre_comercial}
				</h3>
				<p class="text-xs text-light-five">Ingrese la cantidad a vender</p>
			</div>
			<button
				onclick={onCerrar}
				class="flex h-8 w-8 items-center justify-center rounded-xl text-light-five transition hover:bg-light-one_d hover:text-light-two"
				><XIcon class="h-4 w-4" /></button
			>
		</div>
		<div class="space-y-5 p-6">
			<div class="text-center">
				<Input
					type="number"
					autofocus
					step="0.001"
					bind:value={cantidadManual}
					onkeydown={(e) => e.key === 'Enter' && onConfirmar()}
					placeholder="0.000"
				/>
				<span class="mt-2 block text-xs text-light-five"
					>Stock disponible: <strong class="font-mono text-light-black"
						>{pendingProduct.producto.stock_disponible}</strong
					></span
				>
			</div>
			<div class="grid grid-cols-4 gap-2">
				{#each [0.25, 0.5, 1, 2, 5, 10, 0.1, 0.75] as q, index (index)}
					<button
						onclick={() => (cantidadManual = q.toString())}
						class="rounded-xl border border-light-one_d bg-light-one px-2 py-2.5 font-mono text-xs font-bold text-light-five transition hover:border-light-success hover:bg-light-success/10 hover:text-light-success"
						>{q}</button
					>
				{/each}
			</div>
			<button
				onclick={onConfirmar}
				disabled={!cantidadManual || parseFloat(cantidadManual) <= 0}
				class="flex w-full items-center justify-center gap-2 rounded-2xl bg-light-success py-3.5 font-bold text-white transition hover:brightness-110 disabled:opacity-40"
				>Agregar al carrito</button
			>
		</div>
	</div>
</div>
