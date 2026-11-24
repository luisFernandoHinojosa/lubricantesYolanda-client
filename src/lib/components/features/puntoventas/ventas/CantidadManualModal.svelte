<script lang="ts">
	import { Button, Modal } from '$lib/components/ui';
	import type { ProductoPOS } from '$lib/interfaces/venta.interface';

	interface Props {
		pendingProduct: { producto: ProductoPOS; id_presentacion: string | null };
		cantidadManual: string;
		onCerrar: () => void;
		onConfirmar: () => void;
	}

	let { pendingProduct, cantidadManual = $bindable(), onCerrar, onConfirmar }: Props = $props();

	const valida = $derived(!!cantidadManual && parseFloat(cantidadManual) > 0);
	const RAPIDAS = [0.25, 0.5, 0.75, 1, 2, 5, 10];
</script>

<Modal
	isOpen={true}
	title="Cantidad a vender"
	description={pendingProduct.producto.nombre_comercial}
	onClose={onCerrar}
	maxWidth="sm:max-w-sm"
>
	<form
		class="space-y-4"
		onsubmit={(e) => {
			e.preventDefault();
			if (valida) onConfirmar();
		}}
	>
		<div>
			<label for="cantidad-manual" class="sr-only">Cantidad</label>
			<input
				id="cantidad-manual"
				type="number"
				step="0.001"
				min="0"
				inputmode="decimal"
				bind:value={cantidadManual}
				placeholder="0"
				class="h-16 w-full rounded-lg border border-acero-200 px-4 text-center font-display text-4xl font-semibold text-acero-950 tabular-nums outline-none focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200"
			/>
			<p class="mt-2 text-center text-sm text-acero-500">
				Disponible: <span class="font-semibold text-acero-900 tabular-nums"
					>{pendingProduct.producto.stock_disponible}</span
				>
			</p>
		</div>
		<div class="flex flex-wrap justify-center gap-1.5" aria-label="Cantidades rápidas">
			{#each RAPIDAS as q (q)}
				<button
					type="button"
					onclick={() => (cantidadManual = q.toString())}
					class="h-9 min-w-12 rounded-md border px-2 text-sm font-semibold tabular-nums transition-colors {cantidadManual ===
					q.toString()
						? 'border-acero-900 bg-acero-900 text-white'
						: 'border-acero-200 text-acero-700 hover:border-acero-300 hover:bg-acero-50'}"
				>
					{q.toString().replace('.', ',')}
				</button>
			{/each}
		</div>
		<Button type="submit" variant="primary" size="lg" fullWidth disabled={!valida}
			>Agregar a la venta</Button
		>
	</form>
</Modal>
