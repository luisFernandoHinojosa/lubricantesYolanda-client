<script lang="ts">
	import { Input } from '$lib/components/ui';

	interface Props {
		descuentoGlobal: { tipo: 'PORCENTAJE' | 'FIJO' | 'NINGUNO'; valor: number };
		descuentoExcedido: boolean;
	}

	// El descuento se aplica mientras se escribe: no hay paso de "aplicar"
	let { descuentoGlobal = $bindable(), descuentoExcedido }: Props = $props();
</script>

<section class="space-y-1">
	<div class="flex items-center justify-between gap-3">
		<h3 class="text-[11px] font-bold tracking-widest text-light-five uppercase">Descuento</h3>
		<div class="flex items-center gap-1.5">
			<div class="grid grid-cols-2 gap-0.5 rounded-lg bg-light-one_d p-0.5">
				{#each [['FIJO', 'Bs'], ['PORCENTAJE', '%']] as const as [tipo, label] (tipo)}
					<button
						type="button"
						onclick={() => (descuentoGlobal = { tipo, valor: 0 })}
						class="rounded-md px-2.5 py-1 text-xs font-bold transition {(descuentoGlobal.tipo === 'PORCENTAJE' ? 'PORCENTAJE' : 'FIJO') === tipo
							? 'bg-light-two text-light-one shadow-sm'
							: 'text-light-five hover:bg-light-one hover:text-light-black'}"
					>
						{label}
					</button>
				{/each}
			</div>
			<Input
				class="w-24"
				type="number"
				size="xs"
				min="0"
				placeholder="0"
				bind:value={descuentoGlobal.valor}
			/>
		</div>
	</div>
	{#if descuentoExcedido}
		<p class="text-right text-xs font-medium text-light-error">El descuento supera el subtotal.</p>
	{/if}
</section>
