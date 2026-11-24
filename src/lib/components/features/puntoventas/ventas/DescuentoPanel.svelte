<script lang="ts">
	import { Input } from '$lib/components/ui';
	import { PISTA, SEGMENTO, SEGMENTO_ACTIVO, SEGMENTO_INACTIVO, TITULO_SECCION } from './segmentos';

	interface Props {
		descuentoGlobal: { tipo: 'PORCENTAJE' | 'FIJO' | 'NINGUNO'; valor: number };
		descuentoExcedido: boolean;
	}

	// El descuento se aplica mientras se escribe: no hay paso de "aplicar"
	let { descuentoGlobal = $bindable(), descuentoExcedido }: Props = $props();

	const tipoActual = $derived(descuentoGlobal.tipo === 'PORCENTAJE' ? 'PORCENTAJE' : 'FIJO');
</script>

<section class="space-y-1.5" aria-labelledby="pos-descuento">
	<div class="flex items-center justify-between gap-3">
		<h3 id="pos-descuento" class={TITULO_SECCION}>Descuento</h3>
		<div class="flex items-center gap-1.5">
			<div class="{PISTA} grid-cols-2" role="radiogroup" aria-label="Tipo de descuento">
				{#each [['FIJO', 'Bs'], ['PORCENTAJE', '%']] as const as [tipo, label] (tipo)}
					<button
						type="button"
						role="radio"
						aria-checked={tipoActual === tipo}
						aria-label={tipo === 'FIJO' ? 'Monto en bolivianos' : 'Porcentaje'}
						onclick={() => (descuentoGlobal = { tipo, valor: 0 })}
						class="{SEGMENTO} px-2.5 py-1 {tipoActual === tipo
							? SEGMENTO_ACTIVO
							: SEGMENTO_INACTIVO}"
					>
						{label}
					</button>
				{/each}
			</div>
			<Input
				class="w-24"
				type="number"
				size="sm"
				min="0"
				placeholder="0"
				aria-label="Valor del descuento"
				bind:value={descuentoGlobal.valor}
			/>
		</div>
	</div>
	{#if descuentoExcedido}
		<p class="text-right text-sm text-marca">El descuento supera el subtotal.</p>
	{/if}
</section>
