<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { PercentIcon, XIcon } from '$lib/icons/outline';
	import { Button, Input } from '$lib/components/ui';

	interface Props {
		descuentoTarget: 'global' | string;
		descuentoTipo: 'PORCENTAJE' | 'FIJO';
		descuentoValor: number;
		onCerrar: () => void;
		onAplicarDescuento: () => void;
		onCambiarTipo: (tipo: 'PORCENTAJE' | 'FIJO') => void;
	}

	let {
		descuentoTarget,
		descuentoTipo,
		descuentoValor = $bindable(),
		onCerrar,
		onAplicarDescuento,
		onCambiarTipo
	}: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-xs overflow-hidden rounded-3xl border border-light-four bg-light-one"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-four p-5">
			<div class="flex items-center gap-2.5">
				<div class="flex items-center justify-center">
					<PercentIcon class="h-6 w-6 text-light-three" />
				</div>
				<h3 class="font-bold text-light-black">
					{descuentoTarget === 'global' ? 'Descuento Global' : 'Descuento por ítem'}
				</h3>
			</div>
			<Button onclick={onCerrar} variant="ghost"><XIcon class="h-5 w-5" /></Button>
		</div>

		<div class="space-y-5 p-6">
			<div class="flex overflow-hidden rounded-2xl border border-light-one_d">
				{#each [['PORCENTAJE', '%'], ['FIJO', 'Bs']] as [tipo, label], index (index)}
					<button
						onclick={() => onCambiarTipo(tipo as any)}
						class="flex-1 border-r border-light-one_d py-3 text-sm font-bold transition last:border-0 {descuentoTipo ===
						tipo
							? 'bg-light-two text-light-one'
							: 'bg-light-one text-light-black hover:bg-light-two_d'}"
					>
						{label}
					</button>
				{/each}
			</div>

			<div class="text-center">
				<Input type="number" autofocus bind:value={descuentoValor} placeholder="0" size="xl" />
				<span class="mt-1.5 block text-xs text-light-five"
					>{descuentoTipo === 'PORCENTAJE' ? '% de descuento' : 'Bolivianos de descuento'}</span
				>
			</div>

			<div class="flex flex-col gap-2.5">
				<Button
					onclick={onAplicarDescuento}
					disabled={!descuentoValor || descuentoValor <= 0}
					variant="primary"
					fullWidth
				>
					Aplicar descuento
				</Button>
				
				<Button
					onclick={() => {
						descuentoValor = 0;
						onAplicarDescuento();
					}}
					variant="ghost"
					fullWidth
					class="text-light-error hover:bg-light-error/10 hover:text-light-error"
				>
					Quitar descuento
				</Button>
			</div>
	</div>
</div>
